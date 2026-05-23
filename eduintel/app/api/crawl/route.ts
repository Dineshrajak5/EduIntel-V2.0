import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { extractWithClaude } from '@/lib/claude';
import { Institution, InstitutionProfile, AccreditationData, AffiliationData, PlacementData, ManagementContact } from '@/types/institution';
import { generateId, calculateConfidenceScore } from '@/lib/utils';

const PRIORITY_PATHS = [
  '/',
  '/about-us',
  '/about-us/administration',
  '/about-us/committee/board-of-management',
  '/about-us/accreditation-and-accolades',
  '/governance',
  '/placements',
  '/placements/contact-us',
  '/placements/recruitments',
  '/placements/dream-companies-and-offer',
  '/placements/employability-training/placement-statistics',
  '/contact-us',
  '/iqac',
  '/admissions',
  '/fees',
  '/mandatory-disclosure',
];

async function fetchPage(url: string): Promise<{ html: string; ok: boolean }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EduIntel/1.0)',
        Accept: 'text/html,application/xhtml+xml,*/*',
      },
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!res.ok) return { html: '', ok: false };
    const html = await res.text();
    return { html, ok: true };
  } catch {
    return { html: '', ok: false };
  }
}

function extractFromPage(html: string, url: string): string {
  const $ = cheerio.load(html);
  $('script, style, nav, footer, header, .nav, .navbar, .footer, .sidebar, iframe').remove();

  const parts: string[] = [`=== ${url} ===`];

  // Extract tables
  $('table').each((_, t) => {
    const rows: string[] = [];
    $(t).find('tr').each((_, tr) => {
      const cells = $(tr).find('th, td').map((_, td) => $(td).text().trim().replace(/\s+/g, ' ')).get();
      if (cells.some(c => c)) rows.push(cells.join(' | '));
    });
    if (rows.length) parts.push('[TABLE]\n' + rows.slice(0, 50).join('\n') + '\n[/TABLE]');
  });

  // Headings + content
  $('h1, h2, h3, h4, h5').each((_, h) => {
    const text = $(h).text().trim();
    if (text) {
      const sibling = $(h).next().text().trim().slice(0, 500);
      parts.push(`\n## ${text}\n${sibling}`);
    }
  });

  // Body text
  const body = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 4000);
  parts.push(body);

  // Emails and phones
  const fullText = $('body').text();
  const emails = [...new Set(fullText.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || [])];
  const phones = [...new Set(fullText.match(/(?:\+91[\s-]?)?[6-9]\d{9}|0\d{2,4}[-\s]\d{6,8}/g) || [])];
  if (emails.length) parts.push('[EMAILS] ' + emails.slice(0, 20).join(', '));
  if (phones.length) parts.push('[PHONES] ' + phones.slice(0, 20).join(', '));

  return parts.join('\n');
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = await request.json();
    const { name, url: websiteUrl, domain, linkedin, institutionType, state, city, selectedSections, apiKey } = body;

    if (!name) {
      return NextResponse.json({ error: 'Institution name is required' }, { status: 400 });
    }

    const baseUrl = (websiteUrl || `https://${domain}`).replace(/\/$/, '');
    const crawledTexts: string[] = [];
    const progressSteps: Array<{ step: string; status: string; message?: string }> = [];

    // Stream progress using ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        // Crawl pages
        for (const path of PRIORITY_PATHS) {
          const pageUrl = `${baseUrl}${path}`;
          const step = { step: `Fetching ${path}`, status: 'running' };
          progressSteps.push(step);
          send({ type: 'progress', step: step.step, status: 'running' });

          const { html, ok } = await fetchPage(pageUrl);

          if (ok && html) {
            const text = extractFromPage(html, pageUrl);
            crawledTexts.push(text);
            step.status = 'success';
            send({ type: 'progress', step: step.step, status: 'success', message: `${text.length} chars extracted` });
          } else {
            step.status = 'warning';
            send({ type: 'progress', step: step.step, status: 'warning', message: 'Not found — manual entry available' });
          }
        }

        // AI Enrichment
        send({ type: 'progress', step: 'Running AI enrichment with Claude...', status: 'running' });

        let extracted: Awaited<ReturnType<typeof extractWithClaude>> = {};

        if (crawledTexts.length > 0) {
          const rawText = `Institution: ${name}\nWebsite: ${websiteUrl}\nDomain: ${domain}\nLinkedIn: ${linkedin || 'N/A'}\nType: ${institutionType || 'Unknown'}\nState: ${state || 'Unknown'}\nCity: ${city || 'Unknown'}\n\n` + crawledTexts.join('\n\n---\n\n');

          const effectiveApiKey = apiKey || process.env.ANTHROPIC_API_KEY;
          if (effectiveApiKey) {
            try {
              extracted = await extractWithClaude(rawText, effectiveApiKey);
              send({ type: 'progress', step: 'Running AI enrichment with Claude...', status: 'success', message: 'Data extracted successfully' });
            } catch (err) {
              send({ type: 'progress', step: 'Running AI enrichment with Claude...', status: 'warning', message: `AI extraction failed: ${err instanceof Error ? err.message : 'Unknown error'}` });
            }
          } else {
            send({ type: 'progress', step: 'Running AI enrichment with Claude...', status: 'warning', message: 'No API key — using raw crawl data only' });
          }
        }

        // Build institution object
        send({ type: 'progress', step: 'Building institution profile...', status: 'running' });

        const profile: InstitutionProfile = {
          name,
          type: (institutionType as InstitutionProfile['type']) || 'Engineering College',
          address: '',
          city: city || extracted.profile?.city || '',
          state: state || extracted.profile?.state || '',
          website: websiteUrl || `https://${domain}`,
          domain: domain || '',
          ...(extracted.profile as Partial<InstitutionProfile> || {}),
          linkedin: linkedin || extracted.profile?.linkedin,
        };

        const management: ManagementContact[] = (extracted.management || [])
          .filter(m => m?.name)
          .map(m => ({
            id: generateId(),
            name: m.name!,
            designation: m.designation || '',
            category: m.category || 'administration',
            qualification: m.qualification,
            email: m.email,
            phone: m.phone,
            confidence: m.confidence || 'medium',
            source: m.source || 'AI Extraction',
            notes: m.notes,
          })) as ManagementContact[];

        const placement: PlacementData = {
          currentYear: { academicYear: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString().slice(2) },
          historicalStats: [],
          recruiters: [],
          dreamCompanies: [],
          superDreamCompanies: [],
          ...(extracted.placement as Partial<PlacementData> || {}),
        };

        const fees = (extracted.fees || [])
          .filter(f => f?.programName)
          .map(f => ({
            id: generateId(),
            programName: f.programName!,
            degreeType: f.degreeType || 'B.E.',
            duration: f.duration || 4,
            department: f.department,
            annualFees: f.annualFees || {},
            admissionFee: f.admissionFee,
            hostelFeePerYear: f.hostelFeePerYear,
            totalFees: f.totalFees,
            feeSource: f.feeSource || 'AI Extraction',
            academicYear: f.academicYear || '2024-25',
            lastUpdated: new Date().toISOString(),
          }));

        const documents = (extracted.documents || [])
          .filter(d => d?.name)
          .map(d => ({
            id: generateId(),
            name: d.name!,
            type: (d.type as 'AQAR' | 'SSR' | 'Mandatory Disclosure' | 'Annual Report' | 'Placement Brochure' | 'Other') || 'Other',
            year: d.year,
            url: d.url || '',
            status: ('Live' as const),
          }));

        const institution: Institution = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profile,
          accreditation: (extracted.accreditation as AccreditationData) || {},
          affiliation: (extracted.affiliation as AffiliationData) || {},
          management,
          placement,
          fees,
          documents,
          sources: [
            {
              section: 'Web Crawl',
              score: crawledTexts.length > 5 ? 70 : crawledTexts.length * 10,
              sourceUrl: websiteUrl,
              verificationMethod: 'Automated fetch + AI extraction',
              status: crawledTexts.length > 0 ? 'Verified' : 'Failed',
            },
          ],
          confidenceScore: 0,
        };

        institution.confidenceScore = calculateConfidenceScore(institution);

        send({ type: 'progress', step: 'Building institution profile...', status: 'success' });
        send({ type: 'complete', institution });
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
