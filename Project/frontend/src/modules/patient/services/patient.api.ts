/**
 * MedTrustX — Patient API Client
 * Maps to: patient-service endpoints
 */
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/services/api';
import type { PaginatedResponse, ApiResponse, ListQueryParams } from '@/types/api.types';
import type { Patient, CreatePatientPayload, UpdatePatientPayload } from '../types/patient.types';

const BASE = '/api/v1/patients';

export const patientApi = {
  /** List patients with pagination & filters */
  list: (params?: ListQueryParams) =>
    apiGet<PaginatedResponse<Patient>>(BASE, { params }),

  /** Get single patient by ID */
  getById: (id: string) =>
    apiGet<ApiResponse<Patient>>(`${BASE}/${id}`),

  /** Get patient by MRN */
  getByMrn: (mrn: string) =>
    apiGet<ApiResponse<Patient>>(`${BASE}/mrn/${mrn}`),

  /** Create new patient */
  create: (data: CreatePatientPayload) =>
    apiPost<ApiResponse<Patient>>(BASE, data),

  /** Update patient */
  update: (id: string, data: UpdatePatientPayload) =>
    apiPut<ApiResponse<Patient>>(`${BASE}/${id}`, data),

  /** Partial update */
  patch: (id: string, data: Partial<UpdatePatientPayload>) =>
    apiPatch<ApiResponse<Patient>>(`${BASE}/${id}`, data),

  /** Delete (soft) patient */
  delete: (id: string) =>
    apiDelete<void>(`${BASE}/${id}`),

  /** Search patients */
  search: (query: string) =>
    apiGet<PaginatedResponse<Patient>>(`${BASE}/search`, { params: { q: query } }),

  /** Get patient timeline / history */
  getTimeline: (id: string) =>
    apiGet<ApiResponse<unknown[]>>(`${BASE}/${id}/timeline`),
};
