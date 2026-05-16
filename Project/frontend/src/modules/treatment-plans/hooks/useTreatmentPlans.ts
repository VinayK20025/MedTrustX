'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { treatmentPlansApi } from '../services/treatment-plans.api';
import type {
  TreatmentPlansDashboardData,
  TreatmentPlan,
  TreatmentPlanVersion,
  TreatmentPlanItem,
  TreatmentAdherence,
  TreatmentPlansFilters,
  TreatmentPlanCreateRequest,
} from '../types/treatment-plans.types';

const TREATMENT_PLANS_KEYS = {
  dashboard: ['treatmentPlans', 'dashboard'],
  plans: ['treatmentPlans', 'plans'],
  plan: (planId: string) => ['treatmentPlans', 'plan', planId],
  versions: (planId: string) => ['treatmentPlans', 'versions', planId],
};

export const useTreatmentPlansDashboard = (filters?: TreatmentPlansFilters) => {
  return useQuery<TreatmentPlansDashboardData>({
    queryKey: [TREATMENT_PLANS_KEYS.dashboard, filters],
    queryFn: () => treatmentPlansApi.getDashboardSummary(filters ?? {}).then((res) => res.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 3,
  });
};

export const useTreatmentPlans = (filters?: TreatmentPlansFilters) => {
  return useQuery<TreatmentPlan[]>({
    queryKey: [TREATMENT_PLANS_KEYS.plans, filters],
    queryFn: () => treatmentPlansApi.getPlans(filters ?? {}).then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });
};

export const useTreatmentPlan = (planId: string) => {
  return useQuery<TreatmentPlan>({
    queryKey: TREATMENT_PLANS_KEYS.plan(planId),
    queryFn: () => treatmentPlansApi.getPlan(planId).then((res) => res.data),
    enabled: Boolean(planId),
    staleTime: 1000 * 60 * 5,
  });
};

export const useTreatmentPlanVersions = (planId: string) => {
  return useQuery<TreatmentPlanVersion[]>({
    queryKey: TREATMENT_PLANS_KEYS.versions(planId),
    queryFn: () => treatmentPlansApi.getPlanVersions(planId).then((res) => res.data),
    enabled: Boolean(planId),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateTreatmentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: TreatmentPlanCreateRequest) => treatmentPlansApi.createPlan(request).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TREATMENT_PLANS_KEYS.plans });
      queryClient.invalidateQueries({ queryKey: TREATMENT_PLANS_KEYS.dashboard });
    },
  });
};

export const useUpdateTreatmentPlanStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, status }: { planId: string; status: TreatmentPlan['status'] }) =>
      treatmentPlansApi.updatePlanStatus(planId, status).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TREATMENT_PLANS_KEYS.plans });
      queryClient.invalidateQueries({ queryKey: TREATMENT_PLANS_KEYS.dashboard });
    },
  });
};

export const useAddTreatmentPlanItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, item }: { planId: string; item: { itemType: TreatmentPlanItem['itemType']; description: string; schedule: Record<string, any> } }) =>
      treatmentPlansApi.addPlanItem(planId, item).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TREATMENT_PLANS_KEYS.plans });
      queryClient.invalidateQueries({ queryKey: TREATMENT_PLANS_KEYS.dashboard });
    },
  });
};

export const useRecordTreatmentAdherence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, adherenceStatus, notes }: { planId: string; adherenceStatus: TreatmentAdherence['adherenceStatus']; notes?: string }) =>
      treatmentPlansApi.recordAdherence(planId, adherenceStatus, notes).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TREATMENT_PLANS_KEYS.dashboard });
    },
  });
};
