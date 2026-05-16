'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ultrasoundApi, type UltrasoundFilters } from '../services/ultrasound.api';
import type { UltrasoundMeasurement } from '../types/ultrasound.types';

const KEYS = {
  all: ['ultrasound'] as const,
  summary: (f: UltrasoundFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useUltrasoundDashboard(filters: UltrasoundFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => ultrasoundApi.getDashboardSummary(filters),
    staleTime: 2_000,
    refetchInterval: 2_000, // Very frequent polling for live measurements
  });
}

export function useCaptureFrame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patientId: string) => ultrasoundApi.captureFrame(patientId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSaveMeasurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (meas: Omit<UltrasoundMeasurement, 'id' | 'timestamp'>) => ultrasoundApi.saveMeasurement(meas),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useToggleScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (isScanning: boolean) => ultrasoundApi.toggleScan(isScanning),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
