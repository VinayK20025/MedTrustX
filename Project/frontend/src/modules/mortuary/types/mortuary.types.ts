/**
 * MedTrustX — Mortuary Service Types
 */

export type DeceasedStatus = 'Awaiting Intake' | 'Stored' | 'Autopsy in Progress' | 'Ready for Release' | 'Released';
export type StorageChamberStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';

export interface DeceasedRecord {
  id: string;
  patientId?: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  dateOfDeath: string;
  timeOfDeath: string;
  causeOfDeath?: string;
  status: DeceasedStatus;
  chamberId?: string;
  policeCase: boolean;
  autopsyRequested: boolean;
}

export interface MortuaryChamber {
  id: string;
  bay: string;
  status: StorageChamberStatus;
  deceasedId?: string;
  temperatureCelsius: number;
}

export interface ReleasePermit {
  id: string;
  deceasedId: string;
  releasedTo: string; // Next of kin / Funeral home
  relationship?: string;
  releasedBy: string;
  timestamp: string;
  permitNumber: string;
  policeClearanceReceived: boolean;
}

export interface MortuaryMetrics {
  totalCapacity: number;
  currentOccupancy: number;
  availableChambers: number;
  pendingAutopsiesCount: number;
  releasesTodayCount: number;
}

export interface MortuaryDashboardData {
  metrics: MortuaryMetrics;
  recentIntakes: DeceasedRecord[];
  activeStorage: MortuaryChamber[];
  pendingReleases: DeceasedRecord[];
}
