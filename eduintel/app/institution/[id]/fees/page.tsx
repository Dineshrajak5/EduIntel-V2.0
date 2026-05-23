'use client';
import { use } from 'react';
import Link from 'next/link';
import { useInstitution } from '@/hooks/useInstitution';
import { TabFees } from '@/components/report/TabFees';
import { ProgramFee } from '@/types/institution';
import { calculateConfidenceScore } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

export default function FeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { institution, isLoaded, update } = useInstitution(id);

  if (!isLoaded) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" /></div>;
  if (!institution) return <div className="text-center py-20 text-slate-400">Institution not found.</div>;

  const handleFeesUpdate = (fees: ProgramFee[]) => {
    const updated = { ...institution, fees, updatedAt: new Date().toISOString() };
    updated.confidenceScore = calculateConfidenceScore(updated);
    update(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/institution/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Report
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Fee Structure Manager</h1>
        <p className="text-sm text-slate-500">{institution.profile.name}</p>
      </div>
      <TabFees institution={institution} onUpdate={handleFeesUpdate} />
    </div>
  );
}
