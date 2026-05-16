'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ehrApi, type EhrFilters } from '../services/ehr.api';
import type { EhrRecordData } from '../types/ehr.types';

const KEYS = {
  all: ['ehr'] as const,
  summary: (f: EhrFilters) => [...KEYS.all, 'summary', f] as const,
  patientData: (id: string) => [...KEYS.all, 'patientData', id] as const,
};

export function useEhrDashboard(filters: EhrFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => ehrApi.getDashboardSummary(filters),
  });
}

export function useEhrPatientData(patientId?: string) {
  return useQuery({
    queryKey: KEYS.patientData(patientId!),
    queryFn: () => ehrApi.getPatientData(patientId!),
    enabled: !!patientId,
  });
}

export function useSaveEhrRecord() {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: ({ id, data }: { id: string, data: EhrRecordData }) => ehrApi.savePatientRecord(id, data), 
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: KEYS.patientData(variables.id) });
      qc.invalidateQueries({ queryKey: KEYS.summary({}) });
    }
  });
}

export function useValidateEhrRecord() {
  return useMutation({ mutationFn: (data: EhrRecordData) => ehrApi.validateRecord(data) });
}

export function useMpiRecords(filters?: any) {
  return useQuery({
    queryKey: [...KEYS.all, 'mpi', filters],
    queryFn: () => ehrApi.getMpiRecords(filters),
  });
}

export function useResolveMpiRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'Merge' | 'Fix' }) => ehrApi.resolveMpiRecord(id, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...KEYS.all, 'mpi'] });
    }
  });
}
