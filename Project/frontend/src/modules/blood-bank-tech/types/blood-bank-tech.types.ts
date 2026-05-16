/**
 * MedTrustX — Blood Bank Technician (Role 143) Types
 * Task-first lab execution, blood processing, screening, and crossmatching.
 */

export interface LabTask {
  id: string;
  type: 'Collection' | 'Screening' | 'Crossmatch' | 'Storage' | 'Dispatch';
  unitId?: string;
  donorId?: string;
  patientId?: string;
  priority: 'Routine' | 'Urgent' | 'STAT';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Error';
  assignedAt: string;
  dueDate?: string;
}

export interface BloodUnit {
  id: string;
  barcode: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  componentType: 'Whole Blood' | 'PRBC' | 'FFP' | 'Platelets' | 'Cryoprecipitate';
  collectionDate: string;
  expiryDate: string;
  volumeML: number;
  status: 'Quarantined' | 'Screening' | 'Available' | 'Reserved' | 'Issued' | 'Discarded';
  location: string;
}

export interface ScreeningResult {
  id: string;
  unitId: string;
  testType: 'HIV' | 'HBV' | 'HCV' | 'Syphilis' | 'Malaria';
  result: 'Pending' | 'Negative' | 'Positive' | 'Invalid';
  performedAt?: string;
  technicianId?: string;
}

export interface CrossmatchRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientBloodGroup: string;
  requestedComponent: string;
  unitsRequired: number;
  status: 'Pending' | 'Processing' | 'Matched' | 'Incompatible';
  requestDate: string;
  matchedUnits: string[];
}

export interface TechnicianData {
  tasks: LabTask[];
  units: BloodUnit[];
  screenings: ScreeningResult[];
  crossmatches: CrossmatchRequest[];
  metrics: {
    unitsProcessed: number;
    testsCompleted: number;
    mismatchesPrevented: number;
  };
}
