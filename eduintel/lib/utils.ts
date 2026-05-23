import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Institution, SourceReference } from '@/types/institution';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIndianCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLakhs(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '—';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  if (cleaned.length === 12 && cleaned.startsWith('91'))
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  return phone;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function formatRelativeDate(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  } catch {
    return iso;
  }
}

export function calculateConfidenceScore(institution: Partial<Institution>): number {
  const weights: Record<string, number> = {
    profile: 20,
    accreditation: 15,
    management: 20,
    placement: 20,
    fees: 15,
    documents: 10,
  };

  let total = 0;

  // Profile completeness
  const p = institution.profile;
  if (p) {
    let profileScore = 0;
    if (p.name) profileScore += 2;
    if (p.establishedYear) profileScore += 2;
    if (p.phone?.length) profileScore += 2;
    if (p.email?.length) profileScore += 3;
    if (p.address) profileScore += 2;
    if (p.vision || p.mission) profileScore += 3;
    if (p.totalStudents) profileScore += 2;
    if (p.totalFaculty) profileScore += 2;
    if (p.founder) profileScore += 2;
    total += Math.min(profileScore, weights.profile);
  }

  // Accreditation
  const acc = institution.accreditation;
  if (acc) {
    let accScore = 0;
    if (acc.naac?.grade) accScore += 6;
    if (acc.nirf?.rank) accScore += 4;
    if (acc.nba) accScore += 3;
    if (acc.ugcCategory) accScore += 2;
    total += Math.min(accScore, weights.accreditation);
  }

  // Management
  const mgmt = institution.management;
  if (mgmt?.length) {
    const highConf = mgmt.filter(m => m.confidence === 'high').length;
    const withEmail = mgmt.filter(m => m.email).length;
    const withPhone = mgmt.filter(m => m.phone).length;
    let mgmtScore = Math.min(highConf * 2, 8);
    mgmtScore += Math.min(withEmail * 1, 6);
    mgmtScore += Math.min(withPhone * 1, 6);
    total += Math.min(mgmtScore, weights.management);
  }

  // Placement
  const place = institution.placement;
  if (place) {
    let placeScore = 0;
    if (place.directorEmail) placeScore += 4;
    if (place.currentYear?.placementRate) placeScore += 4;
    if (place.currentYear?.highestCTC) placeScore += 3;
    if (place.historicalStats?.length) placeScore += 3;
    if (place.recruiters?.length) placeScore += 3;
    if (place.superDreamCompanies?.length) placeScore += 3;
    total += Math.min(placeScore, weights.placement);
  }

  // Fees
  const fees = institution.fees;
  if (fees?.length) {
    const withDetails = fees.filter(f => f.annualFees.year1).length;
    total += Math.min(withDetails * 3, weights.fees);
  }

  // Documents
  const docs = institution.documents;
  if (docs?.length) {
    const live = docs.filter(d => d.status === 'Live').length;
    total += Math.min(live * 2, weights.documents);
  }

  return Math.min(Math.round(total), 100);
}

export function getConfidenceColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

export function getConfidenceLabel(score: number): string {
  if (score >= 80) return 'HIGH CONFIDENCE';
  if (score >= 60) return 'MEDIUM CONFIDENCE';
  return 'LOW — MANUAL REVIEW';
}

export function getNaacBadgeColor(grade: string): string {
  switch (grade) {
    case 'A++': return 'bg-emerald-700 text-white';
    case 'A+': return 'bg-emerald-500 text-white';
    case 'A': return 'bg-teal-500 text-white';
    case 'B++': return 'bg-blue-500 text-white';
    case 'B+': return 'bg-blue-400 text-white';
    case 'B': return 'bg-slate-400 text-white';
    case 'C': return 'bg-orange-400 text-white';
    default: return 'bg-white text-red-600 border border-red-400';
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h];
      const str = val === null || val === undefined ? '' : String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
