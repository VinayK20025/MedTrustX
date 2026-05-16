import type { IntegrationData } from '../types/integration.types';

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

const mockData: IntegrationData = {
  metrics: {
    messagesToday: 52840,
    messagesPerHour: 10420,
    errorCount: 7,
    errorRate: 0.013,
    avgLatencyMs: 187,
    activeInterfaces: 9,
    uptimePercent: 99.97,
    failedMessages: 7,
  },
  interfaces: [
    { id: 'INT-001', name: 'ADT Feed — EHR to Billing', type: 'HL7 v2', sourceSystem: 'Epic EHR', targetSystem: 'Billing System', status: 'Active', protocol: 'MLLP/TCP', throughputPerHour: 3200, errorRate: 0.0, avgLatencyMs: 142, lastMessageAt: t(-12), sla: 300 },
    { id: 'INT-002', name: 'Lab Results — LIS to EHR', type: 'HL7 v2', sourceSystem: 'Cobas LIS', targetSystem: 'Epic EHR', status: 'Active', protocol: 'MLLP/TCP', throughputPerHour: 2100, errorRate: 0.3, avgLatencyMs: 198, lastMessageAt: t(-8), sla: 300 },
    { id: 'INT-003', name: 'Patient API — FHIR Gateway', type: 'FHIR R4', sourceSystem: 'Patient Portal', targetSystem: 'Epic EHR', status: 'Active', protocol: 'HTTPS/REST', throughputPerHour: 1800, errorRate: 0.0, avgLatencyMs: 95, lastMessageAt: t(-2), sla: 500 },
    { id: 'INT-004', name: 'Imaging Orders — PACS', type: 'DICOM', sourceSystem: 'Epic EHR', targetSystem: 'Agfa PACS', status: 'Active', protocol: 'DICOM/TCP', throughputPerHour: 520, errorRate: 0.2, avgLatencyMs: 340, lastMessageAt: t(-60), sla: 1000 },
    { id: 'INT-005', name: 'Insurance Claims — EDI', type: 'REST', sourceSystem: 'Billing System', targetSystem: 'Insurance Gateway', status: 'Degraded', protocol: 'HTTPS/REST', throughputPerHour: 180, errorRate: 4.2, avgLatencyMs: 890, lastMessageAt: t(-420), sla: 500 },
    { id: 'INT-006', name: 'Medication Orders — Pharmacy', type: 'HL7 v2', sourceSystem: 'Epic EHR', targetSystem: 'Pharmacy PIS', status: 'Active', protocol: 'MLLP/TCP', throughputPerHour: 740, errorRate: 0.0, avgLatencyMs: 112, lastMessageAt: t(-5), sla: 300 },
    { id: 'INT-007', name: 'Government Reporting — HMIS', type: 'REST', sourceSystem: 'Epic EHR', targetSystem: 'NHA HMIS Portal', status: 'Active', protocol: 'HTTPS/REST', throughputPerHour: 40, errorRate: 0.0, avgLatencyMs: 1240, lastMessageAt: t(-3600), sla: 5000 },
    { id: 'INT-008', name: 'IoMT Vitals — ICU', type: 'FHIR R4', sourceSystem: 'Philips ICU Monitors', targetSystem: 'Epic EHR', status: 'Active', protocol: 'HTTPS/REST', throughputPerHour: 4800, errorRate: 0.1, avgLatencyMs: 68, lastMessageAt: t(-1), sla: 500 },
  ],
  messages: [
    { id: 'MSG-10421', interfaceId: 'INT-001', type: 'ADT', standard: 'HL7 v2', status: 'Processed', sourceSystem: 'Epic EHR', targetSystem: 'Billing System', timestamp: t(-8), latencyMs: 140, patientId: 'PAT-4892' },
    { id: 'MSG-10420', interfaceId: 'INT-002', type: 'ORU', standard: 'HL7 v2', status: 'Failed', sourceSystem: 'Cobas LIS', targetSystem: 'Epic EHR', timestamp: t(-42), latencyMs: 0, patientId: 'PAT-7201', errorReason: 'Missing mandatory OBX-3 field (Observation Identifier — LOINC code not mapped)' },
    { id: 'MSG-10419', interfaceId: 'INT-003', type: 'Patient', standard: 'FHIR R4', status: 'Processed', sourceSystem: 'Patient Portal', targetSystem: 'Epic EHR', timestamp: t(-15), latencyMs: 88, patientId: 'PAT-3312' },
    { id: 'MSG-10418', interfaceId: 'INT-005', type: 'ADT', standard: 'REST', status: 'Failed', sourceSystem: 'Billing System', targetSystem: 'Insurance Gateway', timestamp: t(-422), latencyMs: 0, errorReason: 'HTTP 503 — Insurance Gateway timeout after 30s. Connection pool exhausted.' },
    { id: 'MSG-10417', interfaceId: 'INT-008', type: 'Observation', standard: 'FHIR R4', status: 'Processed', sourceSystem: 'Philips ICU', targetSystem: 'Epic EHR', timestamp: t(-2), latencyMs: 65, patientId: 'PAT-1023' },
    { id: 'MSG-10416', interfaceId: 'INT-006', type: 'ORM', standard: 'HL7 v2', status: 'Processed', sourceSystem: 'Epic EHR', targetSystem: 'Pharmacy PIS', timestamp: t(-5), latencyMs: 109, patientId: 'PAT-5590' },
    { id: 'MSG-10415', interfaceId: 'INT-002', type: 'ORU', standard: 'HL7 v2', status: 'Reprocessing', sourceSystem: 'Cobas LIS', targetSystem: 'Epic EHR', timestamp: t(-90), latencyMs: 0, patientId: 'PAT-8841', errorReason: 'LOINC code 58410-2 not found in mapping table' },
  ],
  mappings: [
    { id: 'MAP-001', interfaceId: 'INT-001', sourceField: 'PID-5', targetField: 'Patient.name', transformation: 'Concat: PID-5.1 + PID-5.2', status: 'Active', lastValidated: t(-3600) },
    { id: 'MAP-002', interfaceId: 'INT-001', sourceField: 'PID-7', targetField: 'Patient.birthDate', transformation: 'Format: YYYYMMDD → YYYY-MM-DD', status: 'Active', lastValidated: t(-3600) },
    { id: 'MAP-003', interfaceId: 'INT-002', sourceField: 'OBX-3', targetField: 'Observation.code', transformation: 'CodeSystem: Local → LOINC', codeSystem: 'LOINC', status: 'Active', lastValidated: t(-7200) },
    { id: 'MAP-004', interfaceId: 'INT-002', sourceField: 'OBX-5', targetField: 'Observation.valueQuantity', transformation: 'Parse: numeric + unit from string', status: 'Active', lastValidated: t(-7200) },
    { id: 'MAP-005', interfaceId: 'INT-001', sourceField: 'DG1-3', targetField: 'Condition.code', transformation: 'CodeSystem: Local → ICD-10', codeSystem: 'ICD-10', status: 'Draft', lastValidated: t(-86400) },
    { id: 'MAP-006', interfaceId: 'INT-006', sourceField: 'RXE-2', targetField: 'MedicationRequest.medication', transformation: 'CodeSystem: Local Drug → SNOMED', codeSystem: 'SNOMED-CT', status: 'Active', lastValidated: t(-3600) },
  ],
  routing: [
    { id: 'RTE-001', name: 'Lab Results → EHR + Notify', condition: 'MSH-9 = ORU^R01', sourceSystems: ['Cobas LIS', 'SRL Labs'], destinations: ['Epic EHR', 'Notification Service'], active: true, messagesRouted: 18420 },
    { id: 'RTE-002', name: 'ADT → Billing + Insurance', condition: 'MSH-9 = ADT^A01 OR ADT^A03', sourceSystems: ['Epic EHR'], destinations: ['Billing System', 'Insurance Gateway'], active: true, messagesRouted: 34210 },
    { id: 'RTE-003', name: 'ICU Vitals → Critical Alert', condition: 'OBX-5 > threshold AND OBX-2 = NM', sourceSystems: ['Philips ICU'], destinations: ['Epic EHR', 'Nurse Station Alert'], active: true, messagesRouted: 9820 },
    { id: 'RTE-004', name: 'Imaging Orders → PACS + RIS', condition: 'MSH-9 = ORM^O01 AND ZDS present', sourceSystems: ['Epic EHR'], destinations: ['Agfa PACS', 'RIS System'], active: true, messagesRouted: 4120 },
    { id: 'RTE-005', name: 'Discharge → Gov HMIS Report', condition: 'MSH-9 = ADT^A03', sourceSystems: ['Epic EHR'], destinations: ['NHA HMIS Portal'], active: false, messagesRouted: 312 },
  ],
  fhirEndpoints: [
    { id: 'FHIR-001', path: '/fhir/R4/Patient', resource: 'Patient', method: 'GET', status: 'Active', callsToday: 4821, avgLatencyMs: 88, authMethod: 'OAuth2 Bearer' },
    { id: 'FHIR-002', path: '/fhir/R4/Patient', resource: 'Patient', method: 'POST', status: 'Active', callsToday: 340, avgLatencyMs: 142, authMethod: 'OAuth2 Bearer' },
    { id: 'FHIR-003', path: '/fhir/R4/Observation', resource: 'Observation', method: 'GET', status: 'Active', callsToday: 12400, avgLatencyMs: 65, authMethod: 'OAuth2 Bearer' },
    { id: 'FHIR-004', path: '/fhir/R4/Encounter', resource: 'Encounter', method: 'GET', status: 'Active', callsToday: 2810, avgLatencyMs: 110, authMethod: 'OAuth2 Bearer' },
    { id: 'FHIR-005', path: '/fhir/R4/DiagnosticReport', resource: 'DiagnosticReport', method: 'GET', status: 'Active', callsToday: 1920, avgLatencyMs: 198, authMethod: 'OAuth2 Bearer' },
    { id: 'FHIR-006', path: '/fhir/R4/MedicationRequest', resource: 'MedicationRequest', method: 'POST', status: 'Draft', callsToday: 0, avgLatencyMs: 0, authMethod: 'OAuth2 Bearer' },
  ],
};

export const integrationApi = {
  getDashboardData: async () => ({ data: mockData, message: 'Success', status: 200 }),
  retryMessage: async (id: string) => ({ data: { success: true }, message: 'Message queued for retry', status: 200 }),
  discardMessage: async (id: string) => ({ data: { success: true }, message: 'Message discarded', status: 200 }),
  toggleRoute: async (id: string, active: boolean) => ({ data: { success: true }, message: 'Route updated', status: 200 }),
};
