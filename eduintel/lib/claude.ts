import Anthropic from '@anthropic-ai/sdk';
import { Institution } from '@/types/institution';

const SYSTEM_PROMPT = `You are an institutional intelligence extraction agent for Indian higher education. Given raw text scraped from official college websites, extract and return structured JSON.

Extract:
- Institution profile (name, type, year, founder, vision, mission, contacts, address, stats)
- Management hierarchy (names, designations, emails, phones, category)
- Accreditation details (NAAC grade/year/cycle/CGPA, NIRF rank/year, NBA programs, UGC status, AICTE)
- Affiliation information (affiliated university, approval numbers)
- Placement data (TPO contacts, year-wise stats, companies, packages, dream companies)
- Fee structure per program per year (all amounts in INR numbers only)
- Documents and URLs (AQAR, SSR, mandatory disclosure, placement brochure)
- Rankings (NIRF, QS, THE, ATAL, ARIIA, etc.)

For each data point, include a confidence field: "high" (directly stated), "medium" (inferred), "low" (partial/uncertain).

CRITICAL RULES:
- Never hallucinate. If data is not found, return null for that field.
- Fee amounts must be plain numbers (no ₹ symbol, no commas). E.g., 150000 not "1,50,000".
- Phone numbers should include country code if available.
- Return ONLY valid JSON, no markdown, no explanation.
- Infer institution type from context: "Engineering College", "Arts & Science", "University", "Deemed University", "Autonomous Institution", "Pharmacy", "Management", "Medical", "Polytechnic"
- Contact categories: "sponsoring_body", "academic_leadership", "administration", "placement", "student_affairs", "finance", "admissions", "board_member"`;

export interface ClaudeExtractionResult {
  profile?: Partial<Institution['profile']>;
  accreditation?: Partial<Institution['accreditation']>;
  affiliation?: Partial<Institution['affiliation']>;
  management?: Partial<Institution['management'][0]>[];
  placement?: Partial<Institution['placement']>;
  fees?: Partial<Institution['fees'][0]>[];
  documents?: Partial<Institution['documents'][0]>[];
  sources?: Partial<Institution['sources'][0]>[];
}

export async function extractWithClaude(
  rawText: string,
  apiKey: string
): Promise<ClaudeExtractionResult> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: false });

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Extract institutional intelligence from this scraped content:\n\n${rawText.slice(0, 50000)}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  // Strip markdown code blocks if present
  let json = content.text.trim();
  if (json.startsWith('```')) {
    json = json.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  return JSON.parse(json) as ClaudeExtractionResult;
}
