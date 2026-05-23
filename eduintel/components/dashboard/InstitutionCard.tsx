'use client';
import { Institution } from '@/types/institution';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  FileText, Download, Trash2, MapPin, Users, Phone,
  Calendar, Star, Award
} from 'lucide-react';
import {
  getNaacBadgeColor, getConfidenceColor,
  formatRelativeDate,
} from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { generatePDF } from '@/lib/pdf';

interface Props {
  institution: Institution;
  onDelete: (id: string) => void;
}

export function InstitutionCard({ institution, onDelete }: Props) {
  const router = useRouter();
  const { profile, accreditation, management, confidenceScore, updatedAt } = institution;

  const handleDownloadPDF = (e: React.MouseEvent) => {
    e.stopPropagation();
    generatePDF(institution);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete ${profile.name}? This cannot be undone.`)) {
      onDelete(institution.id);
    }
  };

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow cursor-pointer group" onClick={() => router.push(`/institution/${institution.id}`)}>
      <CardContent className="flex-1 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
              {profile.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{profile.domain || profile.website}</p>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0 capitalize">
            {profile.type.split(' ')[0]}
          </Badge>
        </div>

        {/* NAAC + NIRF badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {accreditation.naac?.grade ? (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${getNaacBadgeColor(accreditation.naac.grade)}`}>
              <Award className="h-3 w-3" />
              NAAC {accreditation.naac.grade}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-slate-200 text-slate-400">
              No NAAC
            </span>
          )}
          {accreditation.nirf?.rank && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Star className="h-3 w-3" />
              NIRF #{accreditation.nirf.rank}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{[profile.city, profile.state].filter(Boolean).join(', ')}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {management.length} contacts
          </span>
          {profile.totalStudents && (
            <span>{profile.totalStudents.toLocaleString('en-IN')} students</span>
          )}
          {profile.phone?.length ? (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {profile.phone.length}
            </span>
          ) : null}
        </div>

        {/* Confidence score */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Confidence</span>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${getConfidenceColor(confidenceScore)}`}>
              {confidenceScore}%
            </span>
          </div>
          <Progress
            value={confidenceScore}
            className={`h-1.5 ${confidenceScore >= 80 ? '[&>div]:bg-emerald-500' : confidenceScore >= 60 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'}`}
          />
        </div>
      </CardContent>

      <CardFooter className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-1">
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar className="h-3 w-3" />
          {formatRelativeDate(updatedAt)}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => { e.stopPropagation(); router.push(`/institution/${institution.id}`); }}
            title="View Report"
          >
            <FileText className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDownloadPDF}
            title="Download PDF"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDelete}
            title="Delete"
            className="hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
