'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useInstitutions } from '@/hooks/useInstitutions';
import { InstitutionCard } from '@/components/dashboard/InstitutionCard';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { Button } from '@/components/ui/button';
import { GraduationCap, Plus, ArrowRight, FlaskConical } from 'lucide-react';
import { seedDemoData } from '@/lib/seed';

export default function Dashboard() {
  const { institutions, isLoaded, deleteInstitution, persist } = useInstitutions();
  const [query, setQuery] = useState('');

  const filtered = institutions.filter(inst =>
    !query ||
    inst.profile.name.toLowerCase().includes(query.toLowerCase()) ||
    inst.profile.city?.toLowerCase().includes(query.toLowerCase()) ||
    inst.profile.state?.toLowerCase().includes(query.toLowerCase()) ||
    inst.profile.type.toLowerCase().includes(query.toLowerCase())
  );

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!institutions.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-100 mb-6">
          <GraduationCap className="h-10 w-10 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Welcome to EduIntel</h1>
        <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg">
          Your personal Institutional Intelligence Platform for Indian Higher Education.
          Start by researching your first institution.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Link href="/new">
            <Button size="lg" className="gap-2 text-base px-8">
              Research your first institution
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="gap-2 text-base"
            onClick={() => {
              seedDemoData();
              window.location.reload();
            }}
          >
            <FlaskConical className="h-5 w-5" />
            Load Demo Data
          </Button>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
          {[
            { title: 'Auto-crawl websites', desc: 'Automatically extracts data from official college portals, contact pages, placement pages, and fee structures.' },
            { title: 'AI-powered extraction', desc: 'Claude AI structures raw HTML into clean management hierarchies, placement stats, fees, and accreditation data.' },
            { title: 'PDF & Excel exports', desc: 'Generate professional intelligence reports and fee structure spreadsheets with one click.' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Institution Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">{institutions.length} institutions researched</p>
        </div>
        <Link href="/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Research
          </Button>
        </Link>
      </div>

      <StatsBar institutions={institutions} />
      <SearchBar value={query} onChange={setQuery} />

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p>No institutions match &ldquo;{query}&rdquo;</p>
          <button className="mt-2 text-sm text-indigo-600 hover:underline" onClick={() => setQuery('')}>
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(inst => (
            <InstitutionCard key={inst.id} institution={inst} onDelete={deleteInstitution} />
          ))}
        </div>
      )}
    </div>
  );
}
