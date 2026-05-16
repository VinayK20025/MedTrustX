'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ambulanceApi, type AmbFilters } from '../services/ambulance.api';

const KEYS = {
  all: ['ambulance'] as const,
  summary: (f: AmbFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useAmbulanceDashboard(filters: AmbFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => ambulanceApi.getDashboardSummary(filters), refetchInterval: 10_000 }); // High frequency for live GPS tracking
}

export function useUpdateDispatchStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => ambulanceApi.updateDispatchStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useTriggerEmergencyHorn() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => ambulanceApi.triggerEmergencyHorn(), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
