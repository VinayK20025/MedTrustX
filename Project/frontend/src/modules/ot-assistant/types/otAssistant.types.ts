/**
 * MedTrustX — Assistant Scrub Nurse Types
 */

export interface OTAssistantKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'time';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface OTCascadingCase {
  id: string;
  procedure: string;
  surgeon: string;
  otRoom: string;
  scheduledTime: string;
  status: 'Scheduled' | 'Pre-Op' | 'In Progress' | 'Recovery' | 'Completed';
  instrumentTraysNeeded: string[];
}

export interface SetupChecklistTask {
  id: string;
  caseId: string;
  description: string;
  category: 'Instruments' | 'Equipment' | 'Sterility' | 'Consumables';
  status: 'Pending' | 'Completed';
  verifiedBy?: string;
}

export interface InstrumentRequest {
  id: string;
  caseId: string;
  instrumentName: string;
  requestedBy: 'Surgeon' | 'Lead Scrub';
  timeRequested: string;
  status: 'Requested' | 'Preparing' | 'Supplied';
  priority: 'Routine' | 'Urgent';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Sharps' | 'Retractors' | 'Clamps' | 'Forceps' | 'Trays';
  count: number;
  status: 'Available' | 'In Use' | 'Sterilization' | 'Missing';
  trayAssignment?: string;
}

export interface PostOpCleanupTask {
  id: string;
  caseId: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface OTAssistantAlert {
  id: string;
  caseId: string;
  type: 'Missing Instrument' | 'Count Mismatch' | 'Sterility Breach' | 'Supply Low';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Resolved';
  message: string;
}

export interface OTAssistantDashboardData {
  kpis: OTAssistantKPI[];
  activeCase?: OTCascadingCase;
  upcomingCases: OTCascadingCase[];
  setupChecklist: SetupChecklistTask[];
  instrumentRequests: InstrumentRequest[];
  inventoryStatus: InventoryItem[];
  cleanupTasks: PostOpCleanupTask[];
  alerts: OTAssistantAlert[];
}
