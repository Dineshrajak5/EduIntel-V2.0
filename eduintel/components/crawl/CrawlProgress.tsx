'use client';
import { CheckCircle2, AlertTriangle, Loader2, Clock } from 'lucide-react';
import { CrawlProgress as CrawlProgressType } from '@/types/institution';
import { cn } from '@/lib/utils';

interface Props {
  steps: CrawlProgressType[];
}

const StatusIcon = ({ status }: { status: CrawlProgressType['status'] }) => {
  switch (status) {
    case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
    case 'error': return <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />;
    case 'running': return <Loader2 className="h-4 w-4 text-indigo-500 animate-spin shrink-0" />;
    default: return <Clock className="h-4 w-4 text-slate-300 shrink-0" />;
  }
};

export function CrawlProgress({ steps }: Props) {
  const done = steps.filter(s => s.status === 'success' || s.status === 'warning').length;
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Crawl Progress</h3>
        <span className="text-sm font-medium text-indigo-600">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-5">
        <div
          className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Step list */}
      <div className="space-y-2.5">
        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
              step.status === 'running' && 'bg-indigo-50',
              step.status === 'success' && 'bg-emerald-50',
              step.status === 'warning' && 'bg-amber-50',
              step.status === 'error' && 'bg-red-50',
              step.status === 'pending' && 'bg-slate-50',
            )}
          >
            <StatusIcon status={step.status} />
            <div className="flex-1 min-w-0">
              <p className={cn(
                'font-medium truncate',
                step.status === 'success' && 'text-emerald-700',
                step.status === 'warning' && 'text-amber-700',
                step.status === 'error' && 'text-red-700',
                step.status === 'running' && 'text-indigo-700',
                step.status === 'pending' && 'text-slate-400',
              )}>
                {step.step}
              </p>
              {step.message && (
                <p className="text-xs text-slate-500 mt-0.5 truncate">{step.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
