'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nurseWardApi, type NwFilters } from '../services/nurse-ward.api';

const KEYS = {
  all: ['nurse-ward'] as const,
  summary: (f: NwFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useNurseWardDashboard(filters: NwFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => nurseWardApi.getDashboardSummary(filters), refetchInterval: 15_000 }); // High frequency for bedside
}

export function useAdministerMedication() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => nurseWardApi.administerMed(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useCompleteCareTask() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => nurseWardApi.completeTask(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useRecordVitals() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: string; payload: any }) => nurseWardApi.recordVitals(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
