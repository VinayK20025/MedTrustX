'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrApi, type HrFilters } from '../services/hr.api';

const KEYS = {
  all: ['hr'] as const,
  summary: (f: HrFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useHrDashboard(filters: HrFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => hrApi.getDashboardSummary(filters),
    staleTime: 30_000,
  });
}

export function useApproveLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (staffId: string) => hrApi.approveLeave(staffId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAssignShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, shiftId }: { staffId: string; shiftId: string }) => hrApi.assignShift(staffId, shiftId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSendCredentialReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => hrApi.sendCredentialReminder(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
