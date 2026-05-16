import { apiGet, apiPost } from '@/services/api';
import type { ClinicalNote, ClinicalFilters } from '../types/clinical.types';

const BASE = '/api/v1/clinical';

export const clinicalApi = {
  getNotes: (filters: ClinicalFilters) => 
    apiGet<ClinicalNote[]>(`${BASE}/notes`, { params: filters as Record<string, unknown> }),
  
  saveNote: (note: Partial<ClinicalNote>) => 
    apiPost<ClinicalNote>(`${BASE}/notes`, note),
};
