'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cdssApi, type CdssFilters } from '../services/cdss.api';
import type {
  CDSSRecommendation,
  CDSSRule,
  CDSSAlert,
  CDSSEvaluation,
  CDSSDashboardData,
  CDSSEvaluateRequest,
} from '../types/cdss.types';

const CDSS_QUERY_KEYS = {
  dashboard: ['cdss', 'dashboard'],
  recommendations: ['cdss', 'recommendations'],
  rules: ['cdss', 'rules'],
  alerts: ['cdss', 'alerts'],
  evaluations: ['cdss', 'evaluations'],
  patientRecommendations: (patientId: string) => ['cdss', 'recommendations', patientId],
  patientAlerts: (patientId: string) => ['cdss', 'alerts', patientId],
  patientEvaluations: (patientId: string) => ['cdss', 'evaluations', patientId],
};

export const useCDSSDashboard = (filters?: CdssFilters) => {
  return useQuery<CDSSDashboardData>({
    queryKey: [CDSS_QUERY_KEYS.dashboard, filters],
    queryFn: () => cdssApi.getDashboardSummary(filters ?? {}).then((res) => res.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCDSSRecommendations = (filters?: CdssFilters) => {
  return useQuery<CDSSRecommendation[]>({
    queryKey: [CDSS_QUERY_KEYS.recommendations, filters],
    queryFn: () => cdssApi.getRecommendations(filters ?? {}).then((res) => res.data),
    staleTime: 1000 * 60 * 3,
    refetchInterval: 1000 * 60 * 5,
  });
};

export const useCDSSRules = (filters?: CdssFilters) => {
  return useQuery<CDSSRule[]>({
    queryKey: [CDSS_QUERY_KEYS.rules, filters],
    queryFn: () => cdssApi.getRules(filters ?? {}).then((res) => res.data),
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 10,
  });
};

export const useCDSSAlerts = (filters?: CdssFilters) => {
  return useQuery<CDSSAlert[]>({
    queryKey: [CDSS_QUERY_KEYS.alerts, filters],
    queryFn: () => cdssApi.getAlerts(filters ?? {}).then((res) => res.data),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 1, // 1 minute for alerts
  });
};

export const useCDSSEvaluations = (filters?: CdssFilters) => {
  return useQuery<CDSSEvaluation[]>({
    queryKey: [CDSS_QUERY_KEYS.evaluations, filters],
    queryFn: () => cdssApi.getEvaluations(filters ?? {}).then((res) => res.data),
    staleTime: 1000 * 60 * 3,
    refetchInterval: 1000 * 60 * 5,
  });
};

export const useApproveCDSSRecommendation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recId, feedback }: { recId: string; feedback?: string }) =>
      cdssApi.approveRecommendation(recId, feedback).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CDSS_QUERY_KEYS.dashboard });
      queryClient.invalidateQueries({ queryKey: CDSS_QUERY_KEYS.recommendations });
    },
  });
};

export const useRejectCDSSRecommendation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recId, feedback }: { recId: string; feedback?: string }) =>
      cdssApi.rejectRecommendation(recId, feedback).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CDSS_QUERY_KEYS.dashboard });
      queryClient.invalidateQueries({ queryKey: CDSS_QUERY_KEYS.recommendations });
    },
  });
};

export const useAcknowledgeCDSSAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => cdssApi.acknowledgeAlert(alertId).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CDSS_QUERY_KEYS.dashboard });
      queryClient.invalidateQueries({ queryKey: CDSS_QUERY_KEYS.alerts });
    },
  });
};

export const useCreateCDSSRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleData: Partial<CDSSRule>) => cdssApi.createRule(ruleData).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CDSS_QUERY_KEYS.rules });
      queryClient.invalidateQueries({ queryKey: CDSS_QUERY_KEYS.dashboard });
    },
  });
};

export const useUpdateCDSSRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, ruleData }: { ruleId: string; ruleData: Partial<CDSSRule> }) =>
      cdssApi.updateRule(ruleId, ruleData).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CDSS_QUERY_KEYS.rules });
      queryClient.invalidateQueries({ queryKey: CDSS_QUERY_KEYS.dashboard });
    },
  });
};

export const useEvaluatePatientCDSS = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (evalReq: CDSSEvaluateRequest) => cdssApi.evaluatePatient(evalReq).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CDSS_QUERY_KEYS.evaluations });
      queryClient.invalidateQueries({ queryKey: CDSS_QUERY_KEYS.recommendations });
      queryClient.invalidateQueries({ queryKey: CDSS_QUERY_KEYS.alerts });
      queryClient.invalidateQueries({ queryKey: CDSS_QUERY_KEYS.dashboard });
    },
  });
};
