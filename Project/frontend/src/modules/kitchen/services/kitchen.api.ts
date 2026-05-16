import type { KitchenData } from '../types/kitchen.types';

export interface KitFilters { status?: string; dietType?: string; }

const mockData: KitchenData = {
  kpis: [
    { id: '1', label: 'Meals Prepared', value: 124, status: 'success' },
    { id: '2', label: 'Pending Delivery', value: 18, status: 'warning' },
    { id: '3', label: 'Special Diets', value: 45, status: 'normal' },
    { id: '4', label: 'Hygiene Score', value: '100%', status: 'success' },
  ],
  meals: [
    { id: 'ML-101', patientName: 'John Doe', bed: 'Ward A - Bed 12', dietType: 'Diabetic', mealTime: 'Lunch', scheduledTime: new Date(Date.now() + 3600000).toISOString(), status: 'Pending', ingredients: ['Brown Rice', 'Steamed Vegetables', 'Lentil Soup'], instructions: 'No added sugar. Monitor carb portions.' },
    { id: 'ML-102', patientName: 'Sarah Smith', bed: 'ICU - Bed 2', dietType: 'Liquid', mealTime: 'Lunch', scheduledTime: new Date(Date.now() + 1800000).toISOString(), status: 'Cooking', ingredients: ['Clear Broth', 'Apple Juice'], instructions: 'Strict clear liquid only.' },
    { id: 'ML-103', patientName: 'Mike Johnson', bed: 'Ward B - Bed 4', dietType: 'Normal', mealTime: 'Lunch', scheduledTime: new Date(Date.now() + 3600000).toISOString(), status: 'Packed', ingredients: ['Chicken Curry', 'Rice', 'Salad'] },
    { id: 'ML-104', patientName: 'Emily Brown', bed: 'Cardio - Bed 8', dietType: 'Low-Salt', mealTime: 'Lunch', scheduledTime: new Date(Date.now() + 3600000).toISOString(), status: 'Pending', ingredients: ['Baked Fish', 'Quinoa', 'Steamed Broccoli'], instructions: 'Zero sodium seasoning.' }
  ],
  hygiene: [
    { id: 'h1', task: 'Sanitize Prep Station', isCompleted: true },
    { id: 'h2', task: 'Wash Hands (Protocol A)', isCompleted: false },
    { id: 'h3', task: 'Check Refrigerator Temps', isCompleted: false }
  ]
};

export const kitchenApi = {
  getDashboardSummary: async (f: KitFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  updateMealStatus: async (mealId: string, status: string) => ({ data: { success: true }, message: `Meal status updated`, status: 200 }),
  toggleHygiene: async (taskId: string) => ({ data: { success: true }, message: 'Hygiene checklist updated', status: 200 }),
};
