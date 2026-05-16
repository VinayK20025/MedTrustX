/**
 * MedTrustX — Incident Responder Platform Types
 * Breach Handling, Containment, Recovery, Forensics.
 */

export type IncidentSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type IncidentPhase = 'Detection' | 'Analysis' | 'Containment' | 'Eradication' | 'Recovery' | 'Post-Incident';
export type ContainmentAction = 'Isolate Device' | 'Block IP' | 'Disable Account' | 'Quarantine System' | 'Kill Process';
export type RecoveryStatus = 'Pending' | 'In Progress' | 'Restored' | 'Failed' | 'Verified';

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  phase: IncidentPhase;
  category: string; // e.g., Ransomware, Data Breach, Insider Threat
  affectedSystems: string[];
  assignedTo: string;
  createdAt: string;
  lastUpdated: string;
}

export interface ResponseAction {
  id: string;
  incidentId: string;
  actionName: string;
  type: ContainmentAction | 'Custom';
  status: 'Pending' | 'Executing' | 'Done' | 'Failed';
  executedBy?: string;
  timestamp: string;
}

export interface ContainmentRecord {
  id: string;
  incidentId: string;
  systemName: string;
  action: ContainmentAction;
  status: 'Isolated' | 'Blocked' | 'Disabled' | 'Pending';
  timestamp: string;
}

export interface RecoveryItem {
  id: string;
  incidentId: string;
  serviceName: string;
  status: RecoveryStatus;
  rtoMinutes: number; // Recovery Time Objective
  actualMinutes?: number;
  timestamp: string;
}

export interface ForensicArtifact {
  id: string;
  incidentId: string;
  artifactType: 'Memory Dump' | 'Disk Image' | 'Network Capture' | 'Log Bundle' | 'Malware Sample';
  status: 'Collected' | 'Analyzing' | 'Analyzed' | 'Preserved';
  hash: string;
  timestamp: string;
}

export interface PlaybookStep {
  id: string;
  incidentId: string;
  stepName: string;
  order: number;
  status: 'Pending' | 'In Progress' | 'Done' | 'Skipped';
}

export interface IncidentResponderMetrics {
  activeIncidents: number;
  mttrMinutes: number;
  containmentTimeMinutes: number;
  recoverySuccessRate: number; // percentage
  openBreaches: number;
}

export interface IncidentResponderData {
  metrics: IncidentResponderMetrics;
  incidents: Incident[];
  actions: ResponseAction[];
  containment: ContainmentRecord[];
  recovery: RecoveryItem[];
  forensics: ForensicArtifact[];
  playbooks: PlaybookStep[];
}
