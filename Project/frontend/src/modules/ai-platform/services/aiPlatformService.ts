/**
 * MedTrustX — AI Platform Service Layer
 * Handles all API communication for the AI Platform hub.
 */
import type {
  AiPlatformDashboardData, AiModel, TrainingJob, CdssAlert,
  InferenceLog, DigitalTwin, AnalyticsPipeline, FeatureStoreEntry,
  GovernanceRecord, AiPlatformMetrics,
} from '../types';

// ─── Mock Data Factory ────────────────────────────────────────────────────────
const models: AiModel[] = [
  { id: 'm1', name: 'SepsisPredictorV3', version: '3.2.1', domain: 'Clinical', type: 'Classification', status: 'Deployed', accuracy: 94.1, precision: 92.8, recall: 95.3, f1Score: 94.0, auc: 0.97, inferenceLatencyMs: 18, inferencesLast24h: 142800, trainingDataSize: 2800000, lastRetrained: '2026-04-28', nextRetrainDue: '2026-07-28', biasStatus: 'Clean', explainabilityScore: 98, governanceApproved: true, riskScore: 2.1, owner: 'AI/ML Team', endpoint: '/api/v1/ai/sepsis', tags: ['critical-care', 'icu', 'clinical-alert'], driftScore: 0.04, alertsActive: 0 },
  { id: 'm2', name: 'RadiologyDxCNN', version: '2.0.4', domain: 'Radiology', type: 'Computer Vision', status: 'Deployed', accuracy: 96.7, precision: 97.1, recall: 96.2, f1Score: 96.6, auc: 0.99, inferenceLatencyMs: 340, inferencesLast24h: 8420, trainingDataSize: 1500000, lastRetrained: '2026-03-15', nextRetrainDue: '2026-06-15', biasStatus: 'Under Review', explainabilityScore: 91, governanceApproved: true, riskScore: 1.8, owner: 'Radiology AI Team', endpoint: '/api/v1/ai/radiology/dx', tags: ['radiology', 'imaging', 'diagnostic'], driftScore: 0.06, alertsActive: 1 },
  { id: 'm3', name: 'MortalityRiskScorer', version: '1.5.0', domain: 'Clinical', type: 'Regression', status: 'Deployed', accuracy: 88.4, precision: 87.9, recall: 88.8, f1Score: 88.3, auc: 0.93, inferenceLatencyMs: 12, inferencesLast24h: 22400, trainingDataSize: 990000, lastRetrained: '2026-04-01', nextRetrainDue: '2026-07-01', biasStatus: 'Clean', explainabilityScore: 99, governanceApproved: true, riskScore: 2.5, owner: 'Clinical Intelligence', endpoint: '/api/v1/ai/mortality', tags: ['icu', 'risk', 'clinical'], driftScore: 0.02, alertsActive: 0 },
  { id: 'm4', name: 'DrugInteractionNLP', version: '4.1.0', domain: 'Pharmacy', type: 'NLP', status: 'Deployed', accuracy: 99.1, precision: 99.3, recall: 98.9, f1Score: 99.1, auc: 0.999, inferenceLatencyMs: 45, inferencesLast24h: 87600, trainingDataSize: 5400000, lastRetrained: '2026-05-01', nextRetrainDue: '2026-08-01', biasStatus: 'Clean', explainabilityScore: 95, governanceApproved: true, riskScore: 1.2, owner: 'Pharmacy AI', endpoint: '/api/v1/ai/pharmacy/drug-interact', tags: ['pharmacy', 'safety', 'cdss'], driftScore: 0.01, alertsActive: 0 },
  { id: 'm5', name: 'BedDemandForecaster', version: '2.3.0', domain: 'Operations', type: 'Time Series', status: 'Deployed', accuracy: 91.2, precision: 90.5, recall: 91.8, f1Score: 91.1, auc: 0.95, inferenceLatencyMs: 80, inferencesLast24h: 2880, trainingDataSize: 720000, lastRetrained: '2026-04-10', nextRetrainDue: '2026-07-10', biasStatus: 'Clean', explainabilityScore: 88, governanceApproved: true, riskScore: 1.5, owner: 'Operations Analytics', endpoint: '/api/v1/ai/ops/bed-forecast', tags: ['operations', 'planning', 'beds'], driftScore: 0.08, alertsActive: 0 },
  { id: 'm6', name: 'ReadmissionRiskV2', version: '2.1.1', domain: 'Clinical', type: 'Classification', status: 'Staging', accuracy: 87.6, precision: 86.2, recall: 88.9, f1Score: 87.5, auc: 0.92, inferenceLatencyMs: 22, inferencesLast24h: 0, trainingDataSize: 1800000, lastRetrained: '2026-05-08', nextRetrainDue: '2026-08-08', biasStatus: 'Clean', explainabilityScore: 97, governanceApproved: false, riskScore: 2.8, owner: 'Clinical Intelligence', endpoint: '/api/v1/ai/readmission', tags: ['discharge', 'risk', 'clinical'], driftScore: 0.0, alertsActive: 0 },
  { id: 'm7', name: 'TreatmentResponseML', version: '1.2.0', domain: 'Clinical', type: 'Regression', status: 'Training', accuracy: 0, precision: 0, recall: 0, f1Score: 0, auc: 0, inferenceLatencyMs: 0, inferencesLast24h: 0, trainingDataSize: 3200000, lastRetrained: '2026-05-12', nextRetrainDue: '2026-08-12', biasStatus: 'Clean', explainabilityScore: 0, governanceApproved: false, riskScore: 0, owner: 'Oncology AI Lab', endpoint: '', tags: ['treatment', 'oncology', 'response'], driftScore: 0.0, alertsActive: 0 },
  { id: 'm8', name: 'FallRiskClassifier', version: '3.0.0', domain: 'Clinical', type: 'Classification', status: 'Deployed', accuracy: 93.4, precision: 92.1, recall: 94.6, f1Score: 93.3, auc: 0.97, inferenceLatencyMs: 8, inferencesLast24h: 14400, trainingDataSize: 620000, lastRetrained: '2026-04-20', nextRetrainDue: '2026-07-20', biasStatus: 'Clean', explainabilityScore: 100, governanceApproved: true, riskScore: 1.9, owner: 'Nursing AI', endpoint: '/api/v1/ai/fall-risk', tags: ['nursing', 'safety', 'patient-monitoring'], driftScore: 0.03, alertsActive: 0 },
];

