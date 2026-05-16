'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pharmacyChiefApi, type PharmacyFilters } from '../services/pharmacyChief.api';

const KEYS = {
  all: ['pharmacyChief'] as const,
  summary: (f: PharmacyFilters) => [...KEYS.all, 'summary', f] as const,
};

export function usePharmacyChiefDashboard(filters: PharmacyFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => pharmacyChiefApi.getDashboardSummary(filters),
    staleTime: 60_000,
  });
}

export function useApprovePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => pharmacyChiefApi.approvePurchaseOrder(orderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateEventStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: string, status: 'Investigating' | 'Resolved' | 'Reported to Regulator' }) => pharmacyChiefApi.updateEventStatus(eventId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => pharmacyChiefApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
