import client from './client';
import type {
  ApiResponse,
  AppointmentResponse,
  AvailableSlotResponse,
  LockSlotRequest,
} from '../types';

export const appointmentsApi = {
  /** Step 1 — get free slots for a given date (YYYY-MM-DD). */
  getSlots: (date: string) =>
    client
      .get<ApiResponse<AvailableSlotResponse[]>>('/appointments/slots', { params: { date } })
      .then((r) => r.data.data),

  /** Step 2 — reserve (lock) a slot for 10 minutes. */
  reserve: (payload: LockSlotRequest) =>
    client
      .post<ApiResponse<AppointmentResponse>>('/appointments/reserve', payload)
      .then((r) => r.data.data),

  /** Step 3 — confirm a reserved appointment. */
  confirm: (id: number) =>
    client
      .post<ApiResponse<AppointmentResponse>>(`/appointments/${id}/confirm`)
      .then((r) => r.data.data),

  /** Cancel an appointment. */
  cancel: (id: number) =>
    client
      .patch<ApiResponse<AppointmentResponse>>(`/appointments/${id}/cancel`)
      .then((r) => r.data.data),

  /** Get all appointments for the logged-in patient. */
  getMyAppointments: () =>
    client
      .get<ApiResponse<AppointmentResponse[]>>('/appointments')
      .then((r) => r.data.data),
};
