import client from './client';
import type { ApiResponse, DoctorResponse } from '../types';

export const doctorApi = {
  get: () =>
    client
      .get<ApiResponse<DoctorResponse>>('/doctor')
      .then((r) => r.data.data),
};
