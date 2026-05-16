import { apiGet, apiPost } from '@/services/api';
import type { DiagnosticResult, DiagnosticsFilters } from '../types/diagnostics.types';

const BASE = '/api/v1/diagnostics';

export const diagnosticsApi = {
  getResults: (filters: DiagnosticsFilters) => 
    apiGet<DiagnosticResult[]>(`${BASE}/results`, { params: filters as Record<string, unknown> }),
  
  orderTest: (test: Partial<DiagnosticResult>) => 
    apiPost<DiagnosticResult>(`${BASE}/orders`, test),
};
