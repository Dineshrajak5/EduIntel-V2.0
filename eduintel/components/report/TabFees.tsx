'use client';
import { useState } from 'react';
import { Institution, ProgramFee } from '@/types/institution';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddFeeModal } from '@/components/fees/AddFeeModal';
import { Plus, Edit2, Trash2, Download, ArrowUpDown } from 'lucide-react';
import { formatIndianCurrency, formatLakhs, exportToCSV } from '@/lib/utils';
import { generateExcel } from '@/lib/excel';

interface Props {
  institution: Institution;
  onUpdate: (fees: ProgramFee[]) => void;
}

export function TabFees({ institution, onUpdate }: Props) {
  const { fees } = institution;
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProgramFee | null>(null);
  const [filter, setFilter] = useState<'all' | 'UG' | 'PG' | 'PhD'>('all');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const ugTypes = ['B.E.', 'B.Tech', 'BCA', 'BSc', 'BBA', 'B.Com', 'BA', 'B.Pharm', 'B.Arch', 'LLB'];
  const pgTypes = ['M.E.', 'M.Tech', 'MCA', 'MBA', 'MSc', 'M.Com', 'MA', 'M.Pharm'];

  const filtered = fees.filter(f => {
    if (filter === 'UG') return ugTypes.includes(f.degreeType);
    if (filter === 'PG') return pgTypes.includes(f.degreeType);
    if (filter === 'PhD') return f.degreeType === 'PhD';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = sortField === 'totalFees' ? (a.totalFees || 0) : a.programName;
    const bVal = sortField === 'totalFees' ? (b.totalFees || 0) : b.programName;
    return sortAsc
      ? (aVal > bVal ? 1 : -1)
      : (aVal < bVal ? 1 : -1);
  });

  const toggleSort = (field: string) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const handleSave = (fee: ProgramFee) => {
    const idx = fees.findIndex(f => f.id === fee.id);
    const updated = idx >= 0
      ? fees.map(f => f.id === fee.id ? fee : f)
      : [...fees, fee];
    onUpdate(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this program fee?')) {
      onUpdate(fees.filter(f => f.id !== id));
    }
  };

  const handleEdit = (fee: ProgramFee) => {
    setEditing(fee);
    setModalOpen(true);
  };

  const handleExportCSV = () => {
    exportToCSV(sorted.map(f => ({
      'Program Name': f.programName,
      'Degree': f.degreeType,
      'Duration': `${f.duration} years`,
      'Department': f.department || '',
      'Year 1 Fee': f.annualFees.year1 || '',
      'Year 2 Fee': f.annualFees.year2 || '',
      'Year 3 Fee': f.annualFees.year3 || '',
      'Year 4 Fee': f.annualFees.year4 || '',
      'Total Fee': f.totalFees || '',
      'Admission Fee': f.admissionFee || '',
      'Source': f.feeSource,
      'Academic Year': f.academicYear,
    })), `${institution.profile.name}_fees`);
  };

  // Summary stats
  const ugFees = fees.filter(f => ugTypes.includes(f.degreeType) && f.totalFees);
  const pgFees = fees.filter(f => pgTypes.includes(f.degreeType) && f.totalFees);
  const avgUG = ugFees.length ? Math.round(ugFees.reduce((s, f) => s + (f.totalFees || 0), 0) / ugFees.length) : null;
  const avgPG = pgFees.length ? Math.round(pgFees.reduce((s, f) => s + (f.totalFees || 0), 0) / pgFees.length) : null;
  const allTotals = fees.filter(f => f.totalFees).map(f => f.totalFees!);
  const minFee = allTotals.length ? Math.min(...allTotals) : null;
  const maxFee = allTotals.length ? Math.max(...allTotals) : null;
  const lowestProg = fees.find(f => f.totalFees === minFee);
  const highestProg = fees.find(f => f.totalFees === maxFee);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {fees.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {lowestProg && (
            <Card className="border-emerald-100">
              <CardContent className="p-4">
                <p className="text-xs text-slate-400">Lowest Fee Program</p>
                <p className="font-semibold text-emerald-700 text-sm mt-1 line-clamp-1">{lowestProg.programName}</p>
                <p className="text-lg font-bold text-emerald-600">{formatLakhs(lowestProg.totalFees)}</p>
              </CardContent>
            </Card>
          )}
          {highestProg && (
            <Card className="border-amber-100">
              <CardContent className="p-4">
                <p className="text-xs text-slate-400">Highest Fee Program</p>
                <p className="font-semibold text-amber-700 text-sm mt-1 line-clamp-1">{highestProg.programName}</p>
                <p className="text-lg font-bold text-amber-600">{formatLakhs(highestProg.totalFees)}</p>
              </CardContent>
            </Card>
          )}
          {avgUG !== null && (
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-slate-400">Average UG Fee</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{formatLakhs(avgUG)}</p>
                <p className="text-xs text-slate-400">{ugFees.length} programs</p>
              </CardContent>
            </Card>
          )}
          {avgPG !== null && (
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-slate-400">Average PG Fee</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{formatLakhs(avgPG)}</p>
                <p className="text-xs text-slate-400">{pgFees.length} programs</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1">
          {(['all', 'UG', 'PG', 'PhD'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'All Programs' : f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-3.5 w-3.5 mr-1" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => generateExcel(institution)}>
            <Download className="h-3.5 w-3.5 mr-1" />
            Excel
          </Button>
          <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" />
            Add Program
          </Button>
        </div>
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
          <p className="text-slate-400 mb-3">No fee data yet.</p>
          <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" />
            Add First Program
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase">
                    <button className="flex items-center gap-1 hover:text-slate-900" onClick={() => toggleSort('name')}>
                      Program <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Degree</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Dur</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Year 1</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Year 2</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Year 3</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Year 4</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase">
                    <button className="flex items-center gap-1 hover:text-slate-900 ml-auto" onClick={() => toggleSort('totalFees')}>
                      Total <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Source</th>
                  <th className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((fee, i) => (
                  <tr key={fee.id} className={i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-900 line-clamp-1">{fee.programName}</p>
                      {fee.department && <p className="text-xs text-slate-400">{fee.department}</p>}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{fee.degreeType}</td>
                    <td className="py-3 px-3 text-slate-500">{fee.duration}Y</td>
                    <td className="py-3 px-3 text-right text-slate-700">{fee.annualFees.year1 ? formatIndianCurrency(fee.annualFees.year1) : '—'}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{fee.annualFees.year2 ? formatIndianCurrency(fee.annualFees.year2) : '—'}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{fee.annualFees.year3 ? formatIndianCurrency(fee.annualFees.year3) : '—'}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{fee.annualFees.year4 ? formatIndianCurrency(fee.annualFees.year4) : '—'}</td>
                    <td className="py-3 px-3 text-right">
                      {fee.totalFees
                        ? <span className="font-semibold text-slate-900">{formatIndianCurrency(fee.totalFees)}</span>
                        : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs text-slate-400">{fee.feeSource}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(fee)} title="Edit">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(fee.id)} title="Delete" className="hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddFeeModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        editing={editing}
      />
    </div>
  );
}
