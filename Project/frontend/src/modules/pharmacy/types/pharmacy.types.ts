/**
 * MedTrustX — Staff Pharmacist (Dispensing) Types
 */

export interface PharmacyKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'currency' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface PrescriptionQueueItem {
  id: string;
  prescriptionId: string;
  patientName: string;
  mrn: string;
  type: 'IPD' | 'OPD' | 'Discharge';
  status: 'Pending' | 'Verifying' | 'Ready to Dispense' | 'Completed';
  priority: 'Routine' | 'STAT' | 'Urgent';
  timeReceived: string;
}

export interface PrescriptionDetail {
  id: string;
  patientId: string;
  prescribedBy: string;
  drugs: {
    id: string;
    drugName: string;
    dosage: string;
    route: string;
    frequency: string;
    quantity: number;
    stockAvailable: number;
    isSubstitutable: boolean;
    requiresBarcodeScan: boolean;
    scanned: boolean;
  }[];
  validationFlags: ('Drug Interaction' | 'Dose Warning' | 'Allergy Risk')[];
  totalCost: number;
}

export interface DispensingInventoryItem {
  id: string;
  drugCode: string;
  drugName: string;
  location: string; // e.g. Aisle 4, Shelf B
  currentStock: number;
  batchNumber: string;
  expiryDate: string;
}

export interface DispensingAlert {
  id: string;
  type: 'Interaction Warning' | 'Out of Stock' | 'Verification Hold';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface PharmacyDashboardData {
  kpis: PharmacyKPI[];
  queue: PrescriptionQueueItem[];
  activePrescription?: PrescriptionDetail;
  inventorySearch: DispensingInventoryItem[];
  alerts: DispensingAlert[];
}
