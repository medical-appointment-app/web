import client from './client';
import type { ApiResponse, CatalogItemResponse, PagedResponse } from '../types';

export const catalogApi = {
  getItems: (params?: { category?: string; page?: number; size?: number }) =>
    client
      .get<ApiResponse<PagedResponse<CatalogItemResponse>>>('/catalog', { params })
      .then((r) => r.data.data),

  getById: (id: number) =>
    client
      .get<ApiResponse<CatalogItemResponse>>(`/catalog/${id}`)
      .then((r) => r.data.data),
};
