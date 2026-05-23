'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInstitution } from '@/hooks/useInstitution';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TabProfile } from '@/components/report/TabProfile';
import { TabAccreditation } from '@/components/report/TabAccreditation';
import { TabManagement } from '@/components/report/TabManagement';
import { TabPlacement } from '@/components/report/TabPlacement';
import { TabFees } from '@/components/report/TabFees';
import { TabDocuments } from '@/components/report/TabDocuments';
import { TabSources } from '@/components/report/TabSources';
import { ManagementContact, ProgramFee } from '@/types/institution';
import { generatePDF } from '@/lib/pdf';
import { getConfidenceColor, getConfidenceLabel, getNaacBadgeColor, calculateConfidenceScore } from '@/lib/utils';
import { ArrowLeft, Download, Edit, RefreshCw, Award, Star } from 'lucide-react';

export default function InstitutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { institution, isLoaded, update } = useInstitution(id);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 mb-4">Institution not found.</p>
        <Link href="/"><Button variant="outline">Back to Dashboard</Button></Link>
      </div>
    );
  }

  const { profile, accreditation, confidenceScore } = institution;

  const handleManagementUpdate = (contacts: ManagementContact[]) => {
    const updated = {
      ...institution,
      management: contacts,
      updatedAt: new Date().toISOString(),
      confidenceScore: calculateConfidenceScore({ ...institution, management: contacts }),
    };
    update(updated);
  };

  const handleFeesUpdate = (fees: ProgramFee[]) => {
    const updated = {
      ...institution,
      fees,
      updatedAt: new Date().toISOString(),
      confidenceScore: calculateConfidenceScore({ ...institution, fees }),
    };
    update(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back + Top bar */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                {profile.type}
              </span>
            </div>
            <p className="text-slate-500 text-sm">{[profile.city, profile.state].filter(Boolean).join(', ')}</p>

            {/* Badges */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {accreditation.naac?.grade && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getNaacBadgeColor(accreditation.naac.grade)}`}>
                  <Award className="h-3 w-3" />
                  NAAC {accreditation.naac.grade}
                </span>
              )}
              {accreditation.nirf?.rank && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Star className="h-3 w-3" />
                  NIRF #{accreditation.nirf.rank}
                </span>
              )}
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getConfidenceColor(confidenceScore)}`}>
                {confidenceScore}% — {getConfidenceLabel(confidenceScore)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Button variant="outline" size="sm" onClick={() => generatePDF(institution)}>
              <Download className="h-4 w-4 mr-1.5" />
              PDF Report
            </Button>
            <Link href={`/institution/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1.5" />
                Edit Data
              </Button>
            </Link>
            <Link href={`/new?recrawl=${id}`}>
              <Button variant="secondary" size="sm">
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Re-crawl
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList className="w-full flex-wrap h-auto gap-1 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="accreditation">Accreditation</TabsTrigger>
          <TabsTrigger value="affiliation">Affiliation</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="placement">Placement</TabsTrigger>
          <TabsTrigger value="fees">Fee Structure</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <TabProfile institution={institution} />
        </TabsContent>

        <TabsContent value="accreditation">
          <TabAccreditation institution={institution} />
        </TabsContent>

        <TabsContent value="affiliation">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">Affiliation & Regulatory Status</h2>
            {institution.affiliation ? (
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Affiliated To', institution.affiliation.affiliatedTo],
                  ['Affiliation Type', institution.affiliation.affiliationType],
                  ['AICTE Approval No.', institution.affiliation.aicteApprovalNumber],
                  ['Compliance Status', institution.affiliation.complianceStatus],
                ].map(([label, val]) => val && (
                  <div key={label as string}>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-medium text-slate-900 mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No affiliation data. Edit to add manually.</p>
            )}
            {institution.affiliation?.mandatoryDisclosureUrl && (
              <a
                href={institution.affiliation.mandatoryDisclosureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
              >
                View Mandatory Disclosure →
              </a>
            )}
          </div>
        </TabsContent>

        <TabsContent value="management">
          <TabManagement institution={institution} onUpdate={handleManagementUpdate} />
        </TabsContent>

        <TabsContent value="placement">
          <TabPlacement institution={institution} />
        </TabsContent>

        <TabsContent value="fees">
          <TabFees institution={institution} onUpdate={handleFeesUpdate} />
        </TabsContent>

        <TabsContent value="documents">
          <TabDocuments institution={institution} />
        </TabsContent>

        <TabsContent value="sources">
          <TabSources institution={institution} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
