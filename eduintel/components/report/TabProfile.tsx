'use client';
import { Institution } from '@/types/institution';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Link as LinkedinIcon, Mail, Phone, MapPin, Users, BookOpen, Building2 } from 'lucide-react';
import { formatPhone } from '@/lib/utils';

interface Props { institution: Institution }

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-slate-900 mt-0.5">{value}</p>
    </div>
  );
}

export function TabProfile({ institution }: Props) {
  const { profile } = institution;

  return (
    <div className="space-y-6">
      {/* Identity */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Identity</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Full Name" value={profile.name} />
            <Field label="Former Name" value={profile.formerName} />
            <Field label="Institution Type" value={profile.type} />
            <Field label="Established Year" value={profile.establishedYear} />
            <Field label="Founder" value={profile.founder} />
            <Field label="City" value={profile.city} />
            <Field label="State" value={profile.state} />
            <Field label="Pincode" value={profile.pincode} />
          </div>
          {profile.address && (
            <div className="mt-4 flex gap-2">
              <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-600">{profile.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vision & Mission */}
      {(profile.tagline || profile.vision || profile.mission) && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Vision & Mission</h3>
            {profile.tagline && (
              <div className="mb-3 italic text-indigo-600 border-l-2 border-indigo-200 pl-3">&ldquo;{profile.tagline}&rdquo;</div>
            )}
            {profile.vision && (
              <div className="mb-3">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Vision</p>
                <p className="text-sm text-slate-700">{profile.vision}</p>
              </div>
            )}
            {profile.mission && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Mission</p>
                <p className="text-sm text-slate-700">{profile.mission}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contact */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            {profile.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-400" />
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">{profile.website}</a>
              </div>
            )}
            {profile.linkedin && (
              <div className="flex items-center gap-2">
                <LinkedinIcon className="h-4 w-4 text-slate-400" />
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">{profile.linkedin}</a>
              </div>
            )}
            {profile.email?.map((e, i) => (
              <div key={i} className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <a href={`mailto:${e}`} className="text-sm text-indigo-600 hover:underline">{e}</a>
              </div>
            ))}
            {profile.phone?.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <a href={`tel:${p}`} className="text-sm text-slate-700 hover:underline">{formatPhone(p)}</a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Stats */}
      {(profile.totalStudents || profile.totalFaculty || profile.totalPrograms || profile.totalSchools) && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Key Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.totalStudents && (
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <Users className="h-5 w-5 text-indigo-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-indigo-700">{profile.totalStudents.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-500">Students</p>
                </div>
              )}
              {profile.totalFaculty && (
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-purple-700">{profile.totalFaculty.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-500">Faculty</p>
                </div>
              )}
              {profile.totalPrograms && (
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-emerald-700">{profile.totalPrograms}</p>
                  <p className="text-xs text-slate-500">Programs</p>
                </div>
              )}
              {profile.totalSchools && (
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-amber-700">{profile.totalSchools}</p>
                  <p className="text-xs text-slate-500">Departments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
