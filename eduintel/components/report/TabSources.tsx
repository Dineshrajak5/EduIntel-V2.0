'use client';
import { Institution } from '@/types/institution';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, XCircle, Edit } from 'lucide-react';
import { getConfidenceColor, getConfidenceLabel } from '@/lib/utils';

interface Props { institution: Institution }

const STATUS_ICONS = {
  Verified: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  Partial: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  Failed: <XCircle className="h-4 w-4 text-red-400" />,
  Manual: <Edit className="h-4 w-4 text-blue-400" />,
};

export function TabSources({ institution }: Props) {
  const { sources, confidenceScore } = institution;

  return (
    <div className="space-y-6">
      {/* Overall confidence */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Overall Confidence Score</h3>
            <span className={`text-lg font-bold px-3 py-1 rounded-lg border ${getConfidenceColor(confidenceScore)}`}>
              {confidenceScore}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                confidenceScore >= 80 ? 'bg-emerald-500'
                : confidenceScore >= 60 ? 'bg-amber-500'
                : 'bg-red-500'
              }`}
              style={{ width: `${confidenceScore}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 mt-2">{getConfidenceLabel(confidenceScore)}</p>
        </CardContent>
      </Card>

      {/* Sources table */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Source References & Confidence</h3>
          {sources.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No source references recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Section</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Score</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Source URL</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Method</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-slate-50/50' : ''}>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{s.section}</td>
                      <td className="py-2.5 px-3">
                        <span className={`font-medium ${getConfidenceColor(s.score)}`}>{s.score}%</span>
                      </td>
                      <td className="py-2.5 px-3">
                        {s.sourceUrl
                          ? <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-xs truncate max-w-xs block">{s.sourceUrl}</a>
                          : <span className="text-slate-400">—</span>
                        }
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-xs">{s.verificationMethod}</td>
                      <td className="py-2.5 px-3">
                        <span className="flex items-center gap-1">
                          {STATUS_ICONS[s.status as keyof typeof STATUS_ICONS]}
                          <span className="text-xs">{s.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
