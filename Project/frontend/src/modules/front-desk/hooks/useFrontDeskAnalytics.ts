'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { frontDeskApi, type FrontDeskFilters } from '../services/frontDesk.api';
import type { PatientRegistration } from '../types/frontDesk.types';

const KEYS = {
  all: ['frontDesk'] as const,
  summary: (f: FrontDeskFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useFrontDeskDashboard(filters: FrontDeskFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => frontDeskApi.getDashboardSummary(filters),
    staleTime: 15_000,
    refetchInterval: 20_000, // Fast polling for queue updates
  });
}

export function useRegisterPatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patient: Partial<PatientRegistration>) => frontDeskApi.registerPatient(patient),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useBookAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, patientMrn }: { slotId: string, patientMrn: string }) => frontDeskApi.bookAppointment(slotId, patientMrn),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useGenerateToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientMrn, department }: { patientMrn: string, department: string }) => frontDeskApi.generateToken(patientMrn, department),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useCallNextToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (department: string) => frontDeskApi.callNextToken(department),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSkipToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tokenId: string) => frontDeskApi.skipToken(tokenId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
