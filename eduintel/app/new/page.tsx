'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CrawlProgress } from '@/components/crawl/CrawlProgress';
import { INDIAN_STATES, CrawlProgress as CrawlProgressType, Institution } from '@/types/institution';
import { storage } from '@/lib/storage';
import { ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';

const INSTITUTION_TYPES = [
  'Engineering College', 'Arts & Science', 'University',
  'Deemed University', 'Autonomous Institution', 'Pharmacy',
  'Management', 'Medical', 'Polytechnic',
];

const DATA_SECTIONS = [
  { id: 'profile', label: 'Institution Profile & History' },
  { id: 'accreditation', label: 'Accreditation & Rankings (NAAC, NIRF, NBA, ABET)' },
  { id: 'affiliation', label: 'Affiliation & Regulatory Status' },
  { id: 'management', label: 'Management Hierarchy' },
  { id: 'contacts', label: 'Key Contacts (Emails & Phones)' },
  { id: 'placement', label: 'Placement Ecosystem (Statistics, Recruiters, Packages)' },
  { id: 'fees', label: 'Fee Structure (Per Program, Per Year)' },
  { id: 'iqac', label: 'IQAC / AQAR Documents' },
  { id: 'disclosure', label: 'Mandatory Disclosure' },
  { id: 'research', label: 'Research & Publications Data' },
  { id: 'infrastructure', label: 'Infrastructure & Facilities' },
];

type Step = 'form' | 'crawling' | 'done';

export default function NewResearchPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState({
    name: '',
    url: '',
    domain: '',
    linkedin: '',
    institutionType: '',
    state: '',
    city: '',
  });
  const [selectedSections, setSelectedSections] = useState<string[]>(DATA_SECTIONS.map(s => s.id));
  const [crawlSteps, setCrawlSteps] = useState<CrawlProgressType[]>([]);
  const [error, setError] = useState('');

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleSection = (id: string) => {
    setSelectedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const startCrawl = async () => {
    if (!form.name.trim()) {
      setError('Institution name is required');
      return;
    }
    setError('');
    setStep('crawling');
    setCrawlSteps([]);

    const settings = storage.getSettings();
    const apiKey = settings.anthropicApiKey;

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, selectedSections, apiKey }),
      });

      if (!response.ok) {
        throw new Error(`Crawl failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response stream');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const data = JSON.parse(line.slice(6));

          if (data.type === 'progress') {
            setCrawlSteps(prev => {
              const existing = prev.findIndex(s => s.step === data.step);
              const newStep: CrawlProgressType = {
                step: data.step,
                status: data.status as CrawlProgressType['status'],
                message: data.message,
              };
              if (existing >= 0) {
                const next = [...prev];
                next[existing] = newStep;
                return next;
              }
              return [...prev, newStep];
            });
          }

          if (data.type === 'complete' && data.institution) {
            storage.saveInstitution(data.institution as Institution);
            setStep('done');
            setTimeout(() => router.push(`/institution/${(data.institution as Institution).id}`), 1500);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Crawl failed');
      setStep('form');
    }
  };

  if (step === 'done') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Zap className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Research Complete!</h2>
        <p className="text-slate-500">Redirecting to institution report...</p>
      </div>
    );
  }

  if (step === 'crawling') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Crawling: {form.name}</h1>
          <p className="text-slate-500 text-sm mt-1">Please wait while we gather intelligence...</p>
        </div>
        <CrawlProgress steps={crawlSteps} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">New Institution Research</h1>
        <p className="text-slate-500 text-sm mt-1">
          Enter institution details — EduIntel will auto-crawl and extract intelligence data.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1 — Basic Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">1</span>
            Institution Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="name">College / University Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g., Sri Venkateswara College of Engineering"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="url">Official Website URL</Label>
              <Input
                id="url"
                value={form.url}
                onChange={e => set('url', e.target.value)}
                placeholder="https://svce.ac.in"
                type="url"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                value={form.domain}
                onChange={e => set('domain', e.target.value)}
                placeholder="svce.ac.in"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                value={form.linkedin}
                onChange={e => set('linkedin', e.target.value)}
                placeholder="https://linkedin.com/school/..."
                type="url"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Institution Type</Label>
              <Select value={form.institutionType} onValueChange={v => set('institutionType', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {INSTITUTION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>State</Label>
              <Select value={form.state} onValueChange={v => set('state', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select state..." />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={e => set('city', e.target.value)}
                placeholder="e.g., Chennai"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Step 2 — Data Sources */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">2</span>
              Select Data Sources to Fetch
            </h2>
            <div className="flex gap-2">
              <button
                className="text-xs text-indigo-600 hover:underline"
                onClick={() => setSelectedSections(DATA_SECTIONS.map(s => s.id))}
              >
                Select all
              </button>
              <span className="text-slate-300">|</span>
              <button
                className="text-xs text-slate-400 hover:underline"
                onClick={() => setSelectedSections([])}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DATA_SECTIONS.map(section => (
              <label
                key={section.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selectedSections.includes(section.id)}
                  onCheckedChange={() => toggleSection(section.id)}
                  className="mt-0.5"
                />
                <span className="text-sm text-slate-700">{section.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Step 3 — Launch */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">3</span>
            Start Intelligence Crawl
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            EduIntel will crawl {form.url || (form.domain ? `https://${form.domain}` : 'the institution website')},
            extract data using AI, and build a structured intelligence report.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            onClick={startCrawl}
            size="lg"
            className="gap-2 w-full sm:w-auto"
            disabled={!form.name.trim()}
          >
            <Zap className="h-4 w-4" />
            Start Intelligence Crawl
          </Button>
        </div>
      </div>
    </div>
  );
}
