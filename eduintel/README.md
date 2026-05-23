# EduIntel — Institutional Intelligence Platform

A production-ready personal-use intelligence dashboard for researching Indian higher education institutions. Auto-crawls official websites, uses Claude AI to extract structured data, and generates PDF/Excel reports.

## Features

- **Auto-crawl** — Fetches 15+ priority pages from institution websites (about, governance, placements, fees, contact, IQAC, etc.)
- **AI Extraction** — Claude claude-3-5-sonnet extracts structured data: management hierarchy, placements, fees, accreditations
- **8-tab Report View** — Profile, Accreditation, Affiliation, Management, Placement, Fees, Documents, Sources
- **Fee Manager** — Add/edit/delete programs with year-wise fees; auto-calculate totals; Indian number formatting (₹)
- **PDF Export** — Professional A4 report with cover page, all sections, NAAC badges, placement stats, fee tables
- **Excel Export** — Multi-sheet .xlsx with fee summary, program-wise fees, placement stats
- **Confidence Scoring** — Auto-recalculates as data is added or edited
- **Fully offline** — All data in localStorage; works after first load without internet
- **Vercel-ready** — Zero additional infrastructure needed

## Quick Start

### 1. Prerequisites

- Node.js 18+
- An Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

### 2. Install

```bash
cd eduintel
npm install
```

### 3. Configure environment

```bash
cp .env.local.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
```

Or set the API key in-app via **Settings → Anthropic API Key** (stored only in your browser).

### 4. Run locally

```bash
npm run dev
# Opens at http://localhost:3000
```

### 5. Deploy to Vercel

```bash
npm install -g vercel
vercel
# Set ANTHROPIC_API_KEY in Vercel dashboard → Project → Settings → Environment Variables
```

## Usage

### Research a new institution

1. Click **New Research** in the top navbar
2. Enter the institution name (required) + website URL / domain
3. Select which data sections to fetch (all checked by default)
4. Click **Start Intelligence Crawl**
5. Watch real-time progress as pages are crawled and AI extracts structured data
6. Report auto-opens on completion

### View & edit reports

- Click any institution card on the dashboard to open its 8-tab report
- **Edit Data** button — manually update any field (changes auto-save on blur)
- **Fee Structure tab** — add/edit/delete program fees with auto-calculated totals
- **Management tab** — flag low-confidence contacts for review
- **Re-crawl** button — merges new data without overwriting manual edits

### Export

- **Download PDF** — full intelligence report as A4 PDF (from card or report header)
- **Excel** — fee structure as multi-sheet .xlsx (from Fee Structure tab toolbar)
- **CSV** — any fee table has a CSV export button
- **Settings → Export All Data** — full JSON backup of all institutions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI primitives |
| Icons | lucide-react |
| Storage | localStorage (no database required) |
| Web Scraping | fetch() + cheerio (server-side API route) |
| AI Extraction | Anthropic claude-3-5-sonnet |
| PDF Export | jspdf + jspdf-autotable |
| Excel Export | exceljs |
| Deployment | Vercel |

## Project Structure

```
eduintel/
├── app/
│   ├── page.tsx                    # Dashboard
│   ├── new/page.tsx                # New Research form
│   ├── institution/[id]/
│   │   ├── page.tsx                # 8-tab report view
│   │   ├── edit/page.tsx           # Edit institution data
│   │   └── fees/page.tsx           # Fee manager
│   ├── settings/page.tsx           # Settings
│   └── api/
│       ├── crawl/route.ts          # Crawl + AI enrichment SSE stream
│       └── export/pdf|excel/route.ts
├── components/
│   ├── ui/                         # Button, Card, Dialog, Select, Tabs...
│   ├── dashboard/                  # InstitutionCard, StatsBar, SearchBar
│   ├── report/                     # Tab* components
│   ├── fees/                       # AddFeeModal
│   └── crawl/                      # CrawlProgress
├── hooks/
│   ├── useInstitutions.ts          # CRUD for master list
│   ├── useInstitution.ts           # Single institution CRUD
│   └── useLocalStorage.ts          # Generic hook
├── lib/
│   ├── claude.ts                   # Anthropic API wrapper
│   ├── crawl.ts                    # cheerio page extraction helpers
│   ├── pdf.ts                      # jspdf report generator
│   ├── excel.ts                    # exceljs generator
│   ├── storage.ts                  # localStorage helpers
│   └── utils.ts                    # formatters, confidence scorer
├── types/
│   └── institution.ts              # All TypeScript interfaces + constants
└── vercel.json
```

## Confidence Score

Auto-calculated based on data completeness across 6 weighted sections:

| Section | Weight | Signals |
|---------|--------|---------|
| Profile | 20% | Contacts, address, vision/mission, founder |
| Accreditation | 15% | NAAC grade, NIRF rank, NBA, UGC |
| Management | 20% | High-confidence contacts with email/phone |
| Placement | 20% | TPO contact, stats, dream companies |
| Fees | 15% | Programs with year-wise fee details |
| Documents | 10% | Live document links |

**Score colors:** Green ≥80% | Yellow 60–79% | Red <60%

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Optional* | Anthropic API key for Claude AI extraction |

*Can also be set in-app via Settings. Without it, crawl still runs but skips AI enrichment.

## Data Storage

All data lives in your browser's `localStorage`:
- `eduintel_institutions` — master list of all institutions
- `eduintel_institution_{id}` — full data per institution
- `eduintel_settings` — API key and preferences

**Capacity:** ~5MB per origin, suitable for 30–50 institutions. For larger use, consider migrating to IndexedDB via the `idb` library.

## Notes

- **Personal use** — no server, no database, no accounts required
- **Crawl limitations** — some sites block automated fetches; those pages show "Not found — manual entry available"
- **No hallucination** — Claude is instructed to return `null` for any data not found on the actual page
- Fee amounts are stored as plain numbers; formatted with ₹ / lakh notation in the UI
- The `/api/crawl` route streams progress via SSE (Server-Sent Events) for real-time UI updates
