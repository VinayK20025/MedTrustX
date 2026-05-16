'use client';
import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { useEventSubscription } from '@/hooks/useEvents';
import type { ApiResponse } from '@/types/api.types';

/**
 * MedTrustX — Patient Context Provider
 * ──────────────────────────────────────────────────
 * Shared patient context used across clinical modules:
 *   • Doctor, Nurse, ICU Nurse, ER Nurse, OT modules
 *   • Pharmacy module (prescription context)
 *   • Diagnostics module (test orders)
 *   • Billing module (patient billing)
 *
 * Provides a cached patient object that auto-refreshes
 * when real-time events are received for the patient.
 */

interface PatientVitals {
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  spO2?: number;
  respiratoryRate?: number;
  painScore?: number;
  timestamp: string;
}

interface PatientContext {
  id: string;
  mrn: string;
  fullName: string;
  age: number;
  gender: string;
  bloodGroup?: string;
  status: string;
  ward?: string;
  bed?: string;
  department?: string;
  attendingDoctor?: string;
  allergies: string[];
  latestVitals?: PatientVitals;
  admittedAt?: string;
  primaryDiagnosis?: string;
}

interface PatientContextValue {
  patient: PatientContext | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

const PatientCtx = createContext<PatientContextValue>({
  patient: null,
  isLoading: false,
  error: null,
  refresh: () => {},
});

export function usePatientContext() {
  return useContext(PatientCtx);
}

interface PatientContextProviderProps {
  patientId: string;
  children: React.ReactNode;
}

export function PatientContextProvider({ patientId, children }: PatientContextProviderProps) {
  const queryClient = useQueryClient();

  const queryKey = ['patient-context', patientId];

  const { data: patient, isLoading, error } = useQuery({
    queryKey,
    queryFn: async (): Promise<PatientContext | null> => {
      try {
        // Fetch patient demographics + latest vitals in parallel
        const [patientRes, vitalsRes] = await Promise.allSettled([
          apiGet<ApiResponse<any>>(`/api/v1/patients/${patientId}`),
          apiGet<any>(`/api/v1/clinical/patients/${patientId}/vitals/latest`),
        ]);

        if (patientRes.status === 'rejected') return null;

        const p = patientRes.value?.data ?? patientRes.value;
        const v = vitalsRes.status === 'fulfilled' ? (vitalsRes.value?.data ?? vitalsRes.value) : null;

        return {
          id: p.id,
          mrn: p.mrn,
          fullName: p.fullName ?? `${p.firstName} ${p.lastName}`,
          age: p.age,
          gender: p.gender,
          bloodGroup: p.bloodGroup,
          status: p.status,
          ward: p.ward,
          bed: p.bed,
          department: p.department,
          attendingDoctor: p.attendingDoctor,
          allergies: p.allergies ?? [],
          latestVitals: v ? {
            heartRate: v.heartRate ?? v.heart_rate,
            bloodPressureSystolic: v.systolic ?? v.bp_systolic,
            bloodPressureDiastolic: v.diastolic ?? v.bp_diastolic,
            temperature: v.temperature ?? v.temp,
            spO2: v.spO2 ?? v.spo2,
            respiratoryRate: v.respiratoryRate ?? v.rr,
            painScore: v.painScore ?? v.pain_score,
            timestamp: v.timestamp ?? v.recorded_at,
          } : undefined,
          admittedAt: p.admittedAt,
          primaryDiagnosis: p.primaryDiagnosis,
        };
      } catch {
        return null;
      }
    },
    enabled: !!patientId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  // Auto-refresh on patient events
  useEventSubscription(
    { domains: ['patient', 'clinical', 'vitals'], entityTypes: [patientId] },
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey });
    }, [queryClient, queryKey]),
    !!patientId,
  );

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const value = useMemo(
    () => ({ patient: patient ?? null, isLoading, error: error as Error | null, refresh }),
    [patient, isLoading, error, refresh],
  );

  return <PatientCtx.Provider value={value}>{children}</PatientCtx.Provider>;
}
