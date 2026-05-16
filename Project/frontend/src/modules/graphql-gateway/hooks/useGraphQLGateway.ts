'use client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { graphqlGatewayApi } from '../services/graphql-gateway.api';

const KEYS = {
  health: ['graphql-gateway', 'health'] as const,
  metrics: ['graphql-gateway', 'metrics'] as const,
  schema: ['graphql-gateway', 'schema'] as const,
};

export const useGraphQLHealth = () => useQuery({
  queryKey: KEYS.health,
  queryFn: () => graphqlGatewayApi.getHealth(),
  staleTime: 10_000,
  refetchInterval: 10_000,
});

export const useGraphQLMetrics = () => useQuery({
  queryKey: KEYS.metrics,
  queryFn: () => graphqlGatewayApi.getMetrics(),
  staleTime: 10_000,
  refetchInterval: 10_000,
});

export const useGraphQLSchema = () => useQuery({
  queryKey: KEYS.schema,
  queryFn: () => graphqlGatewayApi.getSchema(),
  staleTime: 60_000,
});

export const useGraphQLPlayground = () => useMutation({
  mutationFn: ({ query, variables }: { query: string; variables: Record<string, any> }) =>
    graphqlGatewayApi.executeQuery(query, variables),
});
