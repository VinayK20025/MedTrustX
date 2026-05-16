'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientTransportApi, type PtFilters } from '../services/patient-transport.api';

const KEYS = {
  all: ['patient-transport'] as const,
  summary: (f: PtFilters) => [...KEYS.all, 'summary', f] as const,
};

export function usePatientTransportDashboard(filters: PtFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => patientTransportApi.getDashboardSummary(filters), refetchInterval: 15_000 }); // High frequency for mobility
}

export function useUpdateTransportStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => patientTransportApi.updateTaskStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
