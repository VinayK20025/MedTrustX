'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { infectionControlApi, type IcFilters } from '../services/infection-control.api';

const KEYS = {
  all: ['infection-control'] as const,
  summary: (f: IcFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useInfectionControlDashboard(filters: IcFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => infectionControlApi.getDashboardSummary(filters), refetchInterval: 15_000 });
}

export function useIsolatePatient() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => infectionControlApi.isolatePatient(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useCompleteContainmentStep() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, step }: { id: string; step: number }) => infectionControlApi.completeContainmentStep(id, step), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useRaiseAuditAction() {
  return useMutation({ mutationFn: (id: string) => infectionControlApi.raiseAuditAction(id) });
}

export function useFlagProtocol() {
  return useMutation({ mutationFn: (id: string) => infectionControlApi.flagProtocol(id) });
}
