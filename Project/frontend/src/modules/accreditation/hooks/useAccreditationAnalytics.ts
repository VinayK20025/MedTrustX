'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accreditationApi, type AccFilters } from '../services/accreditation.api';

const KEYS = {
  all: ['accreditation'] as const,
  summary: (f: AccFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useAccreditationDashboard(filters: AccFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => accreditationApi.getDashboardSummary(filters), refetchInterval: 60_000 });
}

export function useUpdateChecklistItem() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) => accreditationApi.updateChecklistItem(id, status, notes), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useUploadEvidence() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, file }: { id: string; file: any }) => accreditationApi.uploadEvidence(id, file), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useCloseGap() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => accreditationApi.closeGap(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useRequestDocUpdate() {
  return useMutation({ mutationFn: (id: string) => accreditationApi.requestDocumentUpdate(id) });
}
