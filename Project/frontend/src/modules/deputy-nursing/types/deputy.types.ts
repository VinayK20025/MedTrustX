/**
 * MedTrustX — Deputy Nursing Superintendent Types
 * Real-time operational execution, coverage gaps, and issue resolution models
 */

export interface DeputyKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface DeputyStaff {
  id: string;
  name: string;
  role: 'Nurse' | 'Senior Nurse' | 'ICU Nurse';
  status: 'free' | 'assigned' | 'busy';
  currentLocation?: string;
}

export interface DeputyGap {
  id: string;
  wardId: string;
  wardName: string;
  shortageCount: number;
  criticality: 'high' | 'medium' | 'low';
  suggestedStaffIds: string[];
}

export interface DeputyShiftUpdate {
  id: string;
  nurseName: string;
  action: 'reassigned' | 'called_in' | 'extended';
  fromWard?: string;
  toWard: string;
  time: string;
}

export interface DeputyAlert {
  id: string;
  type: 'shortage' | 'delay' | 'incident';
  message: string;
  priority: 'high' | 'medium';
  ward: string;
}

export interface DeputyDashboardData {
  kpis: DeputyKPI[];
  availableStaff: DeputyStaff[];
  coverageGaps: DeputyGap[];
  shiftUpdates: DeputyShiftUpdate[];
  alerts: DeputyAlert[];
}
