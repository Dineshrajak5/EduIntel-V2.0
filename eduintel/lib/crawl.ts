import * as cheerio from 'cheerio';

export interface CrawlResult {
  url: string;
  text: string;
  success: boolean;
  error?: string;
}

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

async function fetchPage(url: string, timeoutMs = 10000): Promise<{ html: string; ok: boolean }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EduIntel/1.0; +https://eduintel.vercel.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!response.ok) return { html: '', ok: false };
    const html = await response.text();
    return { html, ok: true };
  } catch {
    return { html: '', ok: false };
  }
}

function extractText($: ReturnType<typeof cheerio.load>): string {
  // Remove scripts, styles, nav, footer to reduce noise
  $('script, style, nav, footer, header, .nav, .navbar, .footer, .sidebar').remove();
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  return text;
}

function extractStructured($: ReturnType<typeof cheerio.load>): string {
  const parts: string[] = [];

  // Extract tables
  $('table').each((_, table) => {
    const rows: string[] = [];
    $(table).find('tr').each((_, tr) => {
      const cells = $(tr).find('th, td').map((_, td) => $(td).text().trim()).get();
      if (cells.some(c => c)) rows.push(cells.join(' | '));
    });
    if (rows.length) parts.push('[TABLE]\n' + rows.join('\n') + '\n[/TABLE]');
  });

  // Extract definition lists
  $('dl').each((_, dl) => {
    const items: string[] = [];
    $(dl).find('dt').each((_, dt) => {
      const dd = $(dt).next('dd');
      items.push(`${$(dt).text().trim()}: ${dd.text().trim()}`);
    });
    if (items.length) parts.push(items.join('\n'));
  });

  // Extract headings with following paragraphs
  $('h1, h2, h3, h4').each((_, h) => {
    const heading = $(h).text().trim();
    const next = $(h).next('p, ul, ol').text().trim();
    if (heading) parts.push(`## ${heading}\n${next}`);
  });

  // Extract contact info patterns
  const bodyText = $('body').text();
  const emailMatches = bodyText.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || [];
  const phoneMatches = bodyText.match(/(?:\+91[\s-]?)?[6-9]\d{9}|0\d{2,4}[-\s]\d{6,8}/g) || [];

  if (emailMatches.length) parts.push('[EMAILS] ' + [...new Set(emailMatches)].join(', '));
  if (phoneMatches.length) parts.push('[PHONES] ' + [...new Set(phoneMatches)].join(', '));

  return parts.join('\n\n');
}

export async function crawlInstitution(
  domain: string,
  websiteUrl: string,
  onProgress: (path: string, success: boolean) => void
): Promise<string> {
  const baseUrl = websiteUrl.replace(/\/$/, '') || `https://${domain}`;
  const allText: string[] = [];
  const visited = new Set<string>();

  for (const path of PRIORITY_PATHS) {
    const url = `${baseUrl}${path}`;
    if (visited.has(url)) continue;
    visited.add(url);

    const { html, ok } = await fetchPage(url);
    onProgress(path, ok);

    if (ok && html) {
      const $ = cheerio.load(html);
      const plain = extractText($);
      const structured = extractStructured($);
      allText.push(`=== PAGE: ${url} ===\n${structured}\n\n${plain.slice(0, 3000)}`);
    }
  }

  return allText.join('\n\n---\n\n');
}
