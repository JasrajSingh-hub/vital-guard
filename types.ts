export type RiskLevel = 'CRITICAL' | 'ATTENTION' | 'STABLE';
export type PatientType = 'MONITORED' | 'CONTEXT_ONLY';
export type TaskStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type UserRole = 'DOCTOR' | 'NURSE' | 'PATIENT' | 'ADMIN';
export type MessageType = 'COMMENT' | 'REPLY';
export type AppPage = 'DASHBOARD' | 'PATIENTS' | 'PATIENT_PANEL' | 'CONSENT' | 'AUDIT_LOG' | 'BLOCKCHAIN_VERIFY' | 'AI_INSIGHTS' | 'INTEROPERABILITY';
export type ConsentDuration = '24H' | '7D' | 'PERMANENT';
export type ConsentStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';
export type VerificationStatus = 'VERIFIED' | 'TAMPERED';

export interface Vitals {
  timestamp: string;
  heartRate: number; // bpm
  systolicBp: number; // mmHg
  diastolicBp: number; // mmHg
  spO2: number; // %
  respRate: number; // breaths/min
  temperature: number; // Celsius
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string; // oral, IV, injection, etc.
  timing?: string; // e.g., "after food", "6 PM"
}

export interface DoctorInstruction {
  id: string;
  instruction: string;
  priority: TaskPriority;
  dueTime?: string;
  createdAt: string;
  createdBy: string; // doctor name
}

export interface NurseTask {
  id: string;
  patientId: string;
  patientName: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueTime?: string;
  createdAt: string;
  completedAt?: string;
  completedBy?: string; // nurse name
  sourceType: 'DOCTOR_INSTRUCTION' | 'MEDICATION' | 'MANUAL';
  sourceId?: string; // reference to medication or instruction
}

export interface PatientMessage {
  id: string;
  patientId: string;
  role: UserRole;
  userName: string;
  message: string;
  timestamp: string;
  type: MessageType;
  replyTo?: string; // id of message being replied to
}

export interface User {
  uid: string;
  role: UserRole;
  name: string;
  email: string;
}

export interface StoredUser extends User {
  approvalStatus: 'APPROVED' | 'PENDING';
  assignedPatientIds: string[];
  statusMessage: string;
  createdAt: string;
}

export interface TeamMessage {
  id: string;
  fromUid: string;
  toUid: string | 'ALL';
  role: UserRole;
  userName: string;
  message: string;
  timestamp: string;
}

export interface ConsentRecord {
  id: string;
  patientName: string;
  granteeType: 'HOSPITAL' | 'DOCTOR';
  granteeName: string;
  duration: ConsentDuration;
  createdAt: string;
  expiresAt?: string;
  status: ConsentStatus;
  transactionHash: string;
}

export interface BlockchainRecordProof {
  patientId: string;
  patientName: string;
  recordHash: string;
  blockchainHash: string;
  status: VerificationStatus;
  transactionId: string;
  network: string;
  timestamp: string;
}

export interface AuditEntry {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  timestamp: string;
  verificationStatus: VerificationStatus;
  blockchainRef: string;
}

export interface ReportImage {
  id: string;
  url: string;
  uploadedAt: string;
  extractedData?: string; // AI-extracted info for reference only
  type: 'PRESCRIPTION' | 'LAB_REPORT' | 'XRAY' | 'ECG' | 'BLOOD_TEST' | 'SCAN' | 'OTHER';
  reportName?: string; // e.g., "Complete Blood Count", "Chest X-Ray"
  reportDate?: string; // Date of the actual report/test
  findings?: string; // Key findings from the report
}

export interface PatientContext {
  diagnosis: string;
  medications: Medication[];
  doctorInstructions: DoctorInstruction[];
  reports: ReportImage[];
  allergies?: string[];
  notes?: string;
  messages?: PatientMessage[];
  completedTasks?: NurseTask[];
}

export interface Patient {
  id: string;
  patientUid?: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  condition: string;
  room: string;
  patientType: PatientType; // NEW: distinguish monitored vs context-only
  history: Vitals[];
  riskLevel: RiskLevel;
  aiAnalysis?: string;
  lastUpdated: string;
  context?: PatientContext; // NEW: clinical context for non-monitored patients
}

export interface ReferralRecord {
  id: string;
  patientId: string;
  patientUid: string;
  hospital: string;
  status: 'REFERRED' | 'RECEIVED' | 'IN_REVIEW' | 'COMPLETED';
  summary: string;
  reports: Array<{
    title: string;
    source: string;
    date: string;
  }>;
}

export interface AIAnalysisResult {
  riskLevel: RiskLevel;
  analysis: string;
  recommendation: string;
}

export interface ReportExtractionResult {
  medications: Medication[];
  diagnosis?: string;
  instructions?: string[];
  rawText: string;
}

export interface PatientSummary {
  overview: string;
  keyPoints: string[];
  recentChanges: string[];
  recommendations: string[];
}