const trainingJobs: TrainingJob[] = [
  { id: 'tj1', modelId: 'm7', modelName: 'TreatmentResponseML', status: 'Running', progress: 64, startedAt: '2026-05-12T10:00:00Z', estimatedCompletionAt: '2026-05-12T22:00:00Z', gpuUtilization: 88, cpuUtilization: 42, memoryUsedGb: 96, epochsCurrent: 128, epochsTotal: 200, lossValue: 0.0342, validationAccuracy: 87.4, triggeredBy: 'manual', datasetVersion: 'v8.1', notes: 'Extended oncology dataset with 6-month follow-up' },
  { id: 'tj2', modelId: 'm2', modelName: 'RadiologyDxCNN', status: 'Queued', progress: 0, startedAt: '', estimatedCompletionAt: '2026-05-13T18:00:00Z', gpuUtilization: 0, cpuUtilization: 0, memoryUsedGb: 0, epochsCurrent: 0, epochsTotal: 50, lossValue: 0, validationAccuracy: 0, triggeredBy: 'drift', datasetVersion: 'v12.3', notes: 'Triggered by bias review recommendation' },
  { id: 'tj3', modelId: 'm5', modelName: 'BedDemandForecaster', status: 'Completed', progress: 100, startedAt: '2026-05-11T02:00:00Z', estimatedCompletionAt: '2026-05-11T08:00:00Z', gpuUtilization: 0, cpuUtilization: 0, memoryUsedGb: 0, epochsCurrent: 150, epochsTotal: 150, lossValue: 0.0018, validationAccuracy: 91.2, triggeredBy: 'scheduled', datasetVersion: 'v5.4', notes: 'Scheduled monthly retrain — deployed to staging' },
];

