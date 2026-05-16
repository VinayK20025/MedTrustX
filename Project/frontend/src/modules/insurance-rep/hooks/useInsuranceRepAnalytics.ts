'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insuranceRepApi, type IrFilters } from '../services/insurance-rep.api';

const KEYS = {
  all: ['insurance-rep'] as const,
  summary: (f: IrFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useInsuranceRepDashboard(filters: IrFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => insuranceRepApi.getDashboardSummary(filters), refetchInterval: 30_000 });
}

export function useApprovePreAuth() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => insuranceRepApi.approvePreAuth(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useRejectPreAuth() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => insuranceRepApi.rejectPreAuth(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useApproveClaim() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => insuranceRepApi.approveClaim(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useQueryCase() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, message }: { id: string; message: string }) => insuranceRepApi.queryCase(id, message), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
