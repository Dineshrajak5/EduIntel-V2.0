'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInstitution } from '@/hooks/useInstitution';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Institution, INDIAN_STATES, NAAC_GRADES } from '@/types/institution';
import { calculateConfidenceScore } from '@/lib/utils';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { institution, isLoaded, update } = useInstitution(id);
  const [saved, setSaved] = useState(false);

  if (!isLoaded) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" /></div>;
  if (!institution) return <div className="text-center py-20 text-slate-400">Institution not found.</div>;

  const setProfile = (field: string, value: string | number) => {
    const updated: Institution = {
      ...institution,
      profile: { ...institution.profile, [field]: value },
      updatedAt: new Date().toISOString(),
    };
    updated.confidenceScore = calculateConfidenceScore(updated);
    update(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setAccreditation = (path: string[], value: string | number) => {
    const acc = JSON.parse(JSON.stringify(institution.accreditation));
    let obj = acc;
    for (let i = 0; i < path.length - 1; i++) {
      if (!obj[path[i]]) obj[path[i]] = {};
      obj = obj[path[i]];
    }
    obj[path[path.length - 1]] = value;
    const updated: Institution = { ...institution, accreditation: acc, updatedAt: new Date().toISOString() };
    updated.confidenceScore = calculateConfidenceScore(updated);
    update(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const { profile, accreditation } = institution;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link href={`/institution/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Report
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Institution Data</h1>
          <p className="text-sm text-slate-500">{profile.name}</p>
        </div>
        {saved && (
          <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
            <Save className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-5">Institution Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Institution Name</Label>
              <Input
                defaultValue={profile.name}
                onBlur={e => setProfile('name', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Established Year</Label>
              <Input
                type="number"
                defaultValue={profile.establishedYear}
                onBlur={e => setProfile('establishedYear', Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Founder</Label>
              <Input defaultValue={profile.founder} onBlur={e => setProfile('founder', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>City</Label>
              <Input defaultValue={profile.city} onBlur={e => setProfile('city', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>State</Label>
              <Select defaultValue={profile.state} onValueChange={v => setProfile('state', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Website</Label>
              <Input defaultValue={profile.website} onBlur={e => setProfile('website', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Domain</Label>
              <Input defaultValue={profile.domain} onBlur={e => setProfile('domain', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Phone (comma-separated)</Label>
              <Input
                defaultValue={profile.phone?.join(', ')}
                onBlur={e => {
                  const phones = e.target.value.split(',').map(p => p.trim()).filter(Boolean);
                  const updated: Institution = { ...institution, profile: { ...institution.profile, phone: phones }, updatedAt: new Date().toISOString() };
                  updated.confidenceScore = calculateConfidenceScore(updated);
                  update(updated);
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email (comma-separated)</Label>
              <Input
                defaultValue={profile.email?.join(', ')}
                onBlur={e => {
                  const emails = e.target.value.split(',').map(em => em.trim()).filter(Boolean);
                  const updated: Institution = { ...institution, profile: { ...institution.profile, email: emails }, updatedAt: new Date().toISOString() };
                  updated.confidenceScore = calculateConfidenceScore(updated);
                  update(updated);
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Total Students</Label>
              <Input type="number" defaultValue={profile.totalStudents} onBlur={e => setProfile('totalStudents', Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <Label>Total Faculty</Label>
              <Input type="number" defaultValue={profile.totalFaculty} onBlur={e => setProfile('totalFaculty', Number(e.target.value))} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label>Vision</Label>
              <Textarea defaultValue={profile.vision} onBlur={e => setProfile('vision', e.target.value)} className="mt-1" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <Label>Mission</Label>
              <Textarea defaultValue={profile.mission} onBlur={e => setProfile('mission', e.target.value)} className="mt-1" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <Label>Address</Label>
              <Textarea defaultValue={profile.address} onBlur={e => setProfile('address', e.target.value)} className="mt-1" rows={2} />
            </div>
          </div>
        </div>

        {/* Accreditation */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-5">Accreditation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>NAAC Grade</Label>
              <Select
                defaultValue={accreditation.naac?.grade}
                onValueChange={v => setAccreditation(['naac', 'grade'], v)}
              >
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select grade..." /></SelectTrigger>
                <SelectContent>
                  {NAAC_GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>NAAC Cycle</Label>
              <Input
                type="number"
                defaultValue={accreditation.naac?.cycle}
                onBlur={e => setAccreditation(['naac', 'cycle'], Number(e.target.value))}
                className="mt-1"
                placeholder="e.g., 2"
              />
            </div>
            <div>
              <Label>NAAC Year</Label>
              <Input
                type="number"
                defaultValue={accreditation.naac?.year}
                onBlur={e => setAccreditation(['naac', 'year'], Number(e.target.value))}
                className="mt-1"
                placeholder="e.g., 2022"
              />
            </div>
            <div>
              <Label>NAAC CGPA</Label>
              <Input
                type="number"
                step="0.01"
                defaultValue={accreditation.naac?.cgpa}
                onBlur={e => setAccreditation(['naac', 'cgpa'], Number(e.target.value))}
                className="mt-1"
                placeholder="e.g., 3.12"
              />
            </div>
            <div>
              <Label>NIRF Rank</Label>
              <Input
                type="number"
                defaultValue={accreditation.nirf?.rank}
                onBlur={e => setAccreditation(['nirf', 'rank'], Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>NIRF Category</Label>
              <Input
                defaultValue={accreditation.nirf?.category}
                onBlur={e => setAccreditation(['nirf', 'category'], e.target.value)}
                className="mt-1"
                placeholder="e.g., Engineering"
              />
            </div>
            <div>
              <Label>NIRF Year</Label>
              <Input
                type="number"
                defaultValue={accreditation.nirf?.year}
                onBlur={e => setAccreditation(['nirf', 'year'], Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>UGC Category</Label>
              <Input
                defaultValue={accreditation.ugcCategory}
                onBlur={e => {
                  const updated: Institution = {
                    ...institution,
                    accreditation: { ...institution.accreditation, ugcCategory: e.target.value },
                    updatedAt: new Date().toISOString(),
                  };
                  updated.confidenceScore = calculateConfidenceScore(updated);
                  update(updated);
                }}
                className="mt-1"
                placeholder="Category I / II / III"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href={`/institution/${id}`}>
            <Button variant="outline">Done Editing</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