const cdssAlerts: CdssAlert[] = [
  { id: 'ca1', patientId: 'P-10042', patientName: 'Rajan Mehta', ward: 'ICU-3', alertType: 'Drug Interaction', severity: 'Critical', message: 'Potential fatal interaction: Warfarin + Metronidazole detected', recommendation: 'Immediately review anticoagulation therapy. Consult pharmacist and attending physician.', generatedBy: 'DrugInteractionNLP v4.1.0', confidenceScore: 99.7, triggeredAt: '2026-05-12T16:28:00Z', status: 'Active', relatedOrders: ['ORD-88234', 'ORD-88198'], evidenceLinks: ['https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2948799/'] },
  { id: 'ca2', patientId: 'P-10091', patientName: 'Leena Shah', ward: 'Ward-7B', alertType: 'Risk Score', severity: 'High', message: 'Sepsis risk score: 82/100 — High likelihood in next 6 hours', recommendation: 'Order blood cultures, initiate sepsis bundle protocol (SBAR), alert on-call physician.', generatedBy: 'SepsisPredictorV3 v3.2.1', confidenceScore: 94.1, triggeredAt: '2026-05-12T15:44:00Z', status: 'Active', relatedOrders: [], evidenceLinks: [] },
  { id: 'ca3', patientId: 'P-10034', patientName: 'Arjun Kapoor', ward: 'Post-Op', alertType: 'Clinical Warning', severity: 'High', message: 'Fall risk score elevated (MORSE: 85). Patient scheduled for ambulation.', recommendation: 'Implement fall prevention protocol. Assign 1:1 sitter. Bed alarm active.', generatedBy: 'FallRiskClassifier v3.0.0', confidenceScore: 93.4, triggeredAt: '2026-05-12T14:10:00Z', status: 'Acknowledged', acknowledgedAt: '2026-05-12T14:18:00Z', acknowledgedBy: 'Dr. Priya Nair', relatedOrders: ['ORD-87901'], evidenceLinks: [] },
  { id: 'ca4', patientId: 'P-10058', patientName: 'Sunita Rao', ward: 'Oncology-2', alertType: 'Diagnostic Suggestion', severity: 'Medium', message: 'Radiology DX: Possible pulmonary nodule identified (>8mm) in CT scan #CT-20240512', recommendation: 'Schedule pulmonologist review. Repeat CT in 3 months or proceed with PET scan per NCCN guidelines.', generatedBy: 'RadiologyDxCNN v2.0.4', confidenceScore: 88.2, triggeredAt: '2026-05-12T11:30:00Z', status: 'Active', relatedOrders: ['CT-20240512'], evidenceLinks: [] },
  { id: 'ca5', patientId: 'P-10077', patientName: 'Mohammed Al-Farsi', ward: 'Cardiac-ICU', alertType: 'Protocol Deviation', severity: 'Medium', message: 'Troponin reassessment due 3 hours ago — not yet ordered', recommendation: 'Order stat troponin I/T per ACS management protocol. Document reason for delay.', generatedBy: 'Clinical Protocol Engine v1.1', confidenceScore: 100, triggeredAt: '2026-05-12T10:05:00Z', status: 'Resolved', acknowledgedAt: '2026-05-12T10:12:00Z', acknowledgedBy: 'Dr. Hassan Qureshi', relatedOrders: ['ORD-88004'], evidenceLinks: [] },
];

