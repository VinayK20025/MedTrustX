'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrExecApi, type HrExecFilters } from '../services/hrExec.api';

const KEYS = {
  all: ['hrExec'] as const,
  summary: (f: HrExecFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useHrExecDashboard(filters: HrExecFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => hrExecApi.getDashboardSummary(filters),
    staleTime: 30_000,
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (taskId: string) => hrExecApi.completeTask(taskId), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useApproveLeave() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (leaveId: string) => hrExecApi.approveLeave(leaveId), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useRejectLeave() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (leaveId: string) => hrExecApi.rejectLeave(leaveId), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useCorrectAttendance() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ entryId, checkIn, checkOut }: { entryId: string; checkIn: string; checkOut: string }) => hrExecApi.correctAttendance(entryId, checkIn, checkOut), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useVerifyDocument() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ docId, decision }: { docId: string; decision: 'Verified' | 'Rejected' }) => hrExecApi.verifyDocument(docId, decision), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
