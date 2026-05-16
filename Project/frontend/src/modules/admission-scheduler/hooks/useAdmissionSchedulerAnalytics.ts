'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { admissionSchedulerApi, type AdmSchedulerFilters } from '../services/admissionScheduler.api';
import type { AdmissionFormData } from '../types/admissionScheduler.types';

const KEYS = {
  all: ['admissionScheduler'] as const,
  summary: (f: AdmSchedulerFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useAdmissionSchedulerDashboard(filters: AdmSchedulerFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => admissionSchedulerApi.getDashboardSummary(filters),
    staleTime: 15_000,
    refetchInterval: 25_000,
  });
}

export function useBookSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, patientMrn }: { slotId: string; patientMrn: string }) => admissionSchedulerApi.bookSlot(slotId, patientMrn),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useCancelSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slotId: string) => admissionSchedulerApi.cancelSlot(slotId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function usePromoteWaitlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ waitlistId, slotId }: { waitlistId: string; slotId: string }) => admissionSchedulerApi.promoteWaitlist(waitlistId, slotId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSubmitAdmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: AdmissionFormData) => admissionSchedulerApi.submitAdmission(form),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAllocateBed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bedId, patientMrn }: { bedId: string; patientMrn: string }) => admissionSchedulerApi.allocateBed(bedId, patientMrn),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
