'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { researchApi } from '../services/research.api';

const KEYS = {
  all: ['clinicalResearch'] as const,
  dashboard: ['clinicalResearch', 'dashboard'] as const,
};

export function useResearchDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => researchApi.getDashboardData(),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

export function useUpdateTrialStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ trialId, status }: { trialId: string; status: string }) => 
      researchApi.updateTrialStatus(trialId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}

export function useEnrollPatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ trialId, patientId }: { trialId: string; patientId: string }) => 
      researchApi.enrollPatient(trialId, patientId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}

export function usePublishDataset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datasetId: string) => researchApi.publishDataset(datasetId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