const digitalTwins: DigitalTwin[] = [
  { id: 'dt1', entityType: 'Ward', entityId: 'ICU-1', entityName: 'ICU Ward 1', status: 'Synced', lastSyncedAt: '2026-05-12T17:40:00Z', driftScore: 0.02, stateVariables: { occupancyRate: '92%', avgNursePatientRatio: '1:2.1', avgSOFA: 9.4, criticalCount: 6, ventilatorUtilization: '75%' }, activeSimulations: 2, totalSimulations: 48, predictedEvents: [{ id: 'pe1', twinId: 'dt1', eventType: 'Capacity Breach', probability: 0.74, estimatedAt: '2026-05-12T22:00:00Z', impact: 'High', description: 'ICU-1 occupancy predicted to reach 100% within 4.5h based on admission rate.', recommendedAction: 'Initiate step-down transfer for 2 stable patients to ward.' }] },
  { id: 'dt2', entityType: 'Patient', entityId: 'P-10042', entityName: 'Rajan Mehta', status: 'Drifted', lastSyncedAt: '2026-05-12T17:38:00Z', driftScore: 0.31, stateVariables: { sepsisProbability: '0.82', fallRisk: 'High', heartRate: 118, SpO2: 93, SOFA: 11, pendingOrders: 4 }, activeSimulations: 1, totalSimulations: 7, predictedEvents: [{ id: 'pe2', twinId: 'dt2', eventType: 'Septic Shock Onset', probability: 0.68, estimatedAt: '2026-05-12T20:00:00Z', impact: 'Critical', description: 'Trajectory suggests septic shock within 2.5h if current treatment unchanged.', recommendedAction: 'Escalate vasopressor therapy, repeat lactate, consult ID team.' }] },
  { id: 'dt3', entityType: 'Device', entityId: 'VENT-ICU-1-04', entityName: 'Ventilator ICU-1 Bay 4', status: 'Synced', lastSyncedAt: '2026-05-12T17:42:00Z', driftScore: 0.0, stateVariables: { FiO2: '55%', PEEP: 8, tidalVolume: 420, respiratoryRate: 14, status: 'Active', maintenanceDue: '2026-06-01' }, activeSimulations: 0, totalSimulations: 12, predictedEvents: [] },
  { id: 'dt4', entityType: 'Pathway', entityId: 'PATH-STEMI', entityName: 'STEMI Clinical Pathway', status: 'Synced', lastSyncedAt: '2026-05-12T17:00:00Z', driftScore: 0.11, stateVariables: { activePatients: 3, avgDoor2Balloon: '52 min', complianceRate: '94%', deviations30d: 2 }, activeSimulations: 0, totalSimulations: 120, predictedEvents: [] },
];

const analyticsPipelines: AnalyticsPipeline[] = [
  { id: 'ap1', name: 'Clinical Outcomes ETL', domain: 'Clinical', status: 'Running', schedule: '0 */6 * * *', lastRunAt: '2026-05-12T12:00:00Z', nextRunAt: '2026-05-12T18:00:00Z', durationSeconds: 1820, inputDatasets: ['EHR_ENCOUNTERS', 'LAB_RESULTS', 'VITAL_SIGNS'], outputMetrics: ['mortality_rate', 'readmission_rate', 'los_avg'], recordsProcessed: 2_840_000, errorRate: 0.01, owner: 'Data Engineering' },
  { id: 'ap2', name: 'Sepsis Feature Pipeline', domain: 'AI/ML', status: 'Idle', schedule: '0 * * * *', lastRunAt: '2026-05-12T17:00:00Z', nextRunAt: '2026-05-12T18:00:00Z', durationSeconds: 340, inputDatasets: ['VITAL_SIGNS', 'LAB_RESULTS', 'MEDICATIONS'], outputMetrics: ['sepsis_feature_vector', 'news2_score', 'sofa_components'], recordsProcessed: 184_000, errorRate: 0.0, owner: 'AI/ML Team' },
  { id: 'ap3', name: 'Financial Analytics Rollup', domain: 'Finance', status: 'Idle', schedule: '0 1 * * *', lastRunAt: '2026-05-12T01:00:00Z', nextRunAt: '2026-05-13T01:00:00Z', durationSeconds: 4200, inputDatasets: ['BILLING_EVENTS', 'CLAIMS_DATA', 'INSURANCE_EOB'], outputMetrics: ['revenue_per_bed', 'claim_denial_rate', 'collection_ratio'], recordsProcessed: 1_100_000, errorRate: 0.02, owner: 'Finance Analytics' },
  { id: 'ap4', name: 'Radiology AI Feature Extractor', domain: 'Radiology', status: 'Failed', schedule: '0 */4 * * *', lastRunAt: '2026-05-12T08:00:00Z', nextRunAt: '2026-05-12T12:00:00Z', durationSeconds: 0, inputDatasets: ['DICOM_STORE', 'RADIOLOGY_REPORTS'], outputMetrics: ['cnn_feature_maps', 'anomaly_probability'], recordsProcessed: 0, errorRate: 1.0, owner: 'Radiology AI Team' },
  { id: 'ap5', name: 'Infection Surveillance Stream', domain: 'Epidemiology', status: 'Running', schedule: '*/15 * * * *', lastRunAt: '2026-05-12T17:30:00Z', nextRunAt: '2026-05-12T17:45:00Z', durationSeconds: 45, inputDatasets: ['MICROBIOLOGY_RESULTS', 'ANTIBIOTIC_ORDERS'], outputMetrics: ['hais_rate', 'pathogen_clusters', 'antibiogram_summary'], recordsProcessed: 22_000, errorRate: 0.0, owner: 'Infection Control AI' },
];

