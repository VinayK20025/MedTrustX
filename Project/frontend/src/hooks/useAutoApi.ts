/**
 * AUTO-GENERATED MEDTRUSTX API HOOKS
 * Provides React Query integration for all microservices.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import { autoEndpoints } from '@/services/autoEndpoints';

export function useAutoApi() {
  const queryClient = useQueryClient();
  return {
    accessControl: {
      useList: (params?: any) => useQuery({
        queryKey: ['accessControl', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.accessControl.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['accessControl', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.accessControl.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.accessControl.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accessControl', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.accessControl.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['accessControl', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['accessControl', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.accessControl.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accessControl', 'list'] }),
      }),
    },
    accessReview: {
      useList: (params?: any) => useQuery({
        queryKey: ['accessReview', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.accessReview.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['accessReview', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.accessReview.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.accessReview.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accessReview', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.accessReview.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['accessReview', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['accessReview', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.accessReview.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accessReview', 'list'] }),
      }),
    },
    accreditation: {
      useList: (params?: any) => useQuery({
        queryKey: ['accreditation', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.accreditation.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['accreditation', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.accreditation.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.accreditation.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accreditation', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.accreditation.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['accreditation', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['accreditation', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.accreditation.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accreditation', 'list'] }),
      }),
    },
    ai: {
      useList: (params?: any) => useQuery({
        queryKey: ['ai', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.ai.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['ai', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.ai.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.ai.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.ai.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['ai', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['ai', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.ai.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai', 'list'] }),
      }),
    },
    aiGovernanceExplainability: {
      useList: (params?: any) => useQuery({
        queryKey: ['aiGovernanceExplainability', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.aiGovernanceExplainability.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['aiGovernanceExplainability', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.aiGovernanceExplainability.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.aiGovernanceExplainability.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['aiGovernanceExplainability', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.aiGovernanceExplainability.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['aiGovernanceExplainability', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['aiGovernanceExplainability', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.aiGovernanceExplainability.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['aiGovernanceExplainability', 'list'] }),
      }),
    },
    aiPlatform: {
      useList: (params?: any) => useQuery({
        queryKey: ['aiPlatform', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.aiPlatform.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['aiPlatform', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.aiPlatform.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.aiPlatform.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['aiPlatform', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.aiPlatform.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['aiPlatform', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['aiPlatform', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.aiPlatform.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['aiPlatform', 'list'] }),
      }),
    },
    alertCorrelationEngine: {
      useList: (params?: any) => useQuery({
        queryKey: ['alertCorrelationEngine', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.alertCorrelationEngine.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['alertCorrelationEngine', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.alertCorrelationEngine.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.alertCorrelationEngine.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alertCorrelationEngine', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.alertCorrelationEngine.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['alertCorrelationEngine', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['alertCorrelationEngine', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.alertCorrelationEngine.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alertCorrelationEngine', 'list'] }),
      }),
    },
    analytics: {
      useList: (params?: any) => useQuery({
        queryKey: ['analytics', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.analytics.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['analytics', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.analytics.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.analytics.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['analytics', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.analytics.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['analytics', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['analytics', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.analytics.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['analytics', 'list'] }),
      }),
    },
    apiCompositionGateway: {
      useList: (params?: any) => useQuery({
        queryKey: ['apiCompositionGateway', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.apiCompositionGateway.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['apiCompositionGateway', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.apiCompositionGateway.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.apiCompositionGateway.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apiCompositionGateway', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.apiCompositionGateway.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['apiCompositionGateway', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['apiCompositionGateway', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.apiCompositionGateway.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apiCompositionGateway', 'list'] }),
      }),
    },
    appointment: {
      useList: (params?: any) => useQuery({
        queryKey: ['appointment', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.appointment.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['appointment', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.appointment.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.appointment.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointment', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.appointment.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['appointment', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['appointment', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.appointment.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointment', 'list'] }),
      }),
    },
    assetTrackingRtls: {
      useList: (params?: any) => useQuery({
        queryKey: ['assetTrackingRtls', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.assetTrackingRtls.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['assetTrackingRtls', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.assetTrackingRtls.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.assetTrackingRtls.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assetTrackingRtls', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.assetTrackingRtls.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['assetTrackingRtls', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['assetTrackingRtls', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.assetTrackingRtls.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assetTrackingRtls', 'list'] }),
      }),
    },
    audit: {
      useList: (params?: any) => useQuery({
        queryKey: ['audit', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.audit.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['audit', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.audit.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.audit.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['audit', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.audit.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['audit', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['audit', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.audit.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['audit', 'list'] }),
      }),
    },
    automationRpaEngine: {
      useList: (params?: any) => useQuery({
        queryKey: ['automationRpaEngine', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.automationRpaEngine.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['automationRpaEngine', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.automationRpaEngine.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.automationRpaEngine.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automationRpaEngine', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.automationRpaEngine.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['automationRpaEngine', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['automationRpaEngine', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.automationRpaEngine.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automationRpaEngine', 'list'] }),
      }),
    },
    bedManagement: {
      useList: (params?: any) => useQuery({
        queryKey: ['bedManagement', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.bedManagement.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['bedManagement', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.bedManagement.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.bedManagement.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bedManagement', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.bedManagement.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['bedManagement', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['bedManagement', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.bedManagement.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bedManagement', 'list'] }),
      }),
    },
    billing: {
      useList: (params?: any) => useQuery({
        queryKey: ['billing', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.billing.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['billing', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.billing.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.billing.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['billing', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.billing.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['billing', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['billing', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.billing.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['billing', 'list'] }),
      }),
    },
    biomedicalEngineering: {
      useList: (params?: any) => useQuery({
        queryKey: ['biomedicalEngineering', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.biomedicalEngineering.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['biomedicalEngineering', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.biomedicalEngineering.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.biomedicalEngineering.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['biomedicalEngineering', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.biomedicalEngineering.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['biomedicalEngineering', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['biomedicalEngineering', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.biomedicalEngineering.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['biomedicalEngineering', 'list'] }),
      }),
    },
    bloodBank: {
      useList: (params?: any) => useQuery({
        queryKey: ['bloodBank', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.bloodBank.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['bloodBank', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.bloodBank.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.bloodBank.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bloodBank', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.bloodBank.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['bloodBank', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['bloodBank', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.bloodBank.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bloodBank', 'list'] }),
      }),
    },
    boardReporting: {
      useList: (params?: any) => useQuery({
        queryKey: ['boardReporting', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.boardReporting.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['boardReporting', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.boardReporting.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.boardReporting.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boardReporting', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.boardReporting.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['boardReporting', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['boardReporting', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.boardReporting.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boardReporting', 'list'] }),
      }),
    },
    careCoordination: {
      useList: (params?: any) => useQuery({
        queryKey: ['careCoordination', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.careCoordination.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['careCoordination', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.careCoordination.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.careCoordination.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['careCoordination', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.careCoordination.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['careCoordination', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['careCoordination', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.careCoordination.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['careCoordination', 'list'] }),
      }),
    },
    caseManagement: {
      useList: (params?: any) => useQuery({
        queryKey: ['caseManagement', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.caseManagement.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['caseManagement', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.caseManagement.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.caseManagement.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['caseManagement', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.caseManagement.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['caseManagement', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['caseManagement', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.caseManagement.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['caseManagement', 'list'] }),
      }),
    },
    cctvSurveillance: {
      useList: (params?: any) => useQuery({
        queryKey: ['cctvSurveillance', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.cctvSurveillance.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['cctvSurveillance', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.cctvSurveillance.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.cctvSurveillance.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cctvSurveillance', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.cctvSurveillance.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['cctvSurveillance', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['cctvSurveillance', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.cctvSurveillance.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cctvSurveillance', 'list'] }),
      }),
    },
    cdss: {
      useList: (params?: any) => useQuery({
        queryKey: ['cdss', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.cdss.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['cdss', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.cdss.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.cdss.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cdss', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.cdss.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['cdss', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['cdss', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.cdss.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cdss', 'list'] }),
      }),
    },
    clickhouseAnalytics: {
      useList: (params?: any) => useQuery({
        queryKey: ['clickhouseAnalytics', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.clickhouseAnalytics.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['clickhouseAnalytics', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.clickhouseAnalytics.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.clickhouseAnalytics.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clickhouseAnalytics', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.clickhouseAnalytics.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['clickhouseAnalytics', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['clickhouseAnalytics', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.clickhouseAnalytics.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clickhouseAnalytics', 'list'] }),
      }),
    },
    clinical: {
      useList: (params?: any) => useQuery({
        queryKey: ['clinical', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.clinical.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['clinical', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.clinical.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.clinical.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clinical', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.clinical.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['clinical', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['clinical', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.clinical.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clinical', 'list'] }),
      }),
    },
    clinicalPathwayIntelligence: {
      useList: (params?: any) => useQuery({
        queryKey: ['clinicalPathwayIntelligence', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.clinicalPathwayIntelligence.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['clinicalPathwayIntelligence', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.clinicalPathwayIntelligence.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.clinicalPathwayIntelligence.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clinicalPathwayIntelligence', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.clinicalPathwayIntelligence.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['clinicalPathwayIntelligence', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['clinicalPathwayIntelligence', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.clinicalPathwayIntelligence.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clinicalPathwayIntelligence', 'list'] }),
      }),
    },
    clinicalResearch: {
      useList: (params?: any) => useQuery({
        queryKey: ['clinicalResearch', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.clinicalResearch.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['clinicalResearch', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.clinicalResearch.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.clinicalResearch.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clinicalResearch', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.clinicalResearch.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['clinicalResearch', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['clinicalResearch', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.clinicalResearch.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clinicalResearch', 'list'] }),
      }),
    },
    compliance: {
      useList: (params?: any) => useQuery({
        queryKey: ['compliance', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.compliance.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['compliance', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.compliance.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.compliance.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compliance', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.compliance.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['compliance', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['compliance', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.compliance.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compliance', 'list'] }),
      }),
    },
    complianceEnforcement: {
      useList: (params?: any) => useQuery({
        queryKey: ['complianceEnforcement', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.complianceEnforcement.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['complianceEnforcement', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.complianceEnforcement.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.complianceEnforcement.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complianceEnforcement', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.complianceEnforcement.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['complianceEnforcement', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['complianceEnforcement', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.complianceEnforcement.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complianceEnforcement', 'list'] }),
      }),
    },
    complianceGovernance: {
      useList: (params?: any) => useQuery({
        queryKey: ['complianceGovernance', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.complianceGovernance.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['complianceGovernance', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.complianceGovernance.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.complianceGovernance.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complianceGovernance', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.complianceGovernance.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['complianceGovernance', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['complianceGovernance', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.complianceGovernance.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complianceGovernance', 'list'] }),
      }),
    },
    configuration: {
      useList: (params?: any) => useQuery({
        queryKey: ['configuration', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.configuration.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['configuration', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.configuration.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.configuration.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['configuration', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.configuration.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['configuration', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['configuration', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.configuration.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['configuration', 'list'] }),
      }),
    },
    consent: {
      useList: (params?: any) => useQuery({
        queryKey: ['consent', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.consent.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['consent', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.consent.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.consent.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['consent', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.consent.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['consent', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['consent', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.consent.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['consent', 'list'] }),
      }),
    },
    coturnRelay: {
      useList: (params?: any) => useQuery({
        queryKey: ['coturnRelay', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.coturnRelay.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['coturnRelay', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.coturnRelay.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.coturnRelay.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coturnRelay', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.coturnRelay.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['coturnRelay', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['coturnRelay', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.coturnRelay.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coturnRelay', 'list'] }),
      }),
    },
    credentialing: {
      useList: (params?: any) => useQuery({
        queryKey: ['credentialing', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.credentialing.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['credentialing', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.credentialing.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.credentialing.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['credentialing', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.credentialing.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['credentialing', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['credentialing', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.credentialing.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['credentialing', 'list'] }),
      }),
    },
    dataFabricIntegrationHub: {
      useList: (params?: any) => useQuery({
        queryKey: ['dataFabricIntegrationHub', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.dataFabricIntegrationHub.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['dataFabricIntegrationHub', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.dataFabricIntegrationHub.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.dataFabricIntegrationHub.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dataFabricIntegrationHub', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.dataFabricIntegrationHub.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['dataFabricIntegrationHub', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['dataFabricIntegrationHub', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.dataFabricIntegrationHub.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dataFabricIntegrationHub', 'list'] }),
      }),
    },
    dataGovernance: {
      useList: (params?: any) => useQuery({
        queryKey: ['dataGovernance', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.dataGovernance.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['dataGovernance', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.dataGovernance.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.dataGovernance.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dataGovernance', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.dataGovernance.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['dataGovernance', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['dataGovernance', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.dataGovernance.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dataGovernance', 'list'] }),
      }),
    },
    device: {
      useList: (params?: any) => useQuery({
        queryKey: ['device', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.device.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['device', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.device.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.device.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['device', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.device.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['device', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['device', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.device.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['device', 'list'] }),
      }),
    },
    devices: {
      useList: (params?: any) => useQuery({
        queryKey: ['devices', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.devices.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['devices', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.devices.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.devices.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.devices.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['devices', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['devices', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.devices.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices', 'list'] }),
      }),
    },
    diagnostics: {
      useList: (params?: any) => useQuery({
        queryKey: ['diagnostics', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.diagnostics.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['diagnostics', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.diagnostics.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.diagnostics.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['diagnostics', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.diagnostics.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['diagnostics', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['diagnostics', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.diagnostics.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['diagnostics', 'list'] }),
      }),
    },
    dietNutrition: {
      useList: (params?: any) => useQuery({
        queryKey: ['dietNutrition', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.dietNutrition.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['dietNutrition', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.dietNutrition.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.dietNutrition.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dietNutrition', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.dietNutrition.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['dietNutrition', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['dietNutrition', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.dietNutrition.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dietNutrition', 'list'] }),
      }),
    },
    digitalTwinEngine: {
      useList: (params?: any) => useQuery({
        queryKey: ['digitalTwinEngine', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.digitalTwinEngine.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['digitalTwinEngine', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.digitalTwinEngine.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.digitalTwinEngine.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['digitalTwinEngine', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.digitalTwinEngine.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['digitalTwinEngine', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['digitalTwinEngine', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.digitalTwinEngine.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['digitalTwinEngine', 'list'] }),
      }),
    },
    edgeConnectivityManager: {
      useList: (params?: any) => useQuery({
        queryKey: ['edgeConnectivityManager', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.edgeConnectivityManager.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['edgeConnectivityManager', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.edgeConnectivityManager.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.edgeConnectivityManager.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['edgeConnectivityManager', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.edgeConnectivityManager.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['edgeConnectivityManager', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['edgeConnectivityManager', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.edgeConnectivityManager.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['edgeConnectivityManager', 'list'] }),
      }),
    },
    enterpriseRiskOversight: {
      useList: (params?: any) => useQuery({
        queryKey: ['enterpriseRiskOversight', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.enterpriseRiskOversight.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['enterpriseRiskOversight', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.enterpriseRiskOversight.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.enterpriseRiskOversight.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enterpriseRiskOversight', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.enterpriseRiskOversight.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['enterpriseRiskOversight', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['enterpriseRiskOversight', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.enterpriseRiskOversight.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enterpriseRiskOversight', 'list'] }),
      }),
    },
    er: {
      useList: (params?: any) => useQuery({
        queryKey: ['er', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.er.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['er', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.er.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.er.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['er', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.er.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['er', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['er', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.er.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['er', 'list'] }),
      }),
    },
    ethics: {
      useList: (params?: any) => useQuery({
        queryKey: ['ethics', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.ethics.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['ethics', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.ethics.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.ethics.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ethics', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.ethics.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['ethics', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['ethics', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.ethics.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ethics', 'list'] }),
      }),
    },
    evidenceManagement: {
      useList: (params?: any) => useQuery({
        queryKey: ['evidenceManagement', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.evidenceManagement.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['evidenceManagement', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.evidenceManagement.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.evidenceManagement.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['evidenceManagement', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.evidenceManagement.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['evidenceManagement', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['evidenceManagement', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.evidenceManagement.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['evidenceManagement', 'list'] }),
      }),
    },
    executiveDashboard: {
      useList: (params?: any) => useQuery({
        queryKey: ['executiveDashboard', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.executiveDashboard.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['executiveDashboard', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.executiveDashboard.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.executiveDashboard.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['executiveDashboard', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.executiveDashboard.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['executiveDashboard', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['executiveDashboard', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.executiveDashboard.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['executiveDashboard', 'list'] }),
      }),
    },
    facilities: {
      useList: (params?: any) => useQuery({
        queryKey: ['facilities', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.facilities.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['facilities', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.facilities.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.facilities.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['facilities', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.facilities.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['facilities', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['facilities', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.facilities.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['facilities', 'list'] }),
      }),
    },
    fireSafetySystems: {
      useList: (params?: any) => useQuery({
        queryKey: ['fireSafetySystems', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.fireSafetySystems.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['fireSafetySystems', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.fireSafetySystems.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.fireSafetySystems.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fireSafetySystems', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.fireSafetySystems.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['fireSafetySystems', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['fireSafetySystems', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.fireSafetySystems.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fireSafetySystems', 'list'] }),
      }),
    },
    fleetManagement: {
      useList: (params?: any) => useQuery({
        queryKey: ['fleetManagement', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.fleetManagement.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['fleetManagement', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.fleetManagement.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.fleetManagement.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fleetManagement', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.fleetManagement.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['fleetManagement', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['fleetManagement', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.fleetManagement.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fleetManagement', 'list'] }),
      }),
    },
    forensic: {
      useList: (params?: any) => useQuery({
        queryKey: ['forensic', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.forensic.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['forensic', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.forensic.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.forensic.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forensic', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.forensic.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['forensic', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['forensic', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.forensic.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forensic', 'list'] }),
      }),
    },
    gateway: {
      useList: (params?: any) => useQuery({
        queryKey: ['gateway', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.gateway.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['gateway', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.gateway.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.gateway.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gateway', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.gateway.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['gateway', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['gateway', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.gateway.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gateway', 'list'] }),
      }),
    },
    giteaSourceControl: {
      useList: (params?: any) => useQuery({
        queryKey: ['giteaSourceControl', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.giteaSourceControl.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['giteaSourceControl', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.giteaSourceControl.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.giteaSourceControl.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['giteaSourceControl', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.giteaSourceControl.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['giteaSourceControl', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['giteaSourceControl', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.giteaSourceControl.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['giteaSourceControl', 'list'] }),
      }),
    },
    grafanaVisualization: {
      useList: (params?: any) => useQuery({
        queryKey: ['grafanaVisualization', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.grafanaVisualization.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['grafanaVisualization', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.grafanaVisualization.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.grafanaVisualization.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grafanaVisualization', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.grafanaVisualization.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['grafanaVisualization', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['grafanaVisualization', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.grafanaVisualization.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grafanaVisualization', 'list'] }),
      }),
    },
    housekeeping: {
      useList: (params?: any) => useQuery({
        queryKey: ['housekeeping', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.housekeeping.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['housekeeping', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.housekeeping.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.housekeeping.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['housekeeping', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.housekeeping.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['housekeeping', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['housekeeping', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.housekeeping.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['housekeeping', 'list'] }),
      }),
    },
    hr: {
      useList: (params?: any) => useQuery({
        queryKey: ['hr', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.hr.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['hr', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.hr.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.hr.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.hr.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['hr', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['hr', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.hr.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr', 'list'] }),
      }),
    },
    iam: {
      useList: (params?: any) => useQuery({
        queryKey: ['iam', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.iam.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['iam', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.iam.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.iam.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['iam', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.iam.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['iam', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['iam', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.iam.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['iam', 'list'] }),
      }),
    },
    icu: {
      useList: (params?: any) => useQuery({
        queryKey: ['icu', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.icu.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['icu', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.icu.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.icu.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['icu', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.icu.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['icu', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['icu', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.icu.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['icu', 'list'] }),
      }),
    },
    incidentManagement: {
      useList: (params?: any) => useQuery({
        queryKey: ['incidentManagement', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.incidentManagement.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['incidentManagement', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.incidentManagement.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.incidentManagement.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incidentManagement', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.incidentManagement.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['incidentManagement', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['incidentManagement', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.incidentManagement.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incidentManagement', 'list'] }),
      }),
    },
    infection: {
      useList: (params?: any) => useQuery({
        queryKey: ['infection', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.infection.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['infection', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.infection.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.infection.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['infection', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.infection.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['infection', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['infection', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.infection.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['infection', 'list'] }),
      }),
    },
    infectionControl: {
      useList: (params?: any) => useQuery({
        queryKey: ['infectionControl', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.infectionControl.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['infectionControl', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.infectionControl.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.infectionControl.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['infectionControl', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.infectionControl.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['infectionControl', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['infectionControl', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.infectionControl.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['infectionControl', 'list'] }),
      }),
    },
    insuranceIntegration: {
      useList: (params?: any) => useQuery({
        queryKey: ['insuranceIntegration', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.insuranceIntegration.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['insuranceIntegration', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.insuranceIntegration.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.insuranceIntegration.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insuranceIntegration', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.insuranceIntegration.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['insuranceIntegration', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['insuranceIntegration', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.insuranceIntegration.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insuranceIntegration', 'list'] }),
      }),
    },
    inventory: {
      useList: (params?: any) => useQuery({
        queryKey: ['inventory', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.inventory.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['inventory', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.inventory.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.inventory.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.inventory.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['inventory', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['inventory', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.inventory.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory', 'list'] }),
      }),
    },
    iotMessaging: {
      useList: (params?: any) => useQuery({
        queryKey: ['iotMessaging', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.iotMessaging.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['iotMessaging', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.iotMessaging.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.iotMessaging.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['iotMessaging', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.iotMessaging.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['iotMessaging', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['iotMessaging', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.iotMessaging.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['iotMessaging', 'list'] }),
      }),
    },
    jaegerTracing: {
      useList: (params?: any) => useQuery({
        queryKey: ['jaegerTracing', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.jaegerTracing.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['jaegerTracing', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.jaegerTracing.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.jaegerTracing.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jaegerTracing', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.jaegerTracing.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['jaegerTracing', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['jaegerTracing', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.jaegerTracing.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jaegerTracing', 'list'] }),
      }),
    },
    jitsiConferencing: {
      useList: (params?: any) => useQuery({
        queryKey: ['jitsiConferencing', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.jitsiConferencing.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['jitsiConferencing', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.jitsiConferencing.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.jitsiConferencing.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jitsiConferencing', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.jitsiConferencing.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['jitsiConferencing', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['jitsiConferencing', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.jitsiConferencing.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jitsiConferencing', 'list'] }),
      }),
    },
    keycloak: {
      useList: (params?: any) => useQuery({
        queryKey: ['keycloak', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.keycloak.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['keycloak', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.keycloak.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.keycloak.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['keycloak', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.keycloak.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['keycloak', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['keycloak', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.keycloak.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['keycloak', 'list'] }),
      }),
    },
    knowledgeGraphEngine: {
      useList: (params?: any) => useQuery({
        queryKey: ['knowledgeGraphEngine', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.knowledgeGraphEngine.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['knowledgeGraphEngine', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.knowledgeGraphEngine.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.knowledgeGraphEngine.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledgeGraphEngine', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.knowledgeGraphEngine.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['knowledgeGraphEngine', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['knowledgeGraphEngine', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.knowledgeGraphEngine.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledgeGraphEngine', 'list'] }),
      }),
    },
    kongGateway: {
      useList: (params?: any) => useQuery({
        queryKey: ['kongGateway', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.kongGateway.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['kongGateway', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.kongGateway.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.kongGateway.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kongGateway', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.kongGateway.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['kongGateway', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['kongGateway', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.kongGateway.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kongGateway', 'list'] }),
      }),
    },
    legal: {
      useList: (params?: any) => useQuery({
        queryKey: ['legal', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.legal.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['legal', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.legal.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.legal.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['legal', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.legal.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['legal', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['legal', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.legal.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['legal', 'list'] }),
      }),
    },
    legalCaseManagement: {
      useList: (params?: any) => useQuery({
        queryKey: ['legalCaseManagement', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.legalCaseManagement.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['legalCaseManagement', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.legalCaseManagement.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.legalCaseManagement.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['legalCaseManagement', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.legalCaseManagement.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['legalCaseManagement', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['legalCaseManagement', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.legalCaseManagement.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['legalCaseManagement', 'list'] }),
      }),
    },
    legalRiskAnalytics: {
      useList: (params?: any) => useQuery({
        queryKey: ['legalRiskAnalytics', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.legalRiskAnalytics.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['legalRiskAnalytics', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.legalRiskAnalytics.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.legalRiskAnalytics.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['legalRiskAnalytics', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.legalRiskAnalytics.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['legalRiskAnalytics', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['legalRiskAnalytics', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.legalRiskAnalytics.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['legalRiskAnalytics', 'list'] }),
      }),
    },
    litigationTracking: {
      useList: (params?: any) => useQuery({
        queryKey: ['litigationTracking', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.litigationTracking.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['litigationTracking', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.litigationTracking.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.litigationTracking.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['litigationTracking', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.litigationTracking.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['litigationTracking', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['litigationTracking', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.litigationTracking.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['litigationTracking', 'list'] }),
      }),
    },
    lokiLogging: {
      useList: (params?: any) => useQuery({
        queryKey: ['lokiLogging', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.lokiLogging.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['lokiLogging', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.lokiLogging.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.lokiLogging.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lokiLogging', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.lokiLogging.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['lokiLogging', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['lokiLogging', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.lokiLogging.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lokiLogging', 'list'] }),
      }),
    },
    management: {
      useList: (params?: any) => useQuery({
        queryKey: ['management', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.management.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['management', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.management.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.management.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['management', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.management.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['management', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['management', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.management.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['management', 'list'] }),
      }),
    },
    marketing: {
      useList: (params?: any) => useQuery({
        queryKey: ['marketing', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.marketing.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['marketing', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.marketing.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.marketing.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.marketing.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['marketing', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['marketing', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.marketing.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing', 'list'] }),
      }),
    },
    medicalEducation: {
      useList: (params?: any) => useQuery({
        queryKey: ['medicalEducation', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.medicalEducation.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['medicalEducation', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.medicalEducation.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.medicalEducation.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medicalEducation', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.medicalEducation.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['medicalEducation', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['medicalEducation', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.medicalEducation.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medicalEducation', 'list'] }),
      }),
    },
    medicalRecords: {
      useList: (params?: any) => useQuery({
        queryKey: ['medicalRecords', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.medicalRecords.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['medicalRecords', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.medicalRecords.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.medicalRecords.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medicalRecords', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.medicalRecords.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['medicalRecords', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['medicalRecords', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.medicalRecords.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medicalRecords', 'list'] }),
      }),
    },
    mlflow: {
      useList: (params?: any) => useQuery({
        queryKey: ['mlflow', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.mlflow.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['mlflow', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.mlflow.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.mlflow.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mlflow', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.mlflow.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['mlflow', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['mlflow', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.mlflow.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mlflow', 'list'] }),
      }),
    },
    mortuaryManagement: {
      useList: (params?: any) => useQuery({
        queryKey: ['mortuaryManagement', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.mortuaryManagement.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['mortuaryManagement', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.mortuaryManagement.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.mortuaryManagement.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mortuaryManagement', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.mortuaryManagement.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['mortuaryManagement', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['mortuaryManagement', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.mortuaryManagement.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mortuaryManagement', 'list'] }),
      }),
    },
    mpi: {
      useList: (params?: any) => useQuery({
        queryKey: ['mpi', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.mpi.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['mpi', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.mpi.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.mpi.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mpi', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.mpi.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['mpi', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['mpi', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.mpi.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mpi', 'list'] }),
      }),
    },
    multiTenantIsolationManager: {
      useList: (params?: any) => useQuery({
        queryKey: ['multiTenantIsolationManager', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.multiTenantIsolationManager.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['multiTenantIsolationManager', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.multiTenantIsolationManager.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.multiTenantIsolationManager.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['multiTenantIsolationManager', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.multiTenantIsolationManager.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['multiTenantIsolationManager', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['multiTenantIsolationManager', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.multiTenantIsolationManager.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['multiTenantIsolationManager', 'list'] }),
      }),
    },
    networkManagement: {
      useList: (params?: any) => useQuery({
        queryKey: ['networkManagement', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.networkManagement.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['networkManagement', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.networkManagement.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.networkManagement.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['networkManagement', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.networkManagement.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['networkManagement', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['networkManagement', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.networkManagement.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['networkManagement', 'list'] }),
      }),
    },
    networkObservability: {
      useList: (params?: any) => useQuery({
        queryKey: ['networkObservability', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.networkObservability.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['networkObservability', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.networkObservability.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.networkObservability.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['networkObservability', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.networkObservability.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['networkObservability', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['networkObservability', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.networkObservability.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['networkObservability', 'list'] }),
      }),
    },
    networkProvisioning: {
      useList: (params?: any) => useQuery({
        queryKey: ['networkProvisioning', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.networkProvisioning.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['networkProvisioning', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.networkProvisioning.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.networkProvisioning.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['networkProvisioning', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.networkProvisioning.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['networkProvisioning', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['networkProvisioning', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.networkProvisioning.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['networkProvisioning', 'list'] }),
      }),
    },
    notification: {
      useList: (params?: any) => useQuery({
        queryKey: ['notification', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.notification.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['notification', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.notification.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.notification.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.notification.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['notification', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['notification', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.notification.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification', 'list'] }),
      }),
    },
    nursing: {
      useList: (params?: any) => useQuery({
        queryKey: ['nursing', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.nursing.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['nursing', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.nursing.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.nursing.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['nursing', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.nursing.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['nursing', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['nursing', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.nursing.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['nursing', 'list'] }),
      }),
    },
    opa: {
      useList: (params?: any) => useQuery({
        queryKey: ['opa', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.opa.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['opa', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.opa.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.opa.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['opa', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.opa.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['opa', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['opa', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.opa.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['opa', 'list'] }),
      }),
    },
    opensearchSearch: {
      useList: (params?: any) => useQuery({
        queryKey: ['opensearchSearch', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.opensearchSearch.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['opensearchSearch', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.opensearchSearch.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.opensearchSearch.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['opensearchSearch', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.opensearchSearch.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['opensearchSearch', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['opensearchSearch', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.opensearchSearch.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['opensearchSearch', 'list'] }),
      }),
    },
    operationalCommandCenter: {
      useList: (params?: any) => useQuery({
        queryKey: ['operationalCommandCenter', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.operationalCommandCenter.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['operationalCommandCenter', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.operationalCommandCenter.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.operationalCommandCenter.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operationalCommandCenter', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.operationalCommandCenter.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['operationalCommandCenter', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['operationalCommandCenter', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.operationalCommandCenter.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operationalCommandCenter', 'list'] }),
      }),
    },
    order: {
      useList: (params?: any) => useQuery({
        queryKey: ['order', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.order.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['order', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.order.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.order.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.order.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['order', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['order', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.order.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order', 'list'] }),
      }),
    },
    orders: {
      useList: (params?: any) => useQuery({
        queryKey: ['orders', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.orders.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['orders', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.orders.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.orders.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.orders.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['orders', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.orders.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders', 'list'] }),
      }),
    },
    ot: {
      useList: (params?: any) => useQuery({
        queryKey: ['ot', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.ot.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['ot', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.ot.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.ot.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ot', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.ot.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['ot', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['ot', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.ot.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ot', 'list'] }),
      }),
    },
    pam: {
      useList: (params?: any) => useQuery({
        queryKey: ['pam', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.pam.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['pam', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.pam.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.pam.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pam', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.pam.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['pam', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['pam', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.pam.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pam', 'list'] }),
      }),
    },
    patient: {
      useList: (params?: any) => useQuery({
        queryKey: ['patient', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.patient.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['patient', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.patient.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.patient.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patient', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.patient.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['patient', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['patient', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.patient.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patient', 'list'] }),
      }),
    },
    patientExperience: {
      useList: (params?: any) => useQuery({
        queryKey: ['patientExperience', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.patientExperience.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['patientExperience', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.patientExperience.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.patientExperience.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patientExperience', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.patientExperience.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['patientExperience', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['patientExperience', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.patientExperience.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patientExperience', 'list'] }),
      }),
    },
    performanceIntelligence: {
      useList: (params?: any) => useQuery({
        queryKey: ['performanceIntelligence', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.performanceIntelligence.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['performanceIntelligence', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.performanceIntelligence.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.performanceIntelligence.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['performanceIntelligence', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.performanceIntelligence.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['performanceIntelligence', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['performanceIntelligence', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.performanceIntelligence.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['performanceIntelligence', 'list'] }),
      }),
    },
    performanceManagement: {
      useList: (params?: any) => useQuery({
        queryKey: ['performanceManagement', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.performanceManagement.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['performanceManagement', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.performanceManagement.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.performanceManagement.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['performanceManagement', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.performanceManagement.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['performanceManagement', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['performanceManagement', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.performanceManagement.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['performanceManagement', 'list'] }),
      }),
    },
    perimeterSecurity: {
      useList: (params?: any) => useQuery({
        queryKey: ['perimeterSecurity', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.perimeterSecurity.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['perimeterSecurity', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.perimeterSecurity.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.perimeterSecurity.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['perimeterSecurity', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.perimeterSecurity.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['perimeterSecurity', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['perimeterSecurity', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.perimeterSecurity.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['perimeterSecurity', 'list'] }),
      }),
    },
    pharmacy: {
      useList: (params?: any) => useQuery({
        queryKey: ['pharmacy', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.pharmacy.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['pharmacy', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.pharmacy.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.pharmacy.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pharmacy', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.pharmacy.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['pharmacy', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['pharmacy', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.pharmacy.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pharmacy', 'list'] }),
      }),
    },
    physicalAccessControl: {
      useList: (params?: any) => useQuery({
        queryKey: ['physicalAccessControl', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.physicalAccessControl.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['physicalAccessControl', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.physicalAccessControl.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.physicalAccessControl.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['physicalAccessControl', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.physicalAccessControl.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['physicalAccessControl', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['physicalAccessControl', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.physicalAccessControl.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['physicalAccessControl', 'list'] }),
      }),
    },
    populationHealth: {
      useList: (params?: any) => useQuery({
        queryKey: ['populationHealth', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.populationHealth.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['populationHealth', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.populationHealth.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.populationHealth.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['populationHealth', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.populationHealth.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['populationHealth', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['populationHealth', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.populationHealth.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['populationHealth', 'list'] }),
      }),
    },
    postalMail: {
      useList: (params?: any) => useQuery({
        queryKey: ['postalMail', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.postalMail.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['postalMail', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.postalMail.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.postalMail.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['postalMail', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.postalMail.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['postalMail', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['postalMail', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.postalMail.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['postalMail', 'list'] }),
      }),
    },
    prometheusMonitoring: {
      useList: (params?: any) => useQuery({
        queryKey: ['prometheusMonitoring', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.prometheusMonitoring.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['prometheusMonitoring', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.prometheusMonitoring.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.prometheusMonitoring.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prometheusMonitoring', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.prometheusMonitoring.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['prometheusMonitoring', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['prometheusMonitoring', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.prometheusMonitoring.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prometheusMonitoring', 'list'] }),
      }),
    },
    qualityManagement: {
      useList: (params?: any) => useQuery({
        queryKey: ['qualityManagement', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.qualityManagement.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['qualityManagement', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.qualityManagement.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.qualityManagement.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['qualityManagement', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.qualityManagement.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['qualityManagement', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['qualityManagement', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.qualityManagement.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['qualityManagement', 'list'] }),
      }),
    },
    rcm: {
      useList: (params?: any) => useQuery({
        queryKey: ['rcm', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.rcm.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['rcm', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.rcm.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.rcm.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rcm', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.rcm.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['rcm', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['rcm', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.rcm.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rcm', 'list'] }),
      }),
    },
    redisCache: {
      useList: (params?: any) => useQuery({
        queryKey: ['redisCache', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.redisCache.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['redisCache', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.redisCache.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.redisCache.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['redisCache', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.redisCache.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['redisCache', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['redisCache', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.redisCache.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['redisCache', 'list'] }),
      }),
    },
    redpandaConsole: {
      useList: (params?: any) => useQuery({
        queryKey: ['redpandaConsole', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.redpandaConsole.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['redpandaConsole', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.redpandaConsole.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.redpandaConsole.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['redpandaConsole', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.redpandaConsole.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['redpandaConsole', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['redpandaConsole', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.redpandaConsole.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['redpandaConsole', 'list'] }),
      }),
    },
    redpandaStreaming: {
      useList: (params?: any) => useQuery({
        queryKey: ['redpandaStreaming', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.redpandaStreaming.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['redpandaStreaming', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.redpandaStreaming.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.redpandaStreaming.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['redpandaStreaming', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.redpandaStreaming.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['redpandaStreaming', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['redpandaStreaming', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.redpandaStreaming.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['redpandaStreaming', 'list'] }),
      }),
    },
    regulatorIntegration: {
      useList: (params?: any) => useQuery({
        queryKey: ['regulatorIntegration', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.regulatorIntegration.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['regulatorIntegration', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.regulatorIntegration.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.regulatorIntegration.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regulatorIntegration', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.regulatorIntegration.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['regulatorIntegration', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['regulatorIntegration', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.regulatorIntegration.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regulatorIntegration', 'list'] }),
      }),
    },
    resourceOptimizationEngine: {
      useList: (params?: any) => useQuery({
        queryKey: ['resourceOptimizationEngine', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.resourceOptimizationEngine.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['resourceOptimizationEngine', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.resourceOptimizationEngine.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.resourceOptimizationEngine.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resourceOptimizationEngine', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.resourceOptimizationEngine.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['resourceOptimizationEngine', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['resourceOptimizationEngine', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.resourceOptimizationEngine.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resourceOptimizationEngine', 'list'] }),
      }),
    },
    riskManagement: {
      useList: (params?: any) => useQuery({
        queryKey: ['riskManagement', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.riskManagement.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['riskManagement', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.riskManagement.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.riskManagement.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['riskManagement', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.riskManagement.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['riskManagement', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['riskManagement', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.riskManagement.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['riskManagement', 'list'] }),
      }),
    },
    role: {
      useList: (params?: any) => useQuery({
        queryKey: ['role', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.role.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['role', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.role.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.role.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['role', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.role.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['role', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['role', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.role.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['role', 'list'] }),
      }),
    },
    rostering: {
      useList: (params?: any) => useQuery({
        queryKey: ['rostering', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.rostering.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['rostering', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.rostering.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.rostering.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rostering', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.rostering.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['rostering', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['rostering', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.rostering.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rostering', 'list'] }),
      }),
    },
    scm: {
      useList: (params?: any) => useQuery({
        queryKey: ['scm', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.scm.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['scm', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.scm.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.scm.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scm', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.scm.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['scm', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['scm', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.scm.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scm', 'list'] }),
      }),
    },
    securityIncidentResponse: {
      useList: (params?: any) => useQuery({
        queryKey: ['securityIncidentResponse', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.securityIncidentResponse.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['securityIncidentResponse', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.securityIncidentResponse.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.securityIncidentResponse.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['securityIncidentResponse', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.securityIncidentResponse.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['securityIncidentResponse', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['securityIncidentResponse', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.securityIncidentResponse.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['securityIncidentResponse', 'list'] }),
      }),
    },
    simulationWhatifEngine: {
      useList: (params?: any) => useQuery({
        queryKey: ['simulationWhatifEngine', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.simulationWhatifEngine.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['simulationWhatifEngine', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.simulationWhatifEngine.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.simulationWhatifEngine.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['simulationWhatifEngine', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.simulationWhatifEngine.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['simulationWhatifEngine', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['simulationWhatifEngine', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.simulationWhatifEngine.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['simulationWhatifEngine', 'list'] }),
      }),
    },
    slaHealthManager: {
      useList: (params?: any) => useQuery({
        queryKey: ['slaHealthManager', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.slaHealthManager.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['slaHealthManager', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.slaHealthManager.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.slaHealthManager.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['slaHealthManager', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.slaHealthManager.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['slaHealthManager', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['slaHealthManager', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.slaHealthManager.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['slaHealthManager', 'list'] }),
      }),
    },
    sonarqubeQuality: {
      useList: (params?: any) => useQuery({
        queryKey: ['sonarqubeQuality', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.sonarqubeQuality.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['sonarqubeQuality', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.sonarqubeQuality.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.sonarqubeQuality.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sonarqubeQuality', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.sonarqubeQuality.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['sonarqubeQuality', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['sonarqubeQuality', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.sonarqubeQuality.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sonarqubeQuality', 'list'] }),
      }),
    },
    stepCa: {
      useList: (params?: any) => useQuery({
        queryKey: ['stepCa', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.stepCa.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['stepCa', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.stepCa.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.stepCa.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stepCa', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.stepCa.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['stepCa', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['stepCa', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.stepCa.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stepCa', 'list'] }),
      }),
    },
    strategicPlanning: {
      useList: (params?: any) => useQuery({
        queryKey: ['strategicPlanning', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.strategicPlanning.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['strategicPlanning', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.strategicPlanning.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.strategicPlanning.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategicPlanning', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.strategicPlanning.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['strategicPlanning', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['strategicPlanning', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.strategicPlanning.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategicPlanning', 'list'] }),
      }),
    },
    telemedicine: {
      useList: (params?: any) => useQuery({
        queryKey: ['telemedicine', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.telemedicine.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['telemedicine', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.telemedicine.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.telemedicine.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['telemedicine', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.telemedicine.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['telemedicine', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['telemedicine', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.telemedicine.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['telemedicine', 'list'] }),
      }),
    },
    tfServing: {
      useList: (params?: any) => useQuery({
        queryKey: ['tfServing', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.tfServing.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['tfServing', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.tfServing.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.tfServing.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tfServing', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.tfServing.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['tfServing', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['tfServing', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.tfServing.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tfServing', 'list'] }),
      }),
    },
    threatDetection: {
      useList: (params?: any) => useQuery({
        queryKey: ['threatDetection', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.threatDetection.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['threatDetection', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.threatDetection.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.threatDetection.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['threatDetection', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.threatDetection.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['threatDetection', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['threatDetection', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.threatDetection.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['threatDetection', 'list'] }),
      }),
    },
    transplant: {
      useList: (params?: any) => useQuery({
        queryKey: ['transplant', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.transplant.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['transplant', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.transplant.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.transplant.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transplant', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.transplant.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['transplant', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['transplant', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.transplant.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transplant', 'list'] }),
      }),
    },
    transplantCoordination: {
      useList: (params?: any) => useQuery({
        queryKey: ['transplantCoordination', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.transplantCoordination.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['transplantCoordination', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.transplantCoordination.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.transplantCoordination.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transplantCoordination', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.transplantCoordination.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['transplantCoordination', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['transplantCoordination', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.transplantCoordination.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transplantCoordination', 'list'] }),
      }),
    },
    treatmentPlan: {
      useList: (params?: any) => useQuery({
        queryKey: ['treatmentPlan', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.treatmentPlan.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['treatmentPlan', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.treatmentPlan.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.treatmentPlan.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['treatmentPlan', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.treatmentPlan.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['treatmentPlan', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['treatmentPlan', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.treatmentPlan.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['treatmentPlan', 'list'] }),
      }),
    },
    user: {
      useList: (params?: any) => useQuery({
        queryKey: ['user', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.user.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['user', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.user.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.user.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.user.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['user', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['user', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.user.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user', 'list'] }),
      }),
    },
    vault: {
      useList: (params?: any) => useQuery({
        queryKey: ['vault', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.vault.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['vault', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.vault.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.vault.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vault', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.vault.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['vault', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['vault', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.vault.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vault', 'list'] }),
      }),
    },
    vendorManagement: {
      useList: (params?: any) => useQuery({
        queryKey: ['vendorManagement', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.vendorManagement.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['vendorManagement', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.vendorManagement.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.vendorManagement.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendorManagement', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.vendorManagement.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['vendorManagement', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['vendorManagement', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.vendorManagement.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendorManagement', 'list'] }),
      }),
    },
    visitorManagement: {
      useList: (params?: any) => useQuery({
        queryKey: ['visitorManagement', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.visitorManagement.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['visitorManagement', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.visitorManagement.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.visitorManagement.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visitorManagement', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.visitorManagement.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['visitorManagement', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['visitorManagement', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.visitorManagement.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visitorManagement', 'list'] }),
      }),
    },
    wazuh: {
      useList: (params?: any) => useQuery({
        queryKey: ['wazuh', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.wazuh.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['wazuh', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.wazuh.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.wazuh.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wazuh', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.wazuh.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['wazuh', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['wazuh', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.wazuh.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wazuh', 'list'] }),
      }),
    },
    zeroTrustNetworkControl: {
      useList: (params?: any) => useQuery({
        queryKey: ['zeroTrustNetworkControl', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.zeroTrustNetworkControl.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['zeroTrustNetworkControl', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.zeroTrustNetworkControl.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.zeroTrustNetworkControl.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zeroTrustNetworkControl', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.zeroTrustNetworkControl.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['zeroTrustNetworkControl', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['zeroTrustNetworkControl', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.zeroTrustNetworkControl.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zeroTrustNetworkControl', 'list'] }),
      }),
    },
    zta: {
      useList: (params?: any) => useQuery({
        queryKey: ['zta', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.zta.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['zta', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.zta.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.zta.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zta', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.zta.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['zta', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['zta', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.zta.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zta', 'list'] }),
      }),
    },
    ztaEngine: {
      useList: (params?: any) => useQuery({
        queryKey: ['ztaEngine', 'list', params],
        queryFn: () => apiGet<any>(autoEndpoints.ztaEngine.list, { params }),
      }),
      useGetById: (id: string) => useQuery({
        queryKey: ['ztaEngine', 'detail', id],
        queryFn: () => apiGet<any>(autoEndpoints.ztaEngine.getById(id)),
        enabled: !!id,
      }),
      useCreate: () => useMutation({
        mutationFn: (data: any) => apiPost<any>(autoEndpoints.ztaEngine.create, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ztaEngine', 'list'] }),
      }),
      useUpdate: () => useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiPut<any>(autoEndpoints.ztaEngine.update(id), data),
        onSuccess: (_, { id }) => {
          queryClient.invalidateQueries({ queryKey: ['ztaEngine', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['ztaEngine', 'detail', id] });
        },
      }),
      useDelete: () => useMutation({
        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.ztaEngine.delete(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ztaEngine', 'list'] }),
      }),
    },
  };
}
