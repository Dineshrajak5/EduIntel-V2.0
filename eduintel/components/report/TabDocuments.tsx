'use client';
import { Institution, InstitutionDocument } from '@/types/institution';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle2, XCircle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { institution: Institution }

const TYPE_COLORS: Record<InstitutionDocument['type'], string> = {
  'AQAR': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'SSR': 'bg-purple-50 text-purple-700 border-purple-100',
  'Mandatory Disclosure': 'bg-amber-50 text-amber-700 border-amber-100',
  'Annual Report': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Placement Brochure': 'bg-blue-50 text-blue-700 border-blue-100',
  'Other': 'bg-slate-50 text-slate-600 border-slate-100',
};

export function TabDocuments({ institution }: Props) {
  const { documents } = institution;

  if (!documents.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p>No documents found. Add links manually via Edit.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-semibold text-slate-900 mb-4">IQAC & Official Documents</h3>
        <div className="space-y-2">
          {documents.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm text-slate-900">{doc.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${TYPE_COLORS[doc.type]}`}>
                    {doc.type}
                  </span>
                  {doc.year && (
                    <span className="text-xs text-slate-400">{doc.year}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {doc.status === 'Live' ? (
                  <span title="Live"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></span>
                ) : doc.status === 'Broken' ? (
                  <span title="Broken"><XCircle className="h-4 w-4 text-red-400" /></span>
                ) : (
                  <span title="Downloaded"><Download className="h-4 w-4 text-blue-400" /></span>
                )}
                {doc.url && (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-200 rounded-md hover:bg-slate-50 text-slate-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
