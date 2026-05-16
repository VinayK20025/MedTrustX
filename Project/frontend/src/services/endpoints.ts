/**
 * MedTrustX — Cross-Service API Registry
 * ──────────────────────────────────────────────────
 * Central registry mapping all frontend modules to their
 * corresponding backend API endpoints. This enables:
 *
 *   • Unified API path discovery
 *   • Module → Backend service mapping
 *   • Type-safe cross-service data fetching
 *
 * Usage:
 *   import { endpoints } from '@/services/endpoints';
 *   const patients = await apiGet(endpoints.patients.list);
 */

export const endpoints = {
  /* ── Clinical Services (Python/FastAPI) ─────────── */
  patients: {
    list: '/api/v1/patients',
    getById: (id: string) => `/api/v1/patients/${id}`,
    getByMrn: (mrn: string) => `/api/v1/patients/mrn/${mrn}`,
    search: '/api/v1/patients/search',
    create: '/api/v1/patients',
    update: (id: string) => `/api/v1/patients/${id}`,
    delete: (id: string) => `/api/v1/patients/${id}`,
    timeline: (id: string) => `/api/v1/patients/${id}/timeline`,
    summary: (id: string) => `/api/v1/patients/${id}/summary`,
    linkMpi: (id: string) => `/api/v1/patients/${id}/link-mpi`,
    stats: '/api/v1/patients/stats/summary',
  },
  clinical: {
    encounters: '/api/v1/clinical/encounters',
    encounter: (id: string) => `/api/v1/clinical/encounters/${id}`,
    notes: (patientId: string) => `/api/v1/clinical/patients/${patientId}/notes`,
    vitals: (patientId: string) => `/api/v1/clinical/patients/${patientId}/vitals`,
    vitalsLatest: (patientId: string) => `/api/v1/clinical/patients/${patientId}/vitals/latest`,
    orders: (patientId: string) => `/api/v1/clinical/patients/${patientId}/orders`,
    summary: (patientId: string) => `/api/v1/clinical/patients/${patientId}/summary`,
    timeline: (patientId: string) => `/api/v1/clinical/patients/${patientId}/timeline`,
  },
  diagnostics: {
    orders: '/api/v1/diagnostics/orders',
    order: (id: string) => `/api/v1/diagnostics/orders/${id}`,
    results: (patientId: string) => `/api/v1/diagnostics/patients/${patientId}/results`,
    panels: '/api/v1/diagnostics/panels',
  },
  pharmacy: {
    prescriptions: '/api/v1/pharmacy/prescriptions',
    prescription: (id: string) => `/api/v1/pharmacy/prescriptions/${id}`,
    dispense: (id: string) => `/api/v1/pharmacy/prescriptions/${id}/dispense`,
    inventory: '/api/v1/pharmacy/inventory',
    drugSearch: '/api/v1/pharmacy/drugs/search',
    interactions: '/api/v1/pharmacy/interactions/check',
  },
  nursing: {
    tasks: '/api/v1/nursing/tasks',
    task: (id: string) => `/api/v1/nursing/tasks/${id}`,
    careplan: (patientId: string) => `/api/v1/nursing/patients/${patientId}/careplan`,
    handover: '/api/v1/nursing/handover',
    rounds: '/api/v1/nursing/rounds',
  },
  careCoordination: {
    plans: '/api/v1/care-plans',
    plan: (id: string) => `/api/v1/care-plans/${id}`,
    updatePlan: (id: string) => `/api/v1/care-plans/${id}`,
    patientPlans: (patientId: string) => `/api/v1/care-plans/patient/${patientId}`,
    planTasks: (planId: string) => `/api/v1/care-plans/${planId}/tasks`,
    task: (taskId: string) => `/api/v1/care-tasks/${taskId}`,
    workflows: '/api/v1/care-workflows',
    workflow: (workflowId: string) => `/api/v1/care-workflows/${workflowId}`,
  },
  ot: {
    schedule: '/api/v1/ot/schedule',
    surgery: (id: string) => `/api/v1/ot/${id}`,
    preop: (id: string) => `/api/v1/ot/${id}/preop`,
    intraop: (id: string) => `/api/v1/ot/${id}/intraop`,
    postop: (id: string) => `/api/v1/ot/${id}/postop`,
    availability: '/api/v1/ot/availability',
  },
  icu: {
    patients: '/api/v1/icu/patients',
    patient: (id: string) => `/api/v1/icu/patients/${id}`,
    monitoring: (patientId: string) => `/api/v1/icu/patients/${patientId}/monitoring`,
    ventilator: (patientId: string) => `/api/v1/icu/patients/${patientId}/ventilator`,
    scoring: (patientId: string) => `/api/v1/icu/patients/${patientId}/scores`,
  },
  bloodBank: {
    inventory: '/api/v1/blood-bank/inventory',
    donors: '/api/v1/blood-bank/donors',
    requests: '/api/v1/blood-bank/requests',
    crossmatch: '/api/v1/blood-bank/crossmatch',
    issuance: '/api/v1/blood-bank/issuance',
  },
  infectionControl: {
    cases: '/api/v1/infection-control/cases',
    surveillance: '/api/v1/infection-control/surveillance',
    outbreaks: '/api/v1/infection-control/outbreaks',
    antibiogram: '/api/v1/infection-control/antibiogram',
  },
  medicalRecords: {
    records: '/api/v1/medical-records',
    record: (id: string) => `/api/v1/medical-records/${id}`,
    documents: (patientId: string) => `/api/v1/medical-records/patients/${patientId}/documents`,
    upload: '/api/v1/medical-records/upload',
  },
  treatmentPlans: {
    plans: '/api/v1/treatment-plans',
    plan: (planId: string) => `/api/v1/treatment-plans/${planId}`,
    patientPlans: (patientId: string) => `/api/v1/treatment-plans/patient/${patientId}`,
    planVersions: (planId: string) => `/api/v1/treatment-plans/${planId}/versions`,
    planItems: (planId: string) => `/api/v1/treatment-plans/${planId}/items`,
    planAdherence: (planId: string) => `/api/v1/treatment-plans/${planId}/adherence`,
  },

  /* ── Operational Services (Node.js/NestJS) ────────── */
  appointments: {
    list: '/api/v1/appointments',
    getById: (id: string) => `/api/v1/appointments/${id}`,
    create: '/api/v1/appointments',
    update: (id: string) => `/api/v1/appointments/${id}`,
    cancel: (id: string) => `/api/v1/appointments/${id}/cancel`,
    reschedule: (id: string) => `/api/v1/appointments/${id}/reschedule`,
    statsToday: '/api/v1/appointments/stats/today',
    slots: '/api/v1/appointments/slots',
  },
  billing: {
    invoices: '/api/v1/billing/invoices',
    invoice: (id: string) => `/api/v1/billing/invoices/${id}`,
    payments: '/api/v1/billing/payments',
    charges: (patientId: string) => `/api/v1/billing/patients/${patientId}/charges`,
    revenueSummary: '/api/v1/billing/revenue/summary',
    estimate: '/api/v1/billing/estimate',
  },
  inventory: {
    items: '/api/v1/inventory/items',
    item: (id: string) => `/api/v1/inventory/items/${id}`,
    requisitions: '/api/v1/inventory/requisitions',
    stockAlerts: '/api/v1/inventory/alerts',
    purchaseOrders: '/api/v1/inventory/purchase-orders',
  },
  hr: {
    employees: '/api/v1/hr/employees',
    employee: (id: string) => `/api/v1/hr/employees/${id}`,
    attendance: '/api/v1/hr/attendance',
    leaves: '/api/v1/hr/leaves',
    roster: '/api/v1/hr/roster',
    departments: '/api/v1/hr/departments',
  },
  facilities: {
    // Facilities (main)
    list: '/api/v1/facilities',
    create: '/api/v1/facilities',
    facility: (id: string) => `/api/v1/facilities/${id}`,
    updateFacility: (id: string) => `/api/v1/facilities/${id}`,
    // Rooms
    rooms: '/api/v1/rooms',
    createRoom: '/api/v1/rooms',
    room: (id: string) => `/api/v1/rooms/${id}`,
    updateRoom: (id: string) => `/api/v1/rooms/${id}`,
    // Assets
    assets: '/api/v1/assets',
    createAsset: '/api/v1/assets',
    asset: (id: string) => `/api/v1/assets/${id}`,
    updateAsset: (id: string) => `/api/v1/assets/${id}`,
    // Maintenance
    maintenance: '/api/v1/maintenance',
    maintenanceRequests: '/api/v1/maintenance/requests',
    createMaintenanceRequest: '/api/v1/maintenance/requests',
    maintenanceRequest: (id: string) => `/api/v1/maintenance/requests/${id}`,
    updateMaintenanceRequest: (id: string) => `/api/v1/maintenance/requests/${id}`,
    // Legacy (for backwards compatibility)
    requests: '/api/v1/facilities/requests',
  },
  er: {
    cases: '/api/v1/er/cases',
    triage: '/api/v1/er/triage',
    statsCurrent: '/api/v1/er/stats/current',
    queue: '/api/v1/er/queue',
    ambulance: '/api/v1/er/ambulance',
  },
  beds: {
    list: '/api/v1/beds',
    occupancy: '/api/v1/beds/occupancy/summary',
    ward: (wardId: string) => `/api/v1/beds/wards/${wardId}`,
    assign: '/api/v1/beds/assign',
    release: (bedId: string) => `/api/v1/beds/${bedId}/release`,
    transfer: '/api/v1/beds/transfer',
  },
  orders: {
    list: '/api/v1/orders',
    create: '/api/v1/orders',
    getById: (id: string) => `/api/v1/orders/${id}`,
    update: (id: string) => `/api/v1/orders/${id}`,
    cancel: (id: string) => `/api/v1/orders/${id}/cancel`,
  },
  telemedicine: {
    sessions: '/api/v1/telemedicine/sessions',
    session: (id: string) => `/api/v1/telemedicine/sessions/${id}`,
    schedule: '/api/v1/telemedicine/schedule',
    recordings: '/api/v1/telemedicine/recordings',
  },
  notifications: {
    list: '/api/v1/notifications',
    markRead: (id: string) => `/api/v1/notifications/${id}/read`,
    preferences: '/api/v1/notifications/preferences',
    unreadCount: '/api/v1/notifications/unread/count',
  },

  /* ── Platform / Security Services ─────────────────── */
  iam: {
    users: '/api/v1/iam/users',
    user: (id: string) => `/api/v1/iam/users/${id}`,
    roles: '/api/v1/iam/roles',
    permissions: '/api/v1/iam/permissions',
    sessions: '/api/v1/iam/sessions',
  },
  zta: {
    trustScore: '/api/v1/zta/trust/score',
    policies: '/api/v1/zta/policies',
    evaluate: '/api/v1/zta/evaluate',
    sessions: '/api/v1/zta/sessions',
  },
  analytics: {
    dashboards: '/api/v1/analytics/dashboards',
    queries: '/api/v1/analytics/queries',
    reports: '/api/v1/analytics/reports',
    metrics: '/api/v1/analytics/metrics',
  },
  devices: {
    list: '/api/v1/devices',
    device: (id: string) => `/api/v1/devices/${id}`,
    telemetry: (id: string) => `/api/v1/devices/${id}/telemetry`,
    statsSummary: '/api/v1/devices/stats/summary',
    alerts: '/api/v1/devices/alerts',
  },
  ai: {
    predictions: '/api/v1/ai/predictions',
    models: '/api/v1/ai/models',
    explain: '/api/v1/ai/explain',
  },
  cdss: {
    dashboard: '/api/v1/cdss/dashboard',
    recommendations: '/api/v1/cdss/recommendations',
    recommendation: (id: string) => `/api/v1/cdss/recommendations/${id}`,
    approveRecommendation: (id: string) => `/api/v1/cdss/recommendations/${id}/approve`,
    rejectRecommendation: (id: string) => `/api/v1/cdss/recommendations/${id}/reject`,
    rules: '/api/v1/cdss/rules',
    rule: (id: string) => `/api/v1/cdss/rules/${id}`,
    createRule: '/api/v1/cdss/rules',
    updateRule: (id: string) => `/api/v1/cdss/rules/${id}`,
    deleteRule: (id: string) => `/api/v1/cdss/rules/${id}`,
    alerts: '/api/v1/cdss/alerts',
    alert: (id: string) => `/api/v1/cdss/alerts/${id}`,
    acknowledgeAlert: (id: string) => `/api/v1/cdss/alerts/${id}/acknowledge`,
    evaluations: '/api/v1/cdss/evaluations',
    evaluation: (id: string) => `/api/v1/cdss/evaluations/${id}`,
    evaluate: '/api/v1/cdss/evaluate',
    patientRecommendations: (patientId: string) => `/api/v1/cdss/patients/${patientId}/recommendations`,
    patientAlerts: (patientId: string) => `/api/v1/cdss/patients/${patientId}/alerts`,
    patientEvaluations: (patientId: string) => `/api/v1/cdss/patients/${patientId}/evaluations`,
  },
  compliance: {
    audits: '/api/v1/compliance/audits',
    policies: '/api/v1/compliance/policies',
    violations: '/api/v1/compliance/violations',
    reports: '/api/v1/compliance/reports',
  },
  audit: {
    logs: '/api/v1/audit/logs',
    events: '/api/v1/audit/events/recent',
    trail: (entityType: string, entityId: string) => `/api/v1/audit/trail/${entityType}/${entityId}`,
  },
  legal: {
    cases: '/api/v1/legal/cases',
    documents: '/api/v1/legal/documents',
    contracts: '/api/v1/legal/contracts',
  },
  threats: {
    dashboard: '/api/v1/threats/dashboard',
    incidents: '/api/v1/threats/incidents',
    anomalies: '/api/v1/threats/anomalies',
    vulnerabilities: '/api/v1/threats/vulnerabilities',
  },

  /* ── Gateway Integration ──────────────────────────── */
  gateway: {
    healthAll: '/api/v1/gateway/health/all',
    healthService: (name: string) => `/api/v1/gateway/health/${name}`,
    dashboardSummary: '/api/v1/gateway/dashboard/summary',
    activityRecent: '/api/v1/gateway/activity/recent',
    alerts: '/api/v1/gateway/alerts',
    acknowledgeAlert: (id: string) => `/api/v1/gateway/alerts/${id}/acknowledge`,
    serviceRegistry: '/api/v1/gateway/services/registry',
  },
} as const;
