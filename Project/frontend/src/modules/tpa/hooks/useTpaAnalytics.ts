'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tpaApi, type TpaFilters } from '../services/tpa.api';

const KEYS = {
  all: ['tpa'] as const,
  summary: (f: TpaFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useTpaDashboard(filters: TpaFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => tpaApi.getDashboardSummary(filters),
    staleTime: 15_000,
  });
}

export function useUploadTpaDocument() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ caseId, docType }: { caseId: string; docType: string }) => tpaApi.uploadDocument(caseId, docType), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useAddTpaCommunication() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ caseId, message }: { caseId: string; message: string }) => tpaApi.addCommunication(caseId, message), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useEscalateTpaCase() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (caseId: string) => tpaApi.escalateCase(caseId), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
