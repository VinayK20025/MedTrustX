/**
 * MedTrustX — Kitchen Staff / Diet Kitchen Worker (Role 124) Types
 * Patient-specific meal preparation, diet adherence, and kitchen hygiene.
 */

export interface KitchenKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface MealTask {
  id: string;
  patientName: string;
  bed: string;
  dietType: 'Normal' | 'Diabetic' | 'Liquid' | 'Low-Salt';
  mealTime: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  scheduledTime: string;
  status: 'Pending' | 'Cooking' | 'Packed' | 'Delivered';
  ingredients: string[];
  instructions?: string;
}

export interface HygieneChecklist {
  id: string;
  task: string;
  isCompleted: boolean;
}

export interface KitchenData {
  kpis: KitchenKPI[];
  meals: MealTask[];
  hygiene: HygieneChecklist[];
}
