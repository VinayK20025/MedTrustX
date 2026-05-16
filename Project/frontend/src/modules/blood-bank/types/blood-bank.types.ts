/**
 * MedTrustX — Blood Bank Officer (Role 142) Types
 * Blood inventory, donor management, crossmatch safety, and transfusion traceability.
 */

export interface BloodBankKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface BloodUnit {
  id: string;
  donorName: string;
  bloodGroup: string;
  component: 'Whole Blood' | 'Packed RBC' | 'Platelets' | 'FFP' | 'Cryoprecipitate';
  collectedAt: string;
  expiresAt: string;
  status: 'Screening' | 'Available' | 'Reserved' | 'Issued' | 'Expired' | 'Discarded';
  screeningResult: 'Pending' | 'Clear' | 'Reactive';
  storageTemp: number;
}

export interface BloodGroupStock {
  group: string;
  units: number;
  threshold: number;
  status: 'Adequate' | 'Low' | 'Critical';
}

export interface CrossmatchRequest {
  id: string;
  patientName: string;
  patientGroup: string;
  unitId: string;
  donorGroup: string;
  result: 'Compatible' | 'Incompatible' | 'Pending';
  requestedBy: string;
  requestedAt: string;
}

export interface BloodBankData {
  kpis: BloodBankKPI[];
  units: BloodUnit[];
  stock: BloodGroupStock[];
  crossmatches: CrossmatchRequest[];
}
