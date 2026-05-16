'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nutritionApi } from '../services/nutrition.api';

const KEYS = {
  all: ['nutrition'] as const,
  dashboard: ['nutrition', 'dashboard'] as const,
};

export function useNutritionDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => nutritionApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => 
      nutritionApi.updateOrderStatus(orderId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
