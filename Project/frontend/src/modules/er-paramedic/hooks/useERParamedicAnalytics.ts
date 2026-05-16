'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { erParamedicApi, type ERFilters } from '../services/er-paramedic.api';

const KEYS = {
  all: ['er-paramedic'] as const,
  summary: (f: ERFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useERParamedicDashboard(filters: ERFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => erParamedicApi.getDashboardSummary(filters), refetchInterval: 3_000 }); // Extremely fast poll for code blue
}

export function useLogEmergencyAction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (action: string) => erParamedicApi.logAction(action), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useCompleteProtocolStep() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => erParamedicApi.completeProtocolStep(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
