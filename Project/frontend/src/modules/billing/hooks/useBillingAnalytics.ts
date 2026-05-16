'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi, type BillingFilters } from '../services/billing.api';

const KEYS = {
  all: ['billing'] as const,
  summary: (f: BillingFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useBillingDashboard(filters: BillingFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => billingApi.getDashboardSummary(filters),
    staleTime: 15_000,
  });
}

export function useAddService() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ billId, serviceId }: { billId: string; serviceId: string }) => billingApi.addService(billId, serviceId), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useApplyDiscount() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ billId, percent }: { billId: string; percent: number }) => billingApi.applyDiscount(billId, percent), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useProcessPayment() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ billId, method, amount }: { billId: string; method: string; amount: number }) => billingApi.processPayment(billId, method, amount), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useFinalizeBill() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (billId: string) => billingApi.finalizeBill(billId), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
