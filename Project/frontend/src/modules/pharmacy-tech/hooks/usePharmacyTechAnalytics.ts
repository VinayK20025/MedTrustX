'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pharmacyTechApi, type PharmacyTechFilters } from '../services/pharmacyTech.api';

const KEYS = {
  all: ['pharmacyTech'] as const,
  summary: (f: PharmacyTechFilters) => [...KEYS.all, 'summary', f] as const,
};

export function usePharmacyTechDashboard(filters: PharmacyTechFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => pharmacyTechApi.getDashboardSummary(filters),
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}

export function useScanPickBarcode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, itemId, barcode }: { taskId: string, itemId: string, barcode: string }) => pharmacyTechApi.scanPickBarcode(taskId, itemId, barcode),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function usePrintLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => pharmacyTechApi.printLabel(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useHandoverTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => pharmacyTechApi.handoverToPharmacist(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
