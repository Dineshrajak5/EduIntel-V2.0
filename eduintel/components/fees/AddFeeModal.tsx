'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ProgramFee, DEGREE_TYPES, FEE_SOURCES } from '@/types/institution';
import { generateId } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (fee: ProgramFee) => void;
  editing?: ProgramFee | null;
}

const EMPTY: Omit<ProgramFee, 'id' | 'lastUpdated'> = {
  programName: '',
  degreeType: 'B.E.',
  duration: 4,
  department: '',
  school: '',
  annualFees: { year1: undefined, year2: undefined, year3: undefined, year4: undefined, year5: undefined },
  admissionFee: undefined,
  hostelFeePerYear: undefined,
  transportFeePerYear: undefined,
  otherFees: undefined,
  totalFees: undefined,
  feeSource: 'Official Website',
  academicYear: '2024-25',
  notes: '',
};

function calcTotal(fee: typeof EMPTY): number {
  const years = ([fee.annualFees.year1, fee.annualFees.year2, fee.annualFees.year3, fee.annualFees.year4, fee.annualFees.year5] as (number | undefined)[])
    .slice(0, fee.duration)
    .reduce((s: number, v) => s + (Number(v) || 0), 0);
  return years + (Number(fee.admissionFee) || 0);
}

export function AddFeeModal({ open, onClose, onSave, editing }: Props) {
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);

  useEffect(() => {
    if (editing) {
      const { id: _id, lastUpdated: _lu, ...rest } = editing;
      setForm(rest);
    } else {
      setForm(EMPTY);
    }
  }, [editing, open]);

  const set = (field: string, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const setFee = (year: string, value: string) =>
    setForm(prev => ({
      ...prev,
      annualFees: { ...prev.annualFees, [year]: value === '' ? undefined : Number(value) },
    }));

  const total = calcTotal(form);

  const handleSave = () => {
    if (!form.programName.trim()) return;
    const fee: ProgramFee = {
      ...form,
      id: editing?.id ?? generateId(),
      totalFees: total,
      lastUpdated: new Date().toISOString(),
    };
    onSave(fee);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Program Fee' : 'Add Program Fee'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Program Name *</Label>
            <Input
              value={form.programName}
              onChange={e => set('programName', e.target.value)}
              placeholder="e.g., B.E. Computer Science and Engineering"
            />
          </div>

          <div>
            <Label>Degree Type</Label>
            <Select value={form.degreeType} onValueChange={v => set('degreeType', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DEGREE_TYPES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Duration (Years)</Label>
            <Select value={String(form.duration)} onValueChange={v => set('duration', Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n} Years</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Department</Label>
            <Input value={form.department || ''} onChange={e => set('department', e.target.value)} placeholder="e.g., School of Engineering" />
          </div>

          <div>
            <Label>Academic Year</Label>
            <Input value={form.academicYear} onChange={e => set('academicYear', e.target.value)} placeholder="2024-25" />
          </div>

          {/* Annual fees */}
          <div className="col-span-2">
            <Label className="mb-2 block">Annual Fees (₹)</Label>
            <div className="grid grid-cols-4 gap-2">
              {([1, 2, 3, 4] as const).slice(0, form.duration).map(yr => (
                <div key={yr}>
                  <Label className="text-xs text-slate-400">Year {yr}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.annualFees[`year${yr}` as keyof typeof form.annualFees] ?? ''}
                    onChange={e => setFee(`year${yr}`, e.target.value)}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Admission / One-time Fee (₹)</Label>
            <Input
              type="number"
              min={0}
              value={form.admissionFee ?? ''}
              onChange={e => set('admissionFee', e.target.value === '' ? undefined : Number(e.target.value))}
              placeholder="0"
            />
          </div>

          <div>
            <Label>Hostel Fee per Year (₹)</Label>
            <Input
              type="number"
              min={0}
              value={form.hostelFeePerYear ?? ''}
              onChange={e => set('hostelFeePerYear', e.target.value === '' ? undefined : Number(e.target.value))}
              placeholder="0 (optional)"
            />
          </div>

          <div>
            <Label>Transport Fee per Year (₹)</Label>
            <Input
              type="number"
              min={0}
              value={form.transportFeePerYear ?? ''}
              onChange={e => set('transportFeePerYear', e.target.value === '' ? undefined : Number(e.target.value))}
              placeholder="0 (optional)"
            />
          </div>

          <div>
            <Label>Other Fees (caution, exam, etc.) (₹)</Label>
            <Input
              type="number"
              min={0}
              value={form.otherFees ?? ''}
              onChange={e => set('otherFees', e.target.value === '' ? undefined : Number(e.target.value))}
              placeholder="0 (optional)"
            />
          </div>

          <div>
            <Label>Fee Source</Label>
            <Select value={form.feeSource} onValueChange={v => set('feeSource', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FEE_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <div className="w-full bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <p className="text-xs text-indigo-600 font-medium">Auto-calculated Total</p>
              <p className="text-xl font-bold text-indigo-900">
                ₹{total.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="col-span-2">
            <Label>Notes / Remarks</Label>
            <Textarea
              value={form.notes || ''}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.programName.trim()}>
            {editing ? 'Update Program' : 'Add Program'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
