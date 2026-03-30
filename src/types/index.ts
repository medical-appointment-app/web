// ── Generic API envelope ──────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ── Appointments ──────────────────────────────────────────────────────────────
export type AppointmentStatus =
  | 'LOCKED'
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface AppointmentResponse {
  id: number;
  patientUserId: string;
  doctorId: string;
  scheduledAt: string;       // ISO datetime string
  status: AppointmentStatus;
  notes: string | null;
  durationMinutes: number | null;
  lockedUntil: string | null; // ISO datetime — only set when status = LOCKED
  createdAt: string;
}

export interface AvailableSlotResponse {
  date: string;   // ISO date  e.g. "2026-04-01"
  time: string;   // ISO time  e.g. "09:00:00"
  durationMinutes: number;
}

export interface LockSlotRequest {
  scheduledAt: string;  // ISO datetime e.g. "2026-04-01T09:00:00"
  doctorId: string;
  notes?: string;
}

// ── Catalog ───────────────────────────────────────────────────────────────────
export interface CatalogItemResponse {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  available: boolean;
}

// ── Content pages ─────────────────────────────────────────────────────────────
export interface ContentPageResponse {
  id: number;
  slug: string;
  title: string;
  body: string;
  locale: string;
}

// ── Doctor ────────────────────────────────────────────────────────────────────
export interface DoctorResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  slotDurationMinutes: number | null;
}
