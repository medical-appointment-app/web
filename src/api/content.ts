import client from './client';
import type { ApiResponse, ContentPageResponse } from '../types';

export const contentApi = {
  getAll: (locale = 'en') =>
    client
      .get<ApiResponse<ContentPageResponse[]>>('/content', { params: { locale } })
      .then((r) => r.data.data),

  getBySlug: (slug: string, locale = 'en') =>
    client
      .get<ApiResponse<ContentPageResponse>>('/content/slug', { params: { slug, locale } })
      .then((r) => r.data.data),
};
