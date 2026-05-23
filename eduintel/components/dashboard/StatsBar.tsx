import { Institution } from '@/types/institution';
import { Building2, TrendingUp, Phone } from 'lucide-react';

interface Props {
  institutions: Institution[];
}

export function StatsBar({ institutions }: Props) {
  const totalInstitutions = institutions.length;
  const avgConfidence = totalInstitutions
    ? Math.round(institutions.reduce((s, i) => s + i.confidenceScore, 0) / totalInstitutions)
    : 0;
  const totalContacts = institutions.reduce((s, i) => s + i.management.length, 0);

  const stats = [
    {
      label: 'Total Institutions',
      value: totalInstitutions,
      icon: Building2,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Avg Confidence Score',
      value: `${avgConfidence}%`,
      icon: TrendingUp,
      color: avgConfidence >= 80 ? 'text-emerald-600 bg-emerald-50' : avgConfidence >= 60 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50',
    },
    {
      label: 'Total Contacts Found',
      value: totalContacts,
      icon: Phone,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(stat => (
        <div key={stat.label} className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${stat.color}`}>
            <stat.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