const featureStore: FeatureStoreEntry[] = [
  { id: 'fs1', name: 'patient_vitals_5m_window', description: 'Rolling 5-minute aggregates of HR, SpO2, RR, BP', domain: 'Clinical', dataType: 'Numerical', freshness: 'Real-time', usedByModels: 4, lastUpdated: '2026-05-12T17:40:00Z', owner: 'Data Platform', missingRate: 0.8, driftDetected: false },
  { id: 'fs2', name: 'lab_result_deltas_24h', description: 'Delta change in key labs over 24-hour window', domain: 'Clinical', dataType: 'Numerical', freshness: 'Hourly', usedByModels: 6, lastUpdated: '2026-05-12T17:00:00Z', owner: 'Data Platform', missingRate: 2.1, driftDetected: false },
  { id: 'fs3', name: 'medication_exposure_vector', description: 'One-hot medication exposure features per patient', domain: 'Pharmacy', dataType: 'Categorical', freshness: 'Hourly', usedByModels: 3, lastUpdated: '2026-05-12T17:00:00Z', owner: 'Pharmacy AI', missingRate: 0.3, driftDetected: false },
  { id: 'fs4', name: 'dicom_cnn_embeddings', description: '2048-dim embedding from RadiologyDxCNN feature extractor', domain: 'Radiology', dataType: 'Image', freshness: 'On-demand', usedByModels: 1, lastUpdated: '2026-05-12T08:00:00Z', owner: 'Radiology AI Team', missingRate: 0.0, driftDetected: true },
  { id: 'fs5', name: 'bed_occupancy_rolling_7d', description: 'Rolling 7-day occupancy by ward/unit', domain: 'Operations', dataType: 'Time Series', freshness: 'Hourly', usedByModels: 2, lastUpdated: '2026-05-12T17:00:00Z', owner: 'Operations Analytics', missingRate: 0.0, driftDetected: false },
];

const governanceRecords: GovernanceRecord[] = [
  { id: 'gr1', modelId: 'm6', modelName: 'ReadmissionRiskV2', reviewType: 'Initial Approval', status: 'Pending', reviewedBy: 'AI Ethics Board', expiresAt: '2026-06-15', findings: 'Validation package submitted. Awaiting bias audit results from infosec team.', ethicsScore: 0, biasScore: 0, complianceFlags: ['AWAITING_BIAS_REPORT'], attachments: ['validation_report_v2.1.pdf'] },
  { id: 'gr2', modelId: 'm2', modelName: 'RadiologyDxCNN', reviewType: 'Bias Audit', status: 'Under Review', reviewedBy: 'Dr. Ayesha Patel (AI Ethics)', reviewedAt: '2026-05-10', expiresAt: '2026-05-20', findings: 'Potential underrepresentation of South Asian female demographics in training data identified. Retraining recommended.', ethicsScore: 74, biasScore: 68, complianceFlags: ['DEMOGRAPHIC_BIAS_RISK'], attachments: ['bias_audit_report_dx_cnn.pdf'] },
  { id: 'gr3', modelId: 'm1', modelName: 'SepsisPredictorV3', reviewType: 'Periodic Review', status: 'Approved', reviewedBy: 'AI Governance Committee', reviewedAt: '2026-04-30', expiresAt: '2026-10-30', findings: 'All metrics within acceptable thresholds. Drift score 0.04 — within bounds. No bias detected.', ethicsScore: 97, biasScore: 99, complianceFlags: [], attachments: ['sepsis_v3_review_2026q2.pdf'] },
];

