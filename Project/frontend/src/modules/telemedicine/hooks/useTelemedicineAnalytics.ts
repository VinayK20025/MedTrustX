'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { telemedicineApi, type TmFilters } from '../services/telemedicine.api';

const KEYS = {
  all: ['telemedicine'] as const,
  summary: (f: TmFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useTelemedicineDashboard(filters: TmFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => telemedicineApi.getDashboardSummary(filters), refetchInterval: 15_000 });
}

export function useStartConsultation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => telemedicineApi.startConsultation(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useEndConsultation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => telemedicineApi.endConsultation(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useSendPrescription() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, items }: { id: string; items: any[] }) => telemedicineApi.sendPrescription(id, items), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
