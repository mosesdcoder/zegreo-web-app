// DTO types mirroring the Zogreo backend API exactly

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "DOCUMENTS_REQUIRED"
  | "DOCUMENTS_SUBMITTED"
  | "OFFER_MADE"
  | "OFFER_ACCEPTED"
  | "ENROLLED"
  | "REJECTED"
  | "WITHDRAWN";

export type FeeCode =
  | "APPLICATION_FEE"
  | "ACCEPTANCE_FEE"
  | "TUITION_FEE"
  | "TECHNOLOGY_FEE"
  | "EXAM_FEE"
  | "REGISTRATION_FEE";

export type DocumentStatus = "PENDING" | "VERIFIED" | "REJECTED" | "NOT_UPLOADED";
export type PaymentStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "CANCELLED";
export type PaymentMethod = "MPESA" | "CARD";
export type UserRole = "APPLICANT" | "REGISTRAR" | "BURSAR" | "SUPER_ADMIN";
export type ProgramMode = "FULL_TIME" | "PART_TIME" | "WEEKEND" | "ONLINE";
export type ProgramLevel = "CERTIFICATE" | "DIPLOMA" | "ADVANCED_DIPLOMA";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  role: UserRole;
  orgSlug: string;
  createdAt: string;
}

export interface Program {
  id: string;
  slug: string;
  name: string;
  level: ProgramLevel;
  mode: ProgramMode;
  durationMonths: number;
  description: string;
  curriculum: CurriculumModule[];
  fees: ProgramFee[];
  intakes: Intake[];
  isActive: boolean;
}

export interface CurriculumModule {
  title: string;
  description?: string;
  order: number;
}

export interface ProgramFee {
  feeCode: FeeCode;
  label: string;
  amountKes: number;
  isMandatory: boolean;
}

export interface Intake {
  id: string;
  label: string;
  openDate: string;
  closeDate: string;
  startDate: string;
  isOpen: boolean;
}

export interface Application {
  id: string;
  applicantId: string;
  programId: string;
  intakeId: string;
  status: ApplicationStatus;
  statusHistory: StatusHistoryEntry[];
  personal?: PersonalDetails;
  education?: EducationHistory[];
  nextOfKin?: NextOfKin;
  submittedAt?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
  program?: Program;
  intake?: Intake;
  admissionNumber?: string;
}

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  timestamp: string;
  note?: string;
  staffId?: string;
}

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  nationalId: string;
  nationality: string;
  county: string;
  address: string;
  email: string;
  phone: string;
}

export interface EducationHistory {
  institution: string;
  qualification: string;
  yearCompleted: number;
  grade?: string;
}

export interface NextOfKin {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Document {
  id: string;
  applicationId: string;
  type: DocumentType;
  label: string;
  status: DocumentStatus;
  rejectionReason?: string;
  uploadedAt?: string;
  fileUrl?: string;
  isMandatory: boolean;
}

export type DocumentType =
  | "NATIONAL_ID"
  | "PASSPORT_PHOTO"
  | "KCSE_CERTIFICATE"
  | "KCSE_RESULT_SLIP"
  | "BIRTH_CERTIFICATE"
  | "OTHER";

export interface Invoice {
  id: string;
  applicationId: string;
  feeCode: FeeCode;
  label: string;
  amountKes: number;
  status: PaymentStatus;
  dueDate?: string;
  paidAt?: string;
  receiptNumber?: string;
  gate: PaymentGate;
}

export type PaymentGate = "APPLICATION" | "ACCEPTANCE" | "REGISTRATION" | "TUITION";

export interface Payment {
  id: string;
  invoiceId: string;
  applicationId: string;
  method: PaymentMethod;
  amountKes: number;
  grossAmountKes: number;
  providerFeeKes: number;
  technologyFeeKes: number;
  netToSchoolKes: number;
  status: PaymentStatus;
  mpesaPhone?: string;
  mpesaReceiptNumber?: string;
  cardReference?: string;
  initiatedAt: string;
  completedAt?: string;
}

export interface Offer {
  id: string;
  applicationId: string;
  programId: string;
  intakeId: string;
  fees: OfferFeeItem[];
  totalKes: number;
  conditions?: string;
  expiresAt: string;
  acceptedAt?: string;
  letterUrl?: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
}

export interface OfferFeeItem {
  feeCode: FeeCode;
  label: string;
  amountKes: number;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
  statusCode: number;
}

// All API responses are wrapped in this envelope
export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors: unknown | null;
}

// apiFetch auto-unwraps the envelope, so these are the inner data shapes
export interface AuthResponse {
  token: string;
  fullName: string;
  email: string;
  role: string;
}

export interface OtpResponse {
  devOtp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  staffId: string;
  staffName: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface FeeType {
  id: string;
  code: FeeCode;
  label: string;
  amountKes: number;
  isActive: boolean;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}
