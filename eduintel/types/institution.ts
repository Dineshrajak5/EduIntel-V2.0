export type InstitutionType =
  | 'Engineering College'
  | 'Arts & Science'
  | 'University'
  | 'Deemed University'
  | 'Autonomous Institution'
  | 'Pharmacy'
  | 'Management'
  | 'Medical'
  | 'Polytechnic';

export type ContactCategory =
  | 'sponsoring_body'
  | 'academic_leadership'
  | 'administration'
  | 'placement'
  | 'student_affairs'
  | 'finance'
  | 'admissions'
  | 'board_member';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface Campus {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  phone?: string;
}

export interface ResearchStats {
  totalPublications?: number;
  scopusIndexed?: number;
  webOfScience?: number;
  hIndex?: number;
  patents?: number;
  researchProjects?: number;
  researchFunding?: number;
}

export interface InstitutionProfile {
  name: string;
  formerName?: string;
  type: InstitutionType;
  establishedYear?: number;
  founder?: string;
  tagline?: string;
  vision?: string;
  mission?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  phone?: string[];
  email?: string[];
  whatsapp?: string;
  fax?: string;
  website: string;
  domain: string;
  linkedin?: string;
  campuses?: Campus[];
  totalSchools?: number;
  totalPrograms?: number;
  totalStudents?: number;
  totalFaculty?: number;
  researchPublications?: ResearchStats;
}

export interface Ranking {
  body: string;
  rank?: number;
  category?: string;
  year?: number;
  score?: number;
  notes?: string;
}

export interface AccreditationData {
  naac?: {
    grade: string;
    cycle: number;
    year: number;
    cgpa?: number;
    validUntil?: string;
  };
  nirf?: {
    rank: number;
    category: string;
    year: number;
    score?: number;
    overallRank?: number;
  };
  nba?: {
    programCount: number;
    programs: string[];
    year?: number;
  };
  abet?: {
    programCount: number;
    programs: string[];
  };
  ugcCategory?: string;
  ugc12B?: boolean;
  ugc2F?: boolean;
  aicteApproved?: boolean;
  autonomousStatus?: boolean;
  internationalRankings?: Ranking[];
  otherRankings?: Ranking[];
}

export interface AffiliationData {
  affiliatedTo?: string;
  affiliationType?: string;
  aicteApprovalNumber?: string;
  aicteApprovalYear?: number;
  ugcRecognition?: boolean;
  ugcUnder12B?: boolean;
  mandatoryDisclosureUrl?: string;
  complianceStatus?: string;
  regulatoryNotes?: string;
}

export interface ManagementContact {
  id: string;
  name: string;
  designation: string;
  category: ContactCategory;
  qualification?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  confidence: ConfidenceLevel;
  source: string;
  flaggedForReview?: boolean;
  notes?: string;
}

export interface PlacementYearStats {
  academicYear: string;
  totalOffers?: number;
  totalEligible?: number;
  placementRate?: number;
  averageCTC?: number;
  highestCTC?: number;
  totalCompanies?: number;
  dreamCompanyCount?: number;
  superDreamCount?: number;
}

export interface Recruiter {
  name: string;
  sector: 'IT' | 'BFSI' | 'Core Engineering' | 'Product' | 'Consulting' | 'Govt' | 'Other';
  logoUrl?: string;
  packageRange?: string;
  tier?: 'Super Dream' | 'Dream' | 'Regular';
}

export interface PlacementLevel {
  level: number;
  label: string;
  minCTC: number;
  maxCTC?: number;
  description?: string;
}

export interface PlacementData {
  directorName?: string;
  directorEmail?: string;
  directorPhone?: string;
  directorWhatsApp?: string;
  currentYear: PlacementYearStats;
  historicalStats: PlacementYearStats[];
  recruiters: Recruiter[];
  dreamCompanies: string[];
  superDreamCompanies: string[];
  placementLevels?: PlacementLevel[];
  centersOfExcellence?: string[];
  placementBrochureUrl?: string;
}

export interface ProgramFee {
  id: string;
  programName: string;
  degreeType: string;
  duration: number;
  department?: string;
  school?: string;
  annualFees: {
    year1?: number;
    year2?: number;
    year3?: number;
    year4?: number;
    year5?: number;
  };
  admissionFee?: number;
  hostelFeePerYear?: number;
  transportFeePerYear?: number;
  otherFees?: number;
  totalFees?: number;
  feeSource: string;
  academicYear: string;
  notes?: string;
  lastUpdated: string;
}

export interface InstitutionDocument {
  id: string;
  name: string;
  type: 'AQAR' | 'SSR' | 'Mandatory Disclosure' | 'Annual Report' | 'Placement Brochure' | 'Other';
  year?: number;
  url: string;
  status: 'Live' | 'Broken' | 'Downloaded';
  notes?: string;
}

export interface SourceReference {
  section: string;
  score: number;
  sourceUrl?: string;
  verificationMethod: string;
  status: 'Verified' | 'Partial' | 'Failed' | 'Manual';
  notes?: string;
}

export interface Institution {
  id: string;
  createdAt: string;
  updatedAt: string;
  profile: InstitutionProfile;
  accreditation: AccreditationData;
  affiliation: AffiliationData;
  management: ManagementContact[];
  placement: PlacementData;
  fees: ProgramFee[];
  documents: InstitutionDocument[];
  sources: SourceReference[];
  confidenceScore: number;
}

export interface CrawlProgress {
  step: string;
  status: 'pending' | 'running' | 'success' | 'warning' | 'error';
  message?: string;
}

export interface AppSettings {
  anthropicApiKey?: string;
  defaultInstitutionType?: InstitutionType;
  defaultState?: string;
  pdfPageSize?: 'A4' | 'Letter';
  logoBase64?: string;
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli',
  'Daman & Diu', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export const DEGREE_TYPES = [
  'B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'BCA', 'MCA', 'MBA', 'PGDM',
  'BSc', 'MSc', 'BBA', 'B.Com', 'M.Com', 'BA', 'MA', 'LLB', 'LLM',
  'BDS', 'MDS', 'MBBS', 'MD', 'B.Pharm', 'M.Pharm', 'Pharm.D',
  'B.Arch', 'M.Arch', 'B.Plan', 'BHM', 'MHM', 'B.Ed', 'M.Ed',
  'PhD', 'Diploma', 'Certificate', 'Other'
];

export const FEE_SOURCES = [
  'Official Website',
  'Mandatory Disclosure',
  'AICTE Portal',
  'Phone Enquiry',
  'Brochure',
  'Other'
];

export const NAAC_GRADES = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'Not Accredited'];

export const CONTACT_CATEGORY_LABELS: Record<ContactCategory, string> = {
  sponsoring_body: 'Sponsoring Body',
  academic_leadership: 'Academic Leadership',
  administration: 'Administration',
  placement: 'Placements',
  student_affairs: 'Student Affairs',
  finance: 'Finance',
  admissions: 'Admissions',
  board_member: 'Board Member',
};

export const CONTACT_CATEGORY_COLORS: Record<ContactCategory, string> = {
  sponsoring_body: 'bg-blue-100 text-blue-800 border-blue-200',
  academic_leadership: 'bg-purple-100 text-purple-800 border-purple-200',
  administration: 'bg-green-100 text-green-800 border-green-200',
  placement: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  student_affairs: 'bg-red-100 text-red-800 border-red-200',
  finance: 'bg-orange-100 text-orange-800 border-orange-200',
  admissions: 'bg-teal-100 text-teal-800 border-teal-200',
  board_member: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};