const metrics: AiPlatformMetrics = {
  totalModels: models.length,
  modelsDeployed: models.filter(m => m.status === 'Deployed').length,
  modelsInTraining: models.filter(m => m.status === 'Training').length,
  pendingGovernanceApproval: governanceRecords.filter(g => g.status === 'Pending' || g.status === 'Under Review').length,
  totalInferencesToday: models.reduce((s, m) => s + m.inferencesLast24h, 0),
  avgInferenceLatencyMs: 72,
  avgModelAccuracy: 92.6,
  activeCdssAlerts: cdssAlerts.filter(a => a.status === 'Active').length,
  criticalCdssAlerts: cdssAlerts.filter(a => a.severity === 'Critical' && a.status === 'Active').length,
  digitalTwinsActive: digitalTwins.filter(d => d.status === 'Synced').length,
  digitalTwinsDrifted: digitalTwins.filter(d => d.status === 'Drifted').length,
  analyticsJobsRunning: analyticsPipelines.filter(p => p.status === 'Running').length,
  analyticsJobsFailed: analyticsPipelines.filter(p => p.status === 'Failed').length,
  featureStoreEntries: featureStore.length,
  gpuUtilizationAvg: 54,
  computeCostToday: 1840,
  driftAlertsActive: models.filter(m => m.driftScore > 0.1).length,
  biasAlertsActive: governanceRecords.filter(g => g.complianceFlags.includes('DEMOGRAPHIC_BIAS_RISK')).length,
};

// ─── API Simulation ───────────────────────────────────────────────────────────
function delay<T>(data: T, ms = 400): Promise<{ data: T }> {
  return new Promise(resolve => setTimeout(() => resolve({ data }), ms));
}

export const aiPlatformService = {
  getDashboard: (): Promise<{ data: AiPlatformDashboardData }> =>
    delay({ metrics, models, trainingJobs, cdssAlerts, inferenceLogs: [], digitalTwins, analyticsPipelines, featureStore, governanceRecords }),

  getModels: (): Promise<{ data: AiModel[] }> => delay(models),
  getModel: (id: string): Promise<{ data: AiModel | undefined }> => delay(models.find(m => m.id === id)),
  retrainModel: (id: string): Promise<{ data: { success: boolean; jobId: string } }> => delay({ success: true, jobId: `tj-${Date.now()}` }),
  deployModel: (id: string): Promise<{ data: { success: boolean } }> => delay({ success: true }),

  getTrainingJobs: (): Promise<{ data: TrainingJob[] }> => delay(trainingJobs),
  cancelTrainingJob: (id: string): Promise<{ data: { success: boolean } }> => delay({ success: true }),

  getCdssAlerts: (): Promise<{ data: CdssAlert[] }> => delay(cdssAlerts),
  acknowledgeCdssAlert: (id: string, by: string): Promise<{ data: { success: boolean } }> => delay({ success: true }),
  resolveCdssAlert: (id: string): Promise<{ data: { success: boolean } }> => delay({ success: true }),

  getDigitalTwins: (): Promise<{ data: DigitalTwin[] }> => delay(digitalTwins),
  syncDigitalTwin: (id: string): Promise<{ data: { success: boolean } }> => delay({ success: true }),

  getAnalyticsPipelines: (): Promise<{ data: AnalyticsPipeline[] }> => delay(analyticsPipelines),
  triggerPipeline: (id: string): Promise<{ data: { success: boolean } }> => delay({ success: true }),

  getFeatureStore: (): Promise<{ data: FeatureStoreEntry[] }> => delay(featureStore),

  getGovernanceRecords: (): Promise<{ data: GovernanceRecord[] }> => delay(governanceRecords),
  approveGovernance: (id: string): Promise<{ data: { success: boolean } }> => delay({ success: true }),
  rejectGovernance: (id: string, reason: string): Promise<{ data: { success: boolean } }> => delay({ success: true }),

  getMetrics: (): Promise<{ data: AiPlatformMetrics }> => delay(metrics),
};
