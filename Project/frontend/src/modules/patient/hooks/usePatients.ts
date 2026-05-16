/**
 * MedTrustX — Patient Data Hooks
 * React Query hooks for patient data management.
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '../services/patient.api';
import { notify } from '@/store/notification.store';
import type { ListQueryParams } from '@/types/api.types';
import type { CreatePatientPayload, UpdatePatientPayload } from '../types/patient.types';
import { useEventInvalidation } from '@/hooks/useEvents';

const QUERY_KEYS = {
  all: ['patients'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (params?: ListQueryParams) => [...QUERY_KEYS.lists(), params] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
  search: (query: string) => [...QUERY_KEYS.all, 'search', query] as const,
};

/** Fetch paginated patient list */
export function usePatients(params?: ListQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => patientApi.list(params),
  });
}

/** Fetch single patient */
export function usePatient(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => patientApi.getById(id),
    enabled: !!id,
  });
}

/** Search patients */
export function usePatientSearch(query: string) {
  return useQuery({
    queryKey: QUERY_KEYS.search(query),
    queryFn: () => patientApi.search(query),
    enabled: query.length >= 2,
  });
}

/** Create patient mutation */
export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePatientPayload) => patientApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      notify.success('Patient Created', 'New patient record has been created successfully.');
    },
    onError: () => {
      notify.error('Creation Failed', 'Failed to create patient record. Please try again.');
    },
  });
}

/** Update patient mutation */
export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientPayload }) => patientApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      notify.success('Patient Updated', 'Patient record has been updated successfully.');
    },
    onError: () => {
      notify.error('Update Failed', 'Failed to update patient record.');
    },
  });
}

/** Delete patient mutation */
export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      notify.success('Patient Deleted', 'Patient record has been removed.');
    },
    onError: () => {
      notify.error('Deletion Failed', 'Failed to delete patient record.');
    },
  });
}

/** Auto-invalidate patient queries on real-time events */
export function usePatientEvents() {
  useEventInvalidation(
    { domains: ['patient'], actions: ['CREATED', 'UPDATED', 'DELETED', 'ADMITTED', 'DISCHARGED'] },
    [QUERY_KEYS.all as unknown as string[]],
  );
}
