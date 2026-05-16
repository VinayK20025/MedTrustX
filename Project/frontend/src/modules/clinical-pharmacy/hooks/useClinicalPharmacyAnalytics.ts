'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clinicalPharmacyApi, type ClinicalPharmacyFilters } from '../services/clinicalPharmacy.api';

const KEYS = {
  all: ['clinicalPharmacy'] as const,
  summary: (f: ClinicalPharmacyFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useClinicalPharmacyDashboard(filters: ClinicalPharmacyFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => clinicalPharmacyApi.getDashboardSummary(filters),
    staleTime: 30_000,
  });
}

export function useSubmitIntervention() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, medicationId, recommendation }: { patientId: string, medicationId: string, recommendation: string }) => clinicalPharmacyApi.submitIntervention(patientId, medicationId, recommendation),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useMarkAsReviewed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patientId: string) => clinicalPharmacyApi.markAsReviewed(patientId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => clinicalPharmacyApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
