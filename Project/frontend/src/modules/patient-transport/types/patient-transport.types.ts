/**
 * MedTrustX — Assistant Transport Staff (Role 119) Types
 * On-ground patient mobility execution, real-time location tracking, and task management.
 */

export interface TransportKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface TransportTask {
  id: string;
  patientName: string;
  mrn: string;
  fromLocation: string;
  toLocation: string;
  equipment: 'Wheelchair' | 'Stretcher' | 'Bed' | 'Walking';
  priority: 'Urgent' | 'Routine';
  status: 'Pending' | 'Accepted' | 'In Transit' | 'Completed';
  assignedAt: string;
  specialInstructions?: string;
}

export interface PatientTransportData {
  kpis: TransportKPI[];
  tasks: TransportTask[];
}
