'use client';
import { Institution } from '@/types/institution';
import { Card, CardContent } from '@/components/ui/card';
import { getNaacBadgeColor } from '@/lib/utils';
import { Award, Star, CheckCircle2, XCircle } from 'lucide-react';

interface Props { institution: Institution }

function YesNo({ value }: { value?: boolean }) {
  if (value === undefined) return <span className="text-slate-300">—</span>;
  return value
    ? <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />Yes</span>
    : <span className="flex items-center gap-1 text-red-500"><XCircle className="h-3.5 w-3.5" />No</span>;
}

export function TabAccreditation({ institution }: Props) {
  const { accreditation, affiliation } = institution;

  const rows = [
    accreditation.naac && {
      body: 'NAAC',
      status: 'Accredited',
      gradeRank: <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getNaacBadgeColor(accreditation.naac.grade)}`}>{accreditation.naac.grade}</span>,
      cycle: `Cycle ${accreditation.naac.cycle}`,
      year: accreditation.naac.year,
      notes: accreditation.naac.cgpa ? `CGPA: ${accreditation.naac.cgpa}` : '',
    },
    accreditation.nirf && {
      body: 'NIRF',
      status: 'Ranked',
      gradeRank: `#${accreditation.nirf.rank}`,
      cycle: accreditation.nirf.category,
      year: accreditation.nirf.year,
      notes: accreditation.nirf.score ? `Score: ${accreditation.nirf.score}` : '',
    },
    accreditation.nba && {
      body: 'NBA',
      status: 'Accredited',
      gradeRank: `${accreditation.nba.programCount} programs`,
      cycle: '—',
      year: accreditation.nba.year || '—',
      notes: accreditation.nba.programs?.slice(0, 3).join(', '),
    },
    ...(accreditation.otherRankings?.map(r => ({
      body: r.body,
      status: 'Ranked',
      gradeRank: r.rank ? `#${r.rank}` : '—',
      cycle: r.category || '—',
      year: r.year || '—',
      notes: r.notes || '',
    })) || []),
  ].filter(Boolean) as Array<{ body: string; status: string; gradeRank: string | React.ReactNode; cycle: string | number; year: string | number; notes?: string }>;

  return (
    <div className="space-y-6">
      {/* Main accreditation table */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-indigo-500" />
            Accreditation & Rankings
          </h3>
          {rows.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No accreditation data found. Add manually via Edit.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Body</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Grade / Rank</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Cycle / Category</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Year</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-slate-50/50' : ''}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{row.body}</td>
                      <td className="py-2.5 px-3 text-slate-600">{row.status}</td>
                      <td className="py-2.5 px-3">{row.gradeRank}</td>
                      <td className="py-2.5 px-3 text-slate-600">{row.cycle}</td>
                      <td className="py-2.5 px-3 text-slate-600">{row.year}</td>
                      <td className="py-2.5 px-3 text-slate-500 text-xs">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* UGC / Regulatory status */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
            Regulatory Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-400">UGC Category</p>
              <p className="text-sm font-medium text-slate-900 mt-0.5">{accreditation.ugcCategory || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">UGC Under 12B</p>
              <div className="mt-0.5"><YesNo value={accreditation.ugc12B} /></div>
            </div>
            <div>
              <p className="text-xs text-slate-400">AICTE Approved</p>
              <div className="mt-0.5"><YesNo value={accreditation.aicteApproved} /></div>
            </div>
            <div>
              <p className="text-xs text-slate-400">Autonomous Status</p>
              <div className="mt-0.5"><YesNo value={accreditation.autonomousStatus} /></div>
            </div>
            {affiliation && (
              <>
                <div>
                  <p className="text-xs text-slate-400">Affiliated To</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">{affiliation.affiliatedTo || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">AICTE Approval No.</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">{affiliation.aicteApprovalNumber || '—'}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* NBA programs */}
      {accreditation.nba && accreditation.nba.programs.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900 mb-3">NBA Accredited Programs</h3>
            <div className="flex flex-wrap gap-2">
              {accreditation.nba.programs.map((p, i) => (
                <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">
                  {p}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
