'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi, type DoctorFilters } from '../services/doctor.api';

const KEYS = {
  all: ['doctor'] as const,
  summary: (f: DoctorFilters) => [...KEYS.all, 'summary', f] as const,
};

/** 30-second polling — clinical workflow pace */
export function useDoctorDashboard(filters: DoctorFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => doctorApi.getDashboardSummary(filters),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useAddNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, note }: { patientId: string; note: string }) => doctorApi.addNote(patientId, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function usePrescribe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, rx }: { patientId: string; rx: any }) => doctorApi.prescribe(patientId, rx),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
