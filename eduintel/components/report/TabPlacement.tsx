'use client';
import { Institution, PlacementYearStats } from '@/types/institution';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, TrendingUp, Building2, Users, DollarSign } from 'lucide-react';
import { formatLakhs, formatPhone } from '@/lib/utils';

interface Props { institution: Institution }

function MetricCard({ label, value, icon: Icon, color }: {
  label: string; value: string; icon: React.ElementType; color: string
}) {
  return (
    <div className={`p-4 rounded-xl border ${color}`}>
      <Icon className="h-4 w-4 mb-2 opacity-70" />
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs mt-0.5 opacity-70">{label}</p>
    </div>
  );
}

export function TabPlacement({ institution }: Props) {
  const { placement } = institution;
  const currentYear = placement.currentYear;
  const allStats = [currentYear, ...(placement.historicalStats || [])].filter(s => s.academicYear);

  return (
    <div className="space-y-6">
      {/* TPO Contact */}
      {(placement.directorName || placement.directorEmail) && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Placement Cell Contact</h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{placement.directorName || 'Placement Director'}</p>
                {placement.directorEmail && (
                  <a href={`mailto:${placement.directorEmail}`} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline mt-1">
                    <Mail className="h-3.5 w-3.5" />
                    {placement.directorEmail}
                  </a>
                )}
                {placement.directorPhone && (
                  <a href={`tel:${placement.directorPhone}`} className="flex items-center gap-1.5 text-sm text-slate-600 hover:underline mt-0.5">
                    <Phone className="h-3.5 w-3.5" />
                    {formatPhone(placement.directorPhone)}
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Year Metrics */}
      {currentYear && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">
              Current Year Metrics
              <span className="text-xs font-normal text-slate-400 ml-2">({currentYear.academicYear})</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {currentYear.totalOffers && (
                <MetricCard label="Total Offers" value={currentYear.totalOffers.toString()} icon={TrendingUp} color="border-indigo-100 bg-indigo-50 text-indigo-700" />
              )}
              {currentYear.placementRate && (
                <MetricCard label="Placement Rate" value={`${currentYear.placementRate}%`} icon={TrendingUp} color="border-emerald-100 bg-emerald-50 text-emerald-700" />
              )}
              {currentYear.highestCTC && (
                <MetricCard label="Highest CTC" value={formatLakhs(currentYear.highestCTC)} icon={DollarSign} color="border-amber-100 bg-amber-50 text-amber-700" />
              )}
              {currentYear.averageCTC && (
                <MetricCard label="Average CTC" value={formatLakhs(currentYear.averageCTC)} icon={DollarSign} color="border-purple-100 bg-purple-50 text-purple-700" />
              )}
              {currentYear.totalCompanies && (
                <MetricCard label="Companies" value={currentYear.totalCompanies.toString()} icon={Building2} color="border-blue-100 bg-blue-50 text-blue-700" />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Year-wise stats table */}
      {allStats.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Year-wise Placement Statistics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Year', 'Placed', 'Eligible', 'Rate %', 'Avg CTC', 'Highest CTC', 'Companies'].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allStats.map((s, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-slate-50/50' : ''}>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{s.academicYear}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.totalOffers?.toLocaleString('en-IN') || '—'}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.totalEligible?.toLocaleString('en-IN') || '—'}</td>
                      <td className="py-2.5 px-3">
                        {s.placementRate
                          ? <span className="text-emerald-600 font-medium">{s.placementRate}%</span>
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{s.averageCTC ? formatLakhs(s.averageCTC) : '—'}</td>
                      <td className="py-2.5 px-3 font-medium text-amber-600">{s.highestCTC ? formatLakhs(s.highestCTC) : '—'}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.totalCompanies || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dream Companies */}
      {(placement.superDreamCompanies?.length || placement.dreamCompanies?.length) && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Top Recruiters</h3>
            {placement.superDreamCompanies?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Super Dream (&#62;10 LPA)</p>
                <div className="flex flex-wrap gap-2">
                  {placement.superDreamCompanies.map((c, i) => (
                    <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {placement.dreamCompanies?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">Dream Companies</p>
                <div className="flex flex-wrap gap-2">
                  {placement.dreamCompanies.map((c, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-sm">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recruiters by sector */}
      {placement.recruiters?.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Recruiters</h3>
            <div className="flex flex-wrap gap-2">
              {placement.recruiters.map((r, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm border border-slate-200">
                  {r.name}
                  {r.tier === 'Super Dream' && <span className="ml-1 text-amber-500">★</span>}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
