'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { himApi, type HimFilters } from '../services/him.api';

const KEYS = {
  all: ['him'] as const,
  summary: (f: HimFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useHimDashboard(filters: HimFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => himApi.getDashboardSummary(filters),
    staleTime: 30_000,
  });
}

export function useResolveViolation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ violationId, notes }: { violationId: string, notes: string }) => himApi.resolveViolation(violationId, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useTriggerInteropSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (systemId: string) => himApi.triggerInteropSync(systemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useApproveStandardUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updateId: string) => himApi.approveStandardUpdate(updateId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
