export type UserRole = 'nurse' | 'adr_head' | 'admin';

export type ReportStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'follow_up_required'
  | 'escalated'
  | 'closed';

export type SeverityLevel = 'mild' | 'moderate' | 'severe' | 'life_threatening';

export type ReportOutcome = 'fatal' | 'continuing' | 'recovering' | 'recovered' | 'unknown';

export type CaseType = 'initial' | 'follow_up';

export type PatientSex = 'M' | 'F' | 'Other';

export type NoticeSeverity = 'info' | 'warning' | 'critical';

export type ForwardedTarget = 'hospital_pv_unit' | 'drug_safety_committee' | 'pvpi_regulatory';

export const COMMON_SYMPTOMS = [
  'Shivering',
  'Vomiting',
  'Fever',
  'Rash',
  'Nausea',
  'Headache',
  'Breathlessness',
  'Chills',
  'Tachycardia',
  'Facial flushing',
  'Urticaria / Itching',
  'Hypotension',
  'Rigors',
  'Bronchospasm',
  'Dizziness',
  'Sweating / Diaphoresis',
] as const;

export const WHO_CAUSALITY_CATEGORIES = [
  { value: 'Certain', label: 'Certain', description: 'Event with plausible time relationship to drug intake, cannot be explained by disease' },
  { value: 'Probable', label: 'Probable / Likely', description: 'Event with reasonable time sequence, unlikely to be attributed to disease' },
  { value: 'Possible', label: 'Possible', description: 'Event with reasonable time sequence, but could also be explained by disease' },
  { value: 'Unlikely', label: 'Unlikely', description: 'Event with a temporal relationship that makes a causal relationship improbable' },
  { value: 'Conditional', label: 'Conditional / Unclassified', description: 'More data needed before proper assessment can be made' },
  { value: 'Unassessable', label: 'Unassessable / Unclassifiable', description: 'Information is insufficient or contradictory' },
] as const;

export const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; bg: string; border: string }> = {
  draft: { label: 'Draft', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300' },
  submitted: { label: 'Submitted', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  under_review: { label: 'Under Review', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  follow_up_required: { label: 'Follow-Up Required', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  escalated: { label: 'Escalated', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  closed: { label: 'Closed', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

export const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; color: string; bg: string; border: string }> = {
  mild: { label: 'Mild', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  moderate: { label: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  severe: { label: 'Severe', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  life_threatening: { label: 'Life Threatening', color: 'text-red-900', bg: 'bg-red-100', border: 'border-red-400' },
};

export interface HospitalUser {
  id: string;
  name: string;
  email: string | null;
  role: UserRole;
  employeeId: string;
  ward: string | null;
  occupation: string | null;
  hospitalName?: string;
}

export interface DemoUser {
  id: string;
  name: string;
  role: UserRole;
  employeeId: string;
  ward: string | null;
  occupation: string;
}

export const DEMO_ACCOUNTS: DemoUser[] = [
  {
    id: 'nurse-asha',
    name: 'Asha Verma',
    role: 'nurse',
    employeeId: 'N-1001',
    ward: 'Maternity Ward',
    occupation: 'Staff Nurse',
  },
  {
    id: 'adr-priya',
    name: 'Dr. Priya Nair',
    role: 'adr_head',
    employeeId: 'AH-2001',
    ward: 'Pharmacovigilance Center',
    occupation: 'Pharmacovigilance Officer & Physician',
  },
  {
    id: 'admin-it',
    name: 'IT Admin',
    role: 'admin',
    employeeId: 'AD-3001',
    ward: 'Central Pharmacy / IT',
    occupation: 'Pharmacy & Safety Administrator',
  },
];
