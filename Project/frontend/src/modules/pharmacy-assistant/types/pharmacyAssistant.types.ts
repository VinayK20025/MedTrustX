/**
 * MedTrustX — Pharmacy Assistant Types
 */

export interface PharmacyAssistantKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface PatientQueueItem {
  id: string;
  patientName: string;
  ticketNumber: string;
  requestType: 'Prescription Pickup' | 'OTC Sales' | 'Query';
  waitTimeMinutes: number;
  status: 'Waiting' | 'Being Served' | 'Completed';
}

export interface AssistanceTask {
  id: string;
  ticketNumber: string;
  patientName: string;
  requestType: string;
  itemsToFetch: {
    id: string;
    drugName: string;
    location: string;
    quantity: number;
    fetched: boolean;
  }[];
  requiresPharmacist: boolean;
}

export interface RetailInventoryItem {
  id: string;
  itemName: string;
  category: 'OTC' | 'Consumables' | 'Nutrition';
  location: string;
  price: number;
  inStock: boolean;
}

export interface AssistantAlert {
  id: string;
  type: 'Long Wait Time' | 'Item Not Found' | 'Pharmacist Needed';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface PharmacyAssistantDashboardData {
  kpis: PharmacyAssistantKPI[];
  queue: PatientQueueItem[];
  activeTask?: AssistanceTask;
  inventorySearch: RetailInventoryItem[];
  alerts: AssistantAlert[];
}
