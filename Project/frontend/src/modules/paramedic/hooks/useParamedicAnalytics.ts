'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paramedicApi, type ParaFilters } from '../services/paramedic.api';

const KEYS = {
  all: ['paramedic'] as const,
  summary: (f: ParaFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useParamedicDashboard(filters: ParaFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => paramedicApi.getDashboardSummary(filters), refetchInterval: 5_000 }); // Extremely high freq for active emergency
}

export function useLogIntervention() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (action: string) => paramedicApi.logIntervention(action), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useRecordVitals() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: any) => paramedicApi.recordVitals(payload), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useNotifyER() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => paramedicApi.notifyER(), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
