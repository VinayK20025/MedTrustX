import { apiGet, apiPost } from '@/services/api';
import type { NutritionDashboardData, DietaryOrder, NutritionalAssessment } from '../types/nutrition.types';

const m = (minsAgo: number) => new Date(Date.now() - minsAgo * 60000).toISOString();
const t = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

const mockOrders: DietaryOrder[] = [
  { id: 'ORD-101', patientId: 'PAT-882', patientName: 'Alice Wonderland', roomNumber: '402-A', dietType: 'Diabetic', restrictions: ['No Sugar', 'Low Carb'], status: 'In Preparation', mealTime: 'Lunch', orderedAt: m(45) },
  { id: 'ORD-102', patientId: 'PAT-901', patientName: 'John Doe', roomNumber: '310-B', dietType: 'NPO', restrictions: ['No Liquids'], status: 'Pending', mealTime: 'Lunch', orderedAt: m(15) },
];

const mockAssessments: NutritionalAssessment[] = [
  { id: 'ASM-501', patientId: 'PAT-771', bmi: 18.2, weightKg: 52, riskLevel: 'High', lastAssessmentDate: t(1), recommendedSupplements: ['Protein Shake', 'Vitamin D'] },
  { id: 'ASM-502', patientId: 'PAT-662', bmi: 24.5, weightKg: 75, riskLevel: 'Low', lastAssessmentDate: t(5), recommendedSupplements: [] },
];

const mockData: NutritionDashboardData = {
  metrics: {
    totalActiveOrders: 285,
    npoPatientCount: 12,
    malnutritionRiskPercent: 14.5,
    mealDeliveryOnTimePercent: 96.2,
    highRiskAssessmentsPending: 4
  },
  activeOrders: mockOrders,
  highRiskAssessments: mockAssessments,
  todaysMenu: [
    { id: 'MNU-01', day: 'Wednesday', menuItems: [{ name: 'Grilled Chicken & Quinoa', calories: 450, proteins: 32 }, { name: 'Steamed Vegetables', calories: 80, proteins: 4 }] }
  ]
};

export const nutritionApi = {
  getDashboardData: async (): Promise<{ data: NutritionDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: NutritionDashboardData }>('/api/v1/nutrition/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      return await apiPost(`/api/v1/nutrition/orders/${orderId}/status`, { status });
    } catch {
      return { data: { success: true }, message: 'Order updated (Mock)', status: 200 };
    }
  }
};
