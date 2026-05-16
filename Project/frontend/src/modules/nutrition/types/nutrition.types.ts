/**
 * MedTrustX — Diet & Nutrition Service Types
 */

export type DietType = 'Regular' | 'Clear Liquid' | 'Full Liquid' | 'Diabetic' | 'Renal' | 'Low Sodium' | 'NPO';
export type MealTime = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
export type OrderStatus = 'Pending' | 'In Preparation' | 'Out for Delivery' | 'Delivered' | 'Consumed';

export interface DietaryOrder {
  id: string;
  patientId: string;
  patientName: string;
  roomNumber: string;
  dietType: DietType;
  restrictions: string[];
  status: OrderStatus;
  mealTime: MealTime;
  orderedAt: string;
}

export interface NutritionalAssessment {
  id: string;
  patientId: string;
  bmi: number;
  weightKg: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  lastAssessmentDate: string;
  recommendedSupplements: string[];
}

export interface MealPlan {
  id: string;
  day: string;
  menuItems: { name: string; calories: number; proteins: number }[];
}

export interface NutritionMetrics {
  totalActiveOrders: number;
  npoPatientCount: number;
  malnutritionRiskPercent: number;
  mealDeliveryOnTimePercent: number;
  highRiskAssessmentsPending: number;
}

export interface NutritionDashboardData {
  metrics: NutritionMetrics;
  activeOrders: DietaryOrder[];
  highRiskAssessments: NutritionalAssessment[];
  todaysMenu: MealPlan[];
}
