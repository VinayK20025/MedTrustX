'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pharmacyAssistantApi, type AssistantFilters } from '../services/pharmacyAssistant.api';

const KEYS = {
  all: ['pharmacyAssistant'] as const,
  summary: (f: AssistantFilters) => [...KEYS.all, 'summary', f] as const,
};

export function usePharmacyAssistantDashboard(filters: AssistantFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => pharmacyAssistantApi.getDashboardSummary(filters),
    staleTime: 5_000,
    refetchInterval: 5_000,
  });
}

export function useCallNextPatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => pharmacyAssistantApi.callNextPatient(),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useMarkItemFetched() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, itemId }: { taskId: string, itemId: string }) => pharmacyAssistantApi.markItemFetched(taskId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useHandoverToPharmacist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => pharmacyAssistantApi.handoverToPharmacist(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useCompleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => pharmacyAssistantApi.completeTransaction(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
