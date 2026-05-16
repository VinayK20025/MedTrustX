'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pharmacyApi, type DispensingFilters } from '../services/pharmacy.api';

const KEYS = {
  all: ['pharmacyDispensing'] as const,
  summary: (f: DispensingFilters) => [...KEYS.all, 'summary', f] as const,
};

export function usePharmacyDashboard(filters: DispensingFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => pharmacyApi.getDashboardSummary(filters),
    staleTime: 10_000,
    refetchInterval: 10_000, // Poll often for new prescriptions
  });
}

export function useScanBarcode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ prescriptionId, drugId, barcode }: { prescriptionId: string, drugId: string, barcode: string }) => pharmacyApi.scanDrugBarcode(prescriptionId, drugId, barcode),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDispensePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prescriptionId: string) => pharmacyApi.dispensePrescription(prescriptionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => pharmacyApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
