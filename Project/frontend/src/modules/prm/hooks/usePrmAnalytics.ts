'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prmApi, type PrmFilters } from '../services/prm.api';

const KEYS = {
  all: ['prm'] as const,
  summary: (f: PrmFilters) => [...KEYS.all, 'summary', f] as const,
};

export function usePrmDashboard(filters: PrmFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => prmApi.getDashboardSummary(filters),
    staleTime: 30_000,
  });
}

export function useEscalateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (complaintId: string) => prmApi.escalateComplaint(complaintId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useResolveComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ complaintId, notes }: { complaintId: string, notes: string }) => prmApi.resolveComplaint(complaintId, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSendPatientFollowup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, message }: { patientId: string, message: string }) => prmApi.sendPatientFollowup(patientId, message),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
