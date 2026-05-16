/**
 * MedTrustX — Integration Engineer HL7/FHIR (Role 154) Types
 * Healthcare interoperability, data exchange, message monitoring & routing.
 */

export type InterfaceType = 'HL7 v2' | 'FHIR R4' | 'DICOM' | 'REST' | 'SOAP';
export type MessageStatus = 'Processed' | 'Failed' | 'Pending' | 'Reprocessing';
export type HL7EventType = 'ADT' | 'ORM' | 'ORU' | 'MDM' | 'SIU' | 'DFT';
export type FhirResource = 'Patient' | 'Encounter' | 'Observation' | 'DiagnosticReport' | 'MedicationRequest' | 'Condition';
export type MappingStatus = 'Active' | 'Draft' | 'Deprecated';
export type InterfaceStatus = 'Active' | 'Degraded' | 'Down' | 'Testing';

export interface IntegrationInterface {
  id: string;
  name: string;
  type: InterfaceType;
  sourceSystem: string;
  targetSystem: string;
  status: InterfaceStatus;
  protocol: string;
  throughputPerHour: number;
  errorRate: number;       // percentage
  avgLatencyMs: number;
  lastMessageAt: string;
  sla: number;             // target latency in ms
}

export interface IntegrationMessage {
  id: string;
  interfaceId: string;
  type: HL7EventType | FhirResource | string;
  standard: InterfaceType;
  status: MessageStatus;
  sourceSystem: string;
  targetSystem: string;
  timestamp: string;
  latencyMs: number;
  patientId?: string;
  errorReason?: string;
  payload?: string;
}

export interface MappingRule {
  id: string;
  interfaceId: string;
  sourceField: string;
  targetField: string;
  transformation: string;
  codeSystem?: string;
  status: MappingStatus;
  lastValidated: string;
}

export interface RoutingRule {
  id: string;
  name: string;
  condition: string;
  sourceSystems: string[];
  destinations: string[];
  active: boolean;
  messagesRouted: number;
}

export interface FhirEndpoint {
  id: string;
  path: string;
  resource: FhirResource;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'Active' | 'Draft' | 'Deprecated';
  callsToday: number;
  avgLatencyMs: number;
  authMethod: string;
}

export interface IntegrationMetrics {
  messagesToday: number;
  messagesPerHour: number;
  errorCount: number;
  errorRate: number;         // percentage
  avgLatencyMs: number;
  activeInterfaces: number;
  uptimePercent: number;
  failedMessages: number;
}

export interface IntegrationData {
  metrics: IntegrationMetrics;
  interfaces: IntegrationInterface[];
  messages: IntegrationMessage[];
  mappings: MappingRule[];
  routing: RoutingRule[];
  fhirEndpoints: FhirEndpoint[];
}
