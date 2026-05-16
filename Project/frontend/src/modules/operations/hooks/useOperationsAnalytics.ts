'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operationsApi, type OpsFilters } from '../services/operations.api';

const KEYS = {
  all: ['operations'] as const,
  summary: (f: OpsFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useOperationsDashboard(filters: OpsFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => operationsApi.getDashboardSummary(filters),
    refetchInterval: 10_000, // Real-time high frequency
  });
}

export function useEscalateIncident() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, assignee }: { id: string; assignee: string }) => operationsApi.escalateIncident(id, assignee), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useResolveIncident() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => operationsApi.resolveIncident(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
