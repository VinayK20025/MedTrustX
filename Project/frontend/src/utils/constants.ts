/**
 * MedTrustX — Application Constants
 */

/** API base URL */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/** WebSocket URL for real-time events */
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001/ws/events';

/** Keycloak configuration */
export const KEYCLOAK_CONFIG = {
  url:      process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
  realm:    process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'medtrustx',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'medtrustx-frontend',
} as const;

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

/** Debounce delays (ms) */
export const DEBOUNCE = {
  SEARCH: 300,
  INPUT: 150,
  RESIZE: 250,
  SCROLL: 100,
} as const;

/** Toast duration (ms) */
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
} as const;

/** HTTP status codes */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/** React Query stale/cache times */
export const QUERY_CONFIG = {
  STALE_TIME: 30_000,        // 30 seconds
  CACHE_TIME: 5 * 60_000,    // 5 minutes
  RETRY_COUNT: 2,
  REFETCH_INTERVAL: 60_000,  // 1 minute for dashboards
} as const;

/** Route paths */
export const ROUTES = {
  // Forensic Specialist Routes
  FORENSIC_DASHBOARD: "/dashboard/forensic",
  FORENSIC_CASES: "/dashboard/forensic/cases",
  FORENSIC_EXAM: "/dashboard/forensic/examination",
  FORENSIC_EVIDENCE: "/dashboard/forensic/evidence",
  FORENSIC_CUSTODY: "/dashboard/forensic/custody",
  FORENSIC_DOCS: "/dashboard/forensic/documents",
  FORENSIC_COURT: "/dashboard/forensic/court",

  // Blood Bank Routes
  BLOODBANK_DASHBOARD: "/dashboard/blood-bank",
  BLOODBANK_DONORS: "/dashboard/blood-bank/donors",
  BLOODBANK_COLLECTION: "/dashboard/blood-bank/collection",
  BLOODBANK_TESTING: "/dashboard/blood-bank/testing",
  BLOODBANK_INVENTORY: "/dashboard/blood-bank/inventory",
  BLOODBANK_MATCHING: "/dashboard/blood-bank/matching",
  BLOODBANK_ISSUANCE: "/dashboard/blood-bank/issuance",
  BLOODBANK_COMPLIANCE: "/dashboard/blood-bank/compliance",
  BLOODBANK_REPORTS: "/dashboard/blood-bank/reports",

  LOGIN:          '/login',
  DASHBOARD:      '/dashboard',
  PATIENTS:       '/dashboard/patients',
  CLINICAL:       '/dashboard/clinical',
  DIAGNOSTICS:    '/dashboard/diagnostics',
  PHARMACY:       '/dashboard/pharmacy',
  NURSING:        '/dashboard/nursing',
  OT:             '/dashboard/ot',
  ICU:            '/dashboard/icu',
  ER:             '/dashboard/er',
  BLOOD_BANK:     '/dashboard/blood-bank',
  INFECTION:      '/dashboard/infection-control',
  RECORDS:        '/dashboard/records',
  APPOINTMENTS:   '/dashboard/appointments',
  BILLING:        '/dashboard/billing',
  INVENTORY:      '/dashboard/inventory',
  HR:             '/dashboard/hr',
  FACILITIES:     '/dashboard/facilities',
  MANAGEMENT:     '/dashboard/management',
  MANAGEMENT_ROUTING: '/dashboard/management/routing',
  LEGAL_COMPLIANCE: '/dashboard/legal-compliance',
  LEGAL_COMPLIANCE_LICENSES: '/dashboard/legal-compliance/licenses',
  LEGAL_COMPLIANCE_REGULATIONS: '/dashboard/legal-compliance/regulations',
  LEGAL_COMPLIANCE_VIOLATIONS: '/dashboard/legal-compliance/violations',
  LEGAL_COMPLIANCE_CHECKLISTS: '/dashboard/legal-compliance/checklists',
  LEGAL_COMPLIANCE_AUDITS: '/dashboard/legal-compliance/audits',
  LEGAL_COMPLIANCE_REPORTS: '/dashboard/legal-compliance/reports',
  COMPLIANCE:     '/dashboard/compliance',
  COMPLIANCE_POLICIES: '/dashboard/compliance/policies',
  COMPLIANCE_VIOLATIONS: '/dashboard/compliance/violations',
  COMPLIANCE_DOCUMENTS: '/dashboard/compliance/documents',
  COMPLIANCE_CONSENTS: '/dashboard/compliance/consents',
  COMPLIANCE_CHECKS: '/dashboard/compliance/checks',

  // Audit Service Routes
  AUDIT: '/dashboard/audit',
  AUDIT_AUDITS: '/dashboard/audit/audits',
  // Audit Service Routes (Deprecated in favor of Internal Auditor routes)
  // AUDIT_CONTROLS: '/dashboard/audit/controls',
  // AUDIT_FINDINGS: '/dashboard/audit/findings',
  // AUDIT_CAPA: '/dashboard/audit/capa',
  // AUDIT_REPORTS: '/dashboard/audit/reports',

  ORDERS:         '/dashboard/orders',
  TELEMEDICINE:   '/dashboard/telemedicine',
  ANALYTICS:      '/dashboard/analytics',
  DEVICES:        '/dashboard/devices',
  IAM:            '/dashboard/iam',
  SECURITY:       '/dashboard/security',
  MONITORING:     '/dashboard/monitoring',
  SETTINGS:       '/dashboard/settings',
  PROFILE:        '/dashboard/profile',

  // Health Info Management / EHR
  EHR_PATIENTS:   '/dashboard/ehr/patients',
  EHR_VALIDATION: '/dashboard/ehr/validation',
  HIM_DASHBOARD:  '/dashboard/him',
  
  ACCESS_DENIED:  '/access-denied',

  // Privileged Access Management (PAM)
  PAM_DASHBOARD:    '/dashboard/pam',
  PAM_MONITORING:   '/dashboard/pam/monitoring',
  PAM_SESSIONS:     '/dashboard/pam/sessions',
  PAM_ACCESS:       '/dashboard/pam/access',
  PAM_RECORDINGS:   '/dashboard/pam/recordings',
  PAM_REQUESTS:     '/dashboard/pam/requests',
  PAM_POLICIES:     '/dashboard/pam/policies',
  PAM_ALERTS:       '/dashboard/pam/alerts',
  
  // Board/Executive Routes
  BOARD_DASHBOARD:  '/dashboard/board',
  BOARD_FINANCIAL:  '/dashboard/board/financial',
  BOARD_CLINICAL:   '/dashboard/board/clinical',
  BOARD_OPERATIONS: '/dashboard/board/operations',
  BOARD_COMPLIANCE: '/dashboard/board/compliance',
  BOARD_REPORTS:    '/dashboard/board/reports',
  BOARD_AUDIT:      '/dashboard/board/audit',
  BOARD_ACCESS:     '/dashboard/board/access',
  
  // CEO Routes
  CEO_DASHBOARD:    '/dashboard/ceo',
  CEO_OPERATIONS:   '/dashboard/ceo/operations',
  CEO_BEDS:         '/dashboard/ceo/beds',
  CEO_OT:           '/dashboard/ceo/ot',
  CEO_FINANCIAL:    '/dashboard/ceo/financial',
  CEO_CLINICAL:     '/dashboard/ceo/clinical',
  CEO_ICU:          '/dashboard/ceo/icu',
  CEO_COMPLIANCE:   '/dashboard/ceo/compliance',
  CEO_TASKS:        '/dashboard/ceo/tasks',
  CEO_ESCALATIONS:  '/dashboard/ceo/escalations',
  CEO_REPORTS:      '/dashboard/ceo/reports',

  // COO Routes
  COO_DASHBOARD:    '/dashboard/coo',
  COO_PATIENT_FLOW: '/dashboard/coo/patient-flow',
  COO_BEDS:         '/dashboard/coo/beds',
  COO_QUEUE:        '/dashboard/coo/queue',
  COO_ICU:          '/dashboard/coo/icu',
  COO_NURSING:      '/dashboard/coo/nursing',
  COO_OT:           '/dashboard/coo/ot',
  COO_STAFF:        '/dashboard/coo/staff',
  COO_EQUIPMENT:    '/dashboard/coo/equipment',
  COO_ALERTS:       '/dashboard/coo/alerts',
  COO_TASKS:        '/dashboard/coo/tasks',
  COO_ESCALATIONS:  '/dashboard/coo/escalations',
  COO_REPORTS:      '/dashboard/coo/reports',

  // CMO Routes
  CMO_DASHBOARD:    '/dashboard/cmo',
  CMO_OUTCOMES:     '/dashboard/cmo/outcomes',
  CMO_INFECTION:    '/dashboard/cmo/infection',
  CMO_MORTALITY:    '/dashboard/cmo/mortality',
  CMO_AUDIT:        '/dashboard/cmo/audit',
  CMO_COMPLIANCE:   '/dashboard/cmo/compliance',
  CMO_ICU:          '/dashboard/cmo/icu',
  CMO_DIAGNOSTICS:  '/dashboard/cmo/diagnostics',
  CMO_RISK:         '/dashboard/cmo/risk',

  // CNO Routes
  CNO_DASHBOARD:    '/dashboard/cno',
  CNO_TASKS:        '/dashboard/cno/tasks',
  CNO_CARE:         '/dashboard/cno/care',
  CNO_VITALS:       '/dashboard/cno/vitals',
  CNO_STAFFING:     '/dashboard/cno/staffing',
  CNO_SHIFTS:       '/dashboard/cno/shifts',
  CNO_ICU:          '/dashboard/cno/icu',
  CNO_ER:           '/dashboard/cno/er',
  CNO_COMPLIANCE:   '/dashboard/cno/compliance',
  CNO_ALERTS:       '/dashboard/cno/alerts',
  CNO_REPORTS:      '/dashboard/cno/reports',

  // CIO Routes
  CIO_DASHBOARD:    '/dashboard/cio',
  CIO_SERVICES:     '/dashboard/cio/services',
  CIO_INFRA:        '/dashboard/cio/infrastructure',
  CIO_DATA:         '/dashboard/cio/data',
  CIO_INTEGRATIONS: '/dashboard/cio/integrations',
  CIO_INCIDENTS:    '/dashboard/cio/incidents',
  CIO_DEPLOYMENTS:  '/dashboard/cio/deployments',
  CIO_GOVERNANCE:   '/dashboard/cio/governance',

  // CISO Routes
  CISO_DASHBOARD:   '/dashboard/ciso',
  CISO_THREATS:     '/dashboard/ciso/threats',
  CISO_ANOMALIES:   '/dashboard/ciso/anomalies',
  CISO_IAM:         '/dashboard/ciso/iam',
  CISO_LOGS:        '/dashboard/ciso/logs',
  CISO_INCIDENTS:   '/dashboard/ciso/incidents',
  CISO_COMPLIANCE:  '/dashboard/ciso/compliance',
  CISO_POLICIES:    '/dashboard/ciso/policies',
  CISO_REPORTS:     '/dashboard/ciso/reports',
  CISO_UEBA:        '/dashboard/ciso/ueba',

  // CFO Routes
  CFO_DASHBOARD:    '/dashboard/cfo',
  CFO_BILLING:      '/dashboard/cfo/billing',
  CFO_PAYMENTS:     '/dashboard/cfo/payments',
  CFO_COST:         '/dashboard/cfo/cost',
  CFO_CLAIMS:       '/dashboard/cfo/claims',
  CFO_CASHFLOW:     '/dashboard/cfo/cashflow',
  CFO_COMPLIANCE:   '/dashboard/cfo/compliance',
  CFO_REPORTS:      '/dashboard/cfo/reports',

  // CCO Routes
  CCO_DASHBOARD:    '/dashboard/cco',
  CCO_AUDITS:       '/dashboard/cco/audits',
  CCO_AUDIT_REPORTS:'/dashboard/cco/audit-reports',
  CCO_POLICIES:     '/dashboard/cco/policies',
  CCO_VIOLATIONS:   '/dashboard/cco/violations',
  CCO_ACTIONS:      '/dashboard/cco/actions',
  CCO_DOCUMENTS:    '/dashboard/cco/documents',
  CCO_MONITORING:   '/dashboard/cco/monitoring',
  CCO_REPORTS:      '/dashboard/cco/reports',

  // CTO Routes
  CTO_DASHBOARD:    '/dashboard/cto',
  CTO_ARCHITECTURE: '/dashboard/cto/architecture',
  CTO_REPOS:        '/dashboard/cto/repos',
  CTO_PIPELINES:    '/dashboard/cto/pipelines',
  CTO_PERFORMANCE:  '/dashboard/cto/performance',
  CTO_TECH_DEBT:    '/dashboard/cto/tech-debt',
  CTO_FEATURES:     '/dashboard/cto/features',
  CTO_REPORTS:      '/dashboard/cto/reports',

  // Marketing CMO Routes
  MARKETING_DASHBOARD:   '/dashboard/marketing',
  MARKETING_CAMPAIGNS:   '/dashboard/marketing/campaigns',
  MARKETING_PERFORMANCE: '/dashboard/marketing/performance',
  MARKETING_FUNNEL:      '/dashboard/marketing/funnel',
  MARKETING_CHANNELS:    '/dashboard/marketing/channels',
  MARKETING_ACQUISITION: '/dashboard/marketing/acquisition',
  MARKETING_BRAND:       '/dashboard/marketing/brand',
  MARKETING_REPORTS:     '/dashboard/marketing/reports',

  // Medical Director Routes
  MED_DIR_DASHBOARD:   '/dashboard/med-director',
  MED_DIR_DEPARTMENTS: '/dashboard/med-director/departments',
  MED_DIR_OUTCOMES:    '/dashboard/med-director/outcomes',
  MED_DIR_SAFETY:      '/dashboard/med-director/safety',
  MED_DIR_PROTOCOLS:   '/dashboard/med-director/protocols',
  MED_DIR_COMPLIANCE:  '/dashboard/med-director/compliance',
  MED_DIR_AUDITS:      '/dashboard/med-director/audits',
  MED_DIR_REPORTS:     '/dashboard/med-director/reports',

  // Medical Superintendent Routes
  SUPER_DASHBOARD:     '/dashboard/superintendent',
  SUPER_PATIENT_FLOW:  '/dashboard/superintendent/patient-flow',
  SUPER_WARDS:         '/dashboard/superintendent/wards',
  SUPER_ICU:           '/dashboard/superintendent/icu',
  SUPER_OT:            '/dashboard/superintendent/ot',
  SUPER_STAFF:         '/dashboard/superintendent/staff',
  SUPER_INCIDENTS:     '/dashboard/superintendent/incidents',
  SUPER_ALERTS:        '/dashboard/superintendent/alerts',
  SUPER_TASKS:         '/dashboard/superintendent/tasks',
  SUPER_REPORTS:       '/dashboard/superintendent/reports',

  // Deputy Medical Superintendent Routes
  DEPUTY_DASHBOARD:    '/dashboard/deputy-ms',
  DEPUTY_PATIENT_FLOW: '/dashboard/deputy-ms/patient-flow',
  DEPUTY_WARDS:        '/dashboard/deputy-ms/wards',
  DEPUTY_BEDS:         '/dashboard/deputy-ms/beds',
  DEPUTY_ICU:          '/dashboard/deputy-ms/icu',
  DEPUTY_ER:           '/dashboard/deputy-ms/er',
  DEPUTY_STAFF:        '/dashboard/deputy-ms/staff',
  DEPUTY_INCIDENTS:    '/dashboard/deputy-ms/incidents',
  DEPUTY_ALERTS:       '/dashboard/deputy-ms/alerts',
  DEPUTY_TASKS:        '/dashboard/deputy-ms/tasks',

  // Head of Department Routes
  HOD_DASHBOARD:     '/dashboard/hod',
  HOD_PATIENTS:      '/dashboard/hod/patients',
  HOD_CASES:         '/dashboard/hod/cases',
  HOD_CLINICAL:      '/dashboard/hod/clinical',
  HOD_DIAGNOSTICS:   '/dashboard/hod/diagnostics',
  HOD_SCHEDULING:    '/dashboard/hod/scheduling',
  HOD_STAFF:         '/dashboard/hod/staff',
  HOD_OUTCOMES:      '/dashboard/hod/outcomes',
  HOD_ALERTS:        '/dashboard/hod/alerts',
  HOD_REPORTS:       '/dashboard/hod/reports',

  // Clinical Director / Unit Head Routes
  UNIT_DASHBOARD:    '/dashboard/unit-head',
  UNIT_PATIENTS:     '/dashboard/unit-head/patients',
  UNIT_CRITICAL:     '/dashboard/unit-head/critical',
  UNIT_VITALS:       '/dashboard/unit-head/vitals',
  UNIT_LABS:         '/dashboard/unit-head/labs',
  UNIT_ORDERS:       '/dashboard/unit-head/orders',
  UNIT_MEDICATIONS:  '/dashboard/unit-head/medications',
  UNIT_STAFF:        '/dashboard/unit-head/staff',
  UNIT_ALERTS:       '/dashboard/unit-head/alerts',
  UNIT_REPORTS:      '/dashboard/unit-head/reports',

  // Doctor Routes
  DOC_DASHBOARD:     '/dashboard/doctor',
  DOC_PATIENTS:      '/dashboard/doctor/patients',
  DOC_PATIENT_DETAIL:'/dashboard/doctor/patient',
  DOC_CLINICAL:      '/dashboard/doctor/clinical',
  DOC_DIAGNOSTICS:   '/dashboard/doctor/diagnostics',
  DOC_ORDERS:        '/dashboard/doctor/orders',
  DOC_SCHEDULE:      '/dashboard/doctor/schedule',
  DOC_TASKS:         '/dashboard/doctor/tasks',
  DOC_REPORTS:       '/dashboard/doctor/reports',

  // General Physician (GP) Routes
  GP_DASHBOARD:      '/dashboard/gp',
  GP_QUEUE:          '/dashboard/gp/queue',
  GP_CONSULTATION:   '/dashboard/gp/consultation',
  GP_NOTES:          '/dashboard/gp/notes',
  GP_PRESCRIPTIONS:  '/dashboard/gp/prescriptions',
  GP_REFERRALS:      '/dashboard/gp/referrals',
  GP_REPORTS:        '/dashboard/gp/reports',

  // Surgeon Routes
  SURGEON_DASHBOARD: '/dashboard/surgeon',
  SURGEON_CASES:     '/dashboard/surgeon/cases',
  SURGEON_CASE_DETAIL:'/dashboard/surgeon/case',
  SURGEON_PREOP:     '/dashboard/surgeon/preop',
  SURGEON_OT:        '/dashboard/surgeon/ot',
  SURGEON_INTRAOP:   '/dashboard/surgeon/intraop',
  SURGEON_POSTOP:    '/dashboard/surgeon/postop',
  SURGEON_NOTES:     '/dashboard/surgeon/notes',
  SURGEON_REPORTS:   '/dashboard/surgeon/reports',

  // Emergency Physician (ER) Routes
  ER_DASHBOARD:      '/dashboard/er',
  ER_TRIAGE:         '/dashboard/er/triage',
  ER_PATIENTS:       '/dashboard/er/patients',
  ER_CLINICAL:       '/dashboard/er/clinical',
  ER_ORDERS:         '/dashboard/er/orders',
  ER_COORDINATION:   '/dashboard/er/coordination',
  ER_ALERTS:         '/dashboard/er/alerts',
  ER_REPORTS:        '/dashboard/er/reports',

  // Visiting Intensivist Routes
  INTENSIVIST_DASHBOARD: '/dashboard/intensivist',
  INTENSIVIST_CASES:     '/dashboard/intensivist/cases',
  INTENSIVIST_CASE_REVIEW:'/dashboard/intensivist/review',
  INTENSIVIST_VITALS:    '/dashboard/intensivist/vitals',
  INTENSIVIST_LABS:      '/dashboard/intensivist/labs',
  INTENSIVIST_INTERVENTIONS: '/dashboard/intensivist/interventions',
  INTENSIVIST_RECOMMENDATIONS: '/dashboard/intensivist/recommendations',
  INTENSIVIST_ALERTS:    '/dashboard/intensivist/alerts',
  INTENSIVIST_REPORTS:   '/dashboard/intensivist/reports',

  // Consultant Locum Doctor Routes
  LOCUM_DASHBOARD:   '/dashboard/locum',
  LOCUM_PATIENTS:    '/dashboard/locum/patients',
  LOCUM_SUMMARY:     '/dashboard/locum/summary',
  LOCUM_NOTES:       '/dashboard/locum/notes',
  LOCUM_ORDERS:      '/dashboard/locum/orders',
  LOCUM_HANDOVER:    '/dashboard/locum/handover',
  LOCUM_TASKS:       '/dashboard/locum/tasks',
  LOCUM_REPORTS:     '/dashboard/locum/reports',

  // Resident Doctor Routes
  RESIDENT_DASHBOARD:    '/dashboard/resident',
  RESIDENT_TASKS:        '/dashboard/resident/tasks',
  RESIDENT_PATIENTS:     '/dashboard/resident/patients',
  RESIDENT_PATIENT_DETAIL: '/dashboard/resident/patient-detail',
  RESIDENT_NOTES:        '/dashboard/resident/notes',
  RESIDENT_ORDERS:       '/dashboard/resident/orders',
  RESIDENT_ROUNDS:       '/dashboard/resident/rounds',
  RESIDENT_ALERTS:       '/dashboard/resident/alerts',
  RESIDENT_REPORTS:      '/dashboard/resident/reports',

  // Junior Resident (JR) Routes
  JR_DASHBOARD:          '/dashboard/jr',
  JR_TASKS:              '/dashboard/jr/tasks',
  JR_PATIENTS:           '/dashboard/jr/patients',
  JR_TASK_EXECUTION:     '/dashboard/jr/task-execution',
  JR_NOTES:              '/dashboard/jr/notes',
  JR_ROUNDS:             '/dashboard/jr/rounds',
  JR_LEARNING:           '/dashboard/jr/learning',
  JR_ALERTS:             '/dashboard/jr/alerts',
  JR_REPORTS:            '/dashboard/jr/reports',

  // Senior Resident (SR) Routes
  SR_DASHBOARD:          '/dashboard/sr',
  SR_PATIENTS:           '/dashboard/sr/patients',
  SR_TASKS:              '/dashboard/sr/tasks',
  SR_TEAM:               '/dashboard/sr/team',
  SR_PATIENT_DETAIL:     '/dashboard/sr/patient-detail',
  SR_NOTES:              '/dashboard/sr/notes',
  SR_ORDERS:             '/dashboard/sr/orders',
  SR_ROUNDS:             '/dashboard/sr/rounds',
  SR_ALERTS:             '/dashboard/sr/alerts',
  SR_REPORTS:            '/dashboard/sr/reports',

  // Medical Intern Routes
  INTERN_DASHBOARD:      '/dashboard/intern',
  INTERN_PATIENTS:       '/dashboard/intern/patients',
  INTERN_TASKS:          '/dashboard/intern/tasks',
  INTERN_NOTES:          '/dashboard/intern/notes',
  INTERN_ROUNDS:         '/dashboard/intern/rounds',
  INTERN_LEARNING:       '/dashboard/intern/learning',
  INTERN_FEEDBACK:       '/dashboard/intern/feedback',
  INTERN_REPORTS:        '/dashboard/intern/reports',

  // Medical Student Routes
  STUDENT_DASHBOARD:     '/dashboard/student',
  STUDENT_CASES:         '/dashboard/student/cases',
  STUDENT_CASE_VIEW:     '/dashboard/student/case-view',
  STUDENT_NOTES:         '/dashboard/student/notes',
  STUDENT_ACADEMIC:      '/dashboard/student/academic',
  STUDENT_DISCUSSION:    '/dashboard/student/discussion',
  STUDENT_ASSESSMENT:    '/dashboard/student/assessment',
  STUDENT_FEEDBACK:      '/dashboard/student/feedback',
  STUDENT_REPORTS:       '/dashboard/student/reports',

  // Nursing Superintendent Routes
  NURSING_SUP_DASHBOARD:  '/dashboard/nursing-superintendent',
  NURSING_SUP_STAFF:      '/dashboard/nursing-superintendent/staff',
  NURSING_SUP_SHIFTS:     '/dashboard/nursing-superintendent/shifts',
  NURSING_SUP_WARDS:      '/dashboard/nursing-superintendent/wards',
  NURSING_SUP_ALLOCATION: '/dashboard/nursing-superintendent/allocation',
  NURSING_SUP_CARE:       '/dashboard/nursing-superintendent/care',
  NURSING_SUP_INCIDENTS:  '/dashboard/nursing-superintendent/incidents',
  NURSING_SUP_ALERTS:     '/dashboard/nursing-superintendent/alerts',
  NURSING_SUP_REPORTS:    '/dashboard/nursing-superintendent/reports',

  // Deputy Nursing Superintendent Routes
  DEPUTY_NURSING_DASHBOARD:       '/dashboard/deputy-nursing',
  DEPUTY_NURSING_STAFF:           '/dashboard/deputy-nursing/staff',
  DEPUTY_NURSING_SHIFTS:          '/dashboard/deputy-nursing/shifts',
  DEPUTY_NURSING_WARDS:           '/dashboard/deputy-nursing/wards',
  DEPUTY_NURSING_GAPS:            '/dashboard/deputy-nursing/gaps',
  DEPUTY_NURSING_TASKS:           '/dashboard/deputy-nursing/tasks',
  DEPUTY_NURSING_INCIDENTS:       '/dashboard/deputy-nursing/incidents',
  DEPUTY_NURSING_ALERTS:          '/dashboard/deputy-nursing/alerts',
  DEPUTY_NURSING_REPORTS:         '/dashboard/deputy-nursing/reports',

  // Ward In-Charge Routes
  WARD_DASHBOARD:         '/dashboard/ward-incharge',
  WARD_PATIENTS:          '/dashboard/ward-incharge/patients',
  WARD_STAFF:             '/dashboard/ward-incharge/staff',
  WARD_TASKS:             '/dashboard/ward-incharge/tasks',
  WARD_CARE:              '/dashboard/ward-incharge/care',
  WARD_ROUNDS:            '/dashboard/ward-incharge/rounds',
  WARD_INCIDENTS:         '/dashboard/ward-incharge/incidents',
  WARD_ALERTS:            '/dashboard/ward-incharge/alerts',
  WARD_REPORTS:           '/dashboard/ward-incharge/reports',

  // Staff Nurse Routes
  NURSE_DASHBOARD:        '/dashboard/nurse',
  NURSE_TASKS:            '/dashboard/nurse/tasks',
  NURSE_PATIENTS:         '/dashboard/nurse/patients',
  NURSE_PATIENT_DETAIL:   '/dashboard/nurse/patient-detail',
  NURSE_MEDICATION:       '/dashboard/nurse/medication',
  NURSE_VITALS:           '/dashboard/nurse/vitals',
  NURSE_PROCEDURES:       '/dashboard/nurse/procedures',
  NURSE_ROUNDS:           '/dashboard/nurse/rounds',
  NURSE_ALERTS:           '/dashboard/nurse/alerts',
  NURSE_REPORTS:          '/dashboard/nurse/reports',

  // ICU Nurse Routes
  ICU_NURSE_DASHBOARD:    '/dashboard/icu-nurse',
  ICU_NURSE_PATIENTS:     '/dashboard/icu-nurse/patients',
  ICU_NURSE_DETAIL:       '/dashboard/icu-nurse/patient-detail',
  ICU_NURSE_VITALS:       '/dashboard/icu-nurse/vitals',
  ICU_NURSE_CARE:         '/dashboard/icu-nurse/care',
  ICU_NURSE_TASKS:        '/dashboard/icu-nurse/tasks',
  ICU_NURSE_ALERTS:       '/dashboard/icu-nurse/alerts',
  ICU_NURSE_REPORTS:      '/dashboard/icu-nurse/reports',

  // ER Nurse Routes
  ER_NURSE_DASHBOARD:     '/dashboard/er-nurse',
  ER_NURSE_TRIAGE:        '/dashboard/er-nurse/triage',
  ER_NURSE_PATIENTS:      '/dashboard/er-nurse/patients',
  ER_NURSE_CARE:          '/dashboard/er-nurse/care',
  ER_NURSE_TASKS:         '/dashboard/er-nurse/tasks',
  ER_NURSE_TRANSFER:      '/dashboard/er-nurse/transfer',
  ER_NURSE_ALERTS:        '/dashboard/er-nurse/alerts',
  ER_NURSE_REPORTS:       '/dashboard/er-nurse/reports',

  // OT Nurse Routes
  OT_NURSE_DASHBOARD:     '/dashboard/ot-nurse',
  OT_NURSE_SCHEDULE:      '/dashboard/ot-nurse/schedule',
  OT_NURSE_ACTIVE:        '/dashboard/ot-nurse/active-surgery',
  OT_NURSE_PREOP:         '/dashboard/ot-nurse/preop',
  OT_NURSE_INTRAOP:       '/dashboard/ot-nurse/intraop',
  OT_NURSE_POSTOP:        '/dashboard/ot-nurse/postop',
  OT_NURSE_ALERTS:        '/dashboard/ot-nurse/alerts',
  OT_NURSE_REPORTS:       '/dashboard/ot-nurse/reports',

  // Triage Nurse Routes
  TRIAGE_NURSE_DASHBOARD: '/dashboard/triage-nurse',
  TRIAGE_NURSE_QUEUE:     '/dashboard/triage-nurse/queue',
  TRIAGE_NURSE_INTAKE:    '/dashboard/triage-nurse/intake',
  TRIAGE_NURSE_ASSESS:    '/dashboard/triage-nurse/assessment',
  TRIAGE_NURSE_ROUTING:   '/dashboard/triage-nurse/routing',
  TRIAGE_NURSE_ALERTS:    '/dashboard/triage-nurse/alerts',
  TRIAGE_NURSE_REPORTS:   '/dashboard/triage-nurse/reports',

  // ICN Routes
  ICN_DASHBOARD:          '/dashboard/icn',
  ICN_CASES:              '/dashboard/icn/cases',
  ICN_TRACKING:           '/dashboard/icn/tracking',
  ICN_ANALYTICS:          '/dashboard/icn/analytics',
  ICN_COMPLIANCE:         '/dashboard/icn/compliance',
  ICN_INVESTIGATION:      '/dashboard/icn/investigation',
  ICN_ALERTS:             '/dashboard/icn/alerts',
  ICN_REPORTS:            '/dashboard/icn/reports',

  // Nursing Assistant Routes
  ASSISTANT_DASHBOARD:    '/dashboard/assistant',
  ASSISTANT_TASKS:        '/dashboard/assistant/tasks',
  ASSISTANT_PATIENTS:     '/dashboard/assistant/patients',
  ASSISTANT_EXECUTION:    '/dashboard/assistant/task-execution',
  ASSISTANT_CARE:         '/dashboard/assistant/care',
  ASSISTANT_ALERTS:       '/dashboard/assistant/alerts',
  ASSISTANT_REPORTS:      '/dashboard/assistant/reports',

  // ANM Routes
  ANM_DASHBOARD:          '/dashboard/anm',
  ANM_PATIENTS:           '/dashboard/anm/patients',
  ANM_PATIENT_DETAIL:     '/dashboard/anm/patient-detail',
  ANM_VISITS:             '/dashboard/anm/visits',
  ANM_MATERNAL:           '/dashboard/anm/maternal',
  ANM_CHILD:              '/dashboard/anm/child',
  ANM_SCHEDULE:           '/dashboard/anm/schedule',
  ANM_ALERTS:             '/dashboard/anm/alerts',
  ANM_REPORTS:            '/dashboard/anm/reports',

  // SRE Routes
  SRE_DASHBOARD:          '/dashboard/sre',
  SRE_APPLICATIONS:       '/dashboard/sre/applications',
  SRE_METRICS:            '/dashboard/sre/metrics',
  SRE_LOGS:               '/dashboard/sre/logs',
  SRE_TRACES:             '/dashboard/sre/traces',
  SRE_INCIDENTS_ACTIVE:   '/dashboard/sre/incidents/active',
  SRE_INCIDENTS_HISTORY:  '/dashboard/sre/incidents/history',
  SRE_SLO_TARGETS:        '/dashboard/sre/slo-targets',
  SRE_NOTIFICATIONS:      '/dashboard/sre/notifications',
  SRE_RUNBOOKS:           '/dashboard/sre/runbooks',
  SRE_REPORTS:            '/dashboard/sre/reports',

  // IT Operations Manager Routes
  ITOPS_DASHBOARD:        '/dashboard/it-ops',
  IT_USERS:               '/dashboard/it/users',
  ITOPS_SERVICES:         '/dashboard/it-ops/services',
  ITOPS_TARGETS:          '/dashboard/it-ops/targets',
  ITOPS_INCIDENTS_ACTIVE: '/dashboard/it-ops/incidents/active',
  ITOPS_ESCALATIONS:      '/dashboard/it-ops/escalations',
  ITOPS_METRICS:          '/dashboard/it-ops/metrics',
  ITOPS_NOTIFICATIONS:    '/dashboard/it-ops/notifications',
  ITOPS_ASSIGNMENTS:      '/dashboard/it-ops/assignments',
  ITOPS_REPORTS:          '/dashboard/it-ops/reports',

  // Super Administrator Routes
  SUPER_ADMIN_DASHBOARD:  '/dashboard/super-admin',
  SUPER_ADMIN_TENANTS:    '/dashboard/super-admin/tenants',
  SUPER_ADMIN_POLICIES:   '/dashboard/super-admin/policies',
  SUPER_ADMIN_USERS:      '/dashboard/super-admin/users',
  SUPER_ADMIN_OVERRIDES:  '/dashboard/super-admin/overrides',
  SUPER_ADMIN_MONITORING: '/dashboard/super-admin/monitoring',
  SUPER_ADMIN_AUDIT:      '/dashboard/super-admin/audit',
  SUPER_ADMIN_ALERTS:     '/dashboard/super-admin/alerts',

  // Blood Bank Technician Routes
  BLOOD_TECH_DASHBOARD:  '/dashboard/blood-bank-tech',
  BLOOD_TECH_COLLECTION: '/dashboard/blood-bank-tech/collection',
  BLOOD_TECH_TESTING:    '/dashboard/blood-bank-tech/testing',
  BLOOD_TECH_MATCHING:   '/dashboard/blood-bank-tech/matching',
  BLOOD_TECH_STORAGE:    '/dashboard/blood-bank-tech/storage',
  BLOOD_TECH_ISSUANCE:   '/dashboard/blood-bank-tech/issuance',
  BLOOD_TECH_REPORTS:    '/dashboard/blood-bank-tech/reports',

  // Pain Management Specialist Routes
  PAIN_DASHBOARD:    '/dashboard/pain-management',
  PAIN_PATIENTS:     '/dashboard/pain-management/patients',
  PAIN_ASSESSMENT:   '/dashboard/pain-management/assessment',
  PAIN_TREATMENT:    '/dashboard/pain-management/treatment',
  PAIN_PROCEDURES:   '/dashboard/pain-management/procedures',
  PAIN_MONITORING:   '/dashboard/pain-management/monitoring',
  PAIN_REPORTS:      '/dashboard/pain-management/reports',

  // Genetic Counselor Routes
  GENETIC_DASHBOARD:  '/dashboard/genetic-counselor',
  GENETIC_CASES:      '/dashboard/genetic-counselor/cases',
  GENETIC_FAMILY:     '/dashboard/genetic-counselor/family-history',
  GENETIC_RISK:       '/dashboard/genetic-counselor/risk',
  GENETIC_RESULTS:    '/dashboard/genetic-counselor/results',
  GENETIC_SESSIONS:   '/dashboard/genetic-counselor/sessions',
  GENETIC_DECISIONS:  '/dashboard/genetic-counselor/decisions',
  GENETIC_PROFILES:   '/dashboard/genetic-counselor/profiles',

  // InfoSec Compliance Officer Routes
  INFOSEC_DASHBOARD:  '/dashboard/infosec-compliance',
  INFOSEC_STANDARDS:  '/dashboard/infosec-compliance/standards',
  INFOSEC_CONTROLS:   '/dashboard/infosec-compliance/controls',
  INFOSEC_AUDITS:     '/dashboard/infosec-compliance/audits',
  INFOSEC_RISKS:      '/dashboard/infosec-compliance/risks',
  INFOSEC_INCIDENTS:  '/dashboard/infosec-compliance/incidents',
  INFOSEC_EVIDENCE:   '/dashboard/infosec-compliance/evidence',
  INFOSEC_REPORTS:    '/dashboard/infosec-compliance/reports',

  // InfoSec Risk Manager Routes
  RISK_DASHBOARD:  '/dashboard/infosec-risk',
  RISK_REGISTER:   '/dashboard/infosec-risk/register',
  RISK_ASSESSMENT: '/dashboard/infosec-risk/assessment',
  RISK_ACTIONS:    '/dashboard/infosec-risk/actions',
  RISK_SYSTEMS:    '/dashboard/infosec-risk/systems',
  RISK_EVENTS:     '/dashboard/infosec-risk/events',
  RISK_REPORTS:    '/dashboard/infosec-risk/reports',

  // Data Protection Officer (DPO) Routes
  DPO_DASHBOARD:   '/dashboard/dpo',
  DPO_PROCESSING:  '/dashboard/dpo/processing',
  DPO_CONSENT:     '/dashboard/dpo/consent',
  DPO_REQUESTS:    '/dashboard/dpo/requests',
  DPO_BREACHES:    '/dashboard/dpo/breaches',
  DPO_DPIA:        '/dashboard/dpo/dpia',
  DPO_REPORTS:     '/dashboard/dpo/reports',

  // Internal Auditor Routes
  AUDIT_DASHBOARD: '/dashboard/internal-auditor',
  AUDIT_CONTROLS:  '/dashboard/internal-auditor/controls',
  AUDIT_ACTIVE:    '/dashboard/internal-auditor/audits',
  AUDIT_MAPPING:   '/dashboard/internal-auditor/mapping',
  AUDIT_FINDINGS:  '/dashboard/internal-auditor/findings',
  AUDIT_CAPA:      '/dashboard/internal-auditor/capa',
  AUDIT_EVIDENCE:  '/dashboard/internal-auditor/evidence',
  AUDIT_REPORTS:   '/dashboard/internal-auditor/reports',

  // DevOps Engineer Routes
  DEVOPS_DASHBOARD:    '/dashboard/devops',
  DEVOPS_PIPELINES:    '/dashboard/devops/pipelines',
  DEVOPS_DEPLOYMENTS:  '/dashboard/devops/deployments',
  DEVOPS_ENVIRONMENTS: '/dashboard/devops/environments',
  DEVOPS_IAC:          '/dashboard/devops/iac',
  DEVOPS_LOGS:         '/dashboard/devops/logs',
  DEVOPS_METRICS:      '/dashboard/devops/metrics',
  DEVOPS_INCIDENTS:    '/dashboard/devops/incidents',
  DEVOPS_COMPLIANCE:   '/dashboard/devops/compliance',
  DEVOPS_REPORTS:      '/dashboard/devops/reports',

  // DevSecOps Engineer Routes
  DEVSECOPS_DASHBOARD:      '/dashboard/devsecops',
  DEVSECOPS_PIPELINES:      '/dashboard/devsecops/pipelines',
  DEVSECOPS_SAST:           '/dashboard/devsecops/sast',
  DEVSECOPS_DAST:           '/dashboard/devsecops/dast',
  DEVSECOPS_SCA:            '/dashboard/devsecops/sca',
  DEVSECOPS_VULNERABILITIES: '/dashboard/devsecops/vulnerabilities',
  DEVSECOPS_POLICIES:       '/dashboard/devsecops/policies',
  DEVSECOPS_COMPLIANCE:     '/dashboard/devsecops/compliance',
  DEVSECOPS_INCIDENTS:      '/dashboard/devsecops/incidents',
  DEVSECOPS_REPORTS:        '/dashboard/devsecops/reports',

  // Software Developer Routes
  SOFTDEV_DASHBOARD:    '/dashboard/software-developer',
  SOFTDEV_SERVICES:     '/dashboard/software-developer/services',
  SOFTDEV_ENDPOINTS:    '/dashboard/software-developer/endpoints',
  SOFTDEV_REPOSITORIES: '/dashboard/software-developer/repositories',
  SOFTDEV_TESTS:        '/dashboard/software-developer/tests',
  SOFTDEV_SECURITY:     '/dashboard/software-developer/security',
  SOFTDEV_BUILDS:       '/dashboard/software-developer/builds',
  SOFTDEV_REPORTS:      '/dashboard/software-developer/reports',

  // Integration Engineer HL7/FHIR Routes
  INTEGRATION_DASHBOARD: '/dashboard/integration-engineer',
  INTEGRATION_INTERFACES: '/dashboard/integration-engineer/interfaces',
  INTEGRATION_MESSAGES:  '/dashboard/integration-engineer/messages',
  INTEGRATION_MAPPING:   '/dashboard/integration-engineer/mapping',
  INTEGRATION_ROUTING:   '/dashboard/integration-engineer/routing',
  INTEGRATION_FHIR:      '/dashboard/integration-engineer/fhir',
  INTEGRATION_ERRORS:    '/dashboard/integration-engineer/errors',
  INTEGRATION_LOGS:      '/dashboard/integration-engineer/logs',
  INTEGRATION_REPORTS:   '/dashboard/integration-engineer/reports',

  // API Gateway Manager Routes
  APIGATEWAY_DASHBOARD: '/dashboard/api-gateway',
  APIGATEWAY_REGISTRY:  '/dashboard/api-gateway/registry',
  APIGATEWAY_TRAFFIC:   '/dashboard/api-gateway/traffic',
  APIGATEWAY_SECURITY:  '/dashboard/api-gateway/security',
  APIGATEWAY_POLICIES:  '/dashboard/api-gateway/policies',
  APIGATEWAY_ROUTING:   '/dashboard/api-gateway/routing',
  APIGATEWAY_ANALYTICS: '/dashboard/api-gateway/analytics',
  APIGATEWAY_ALERTS:    '/dashboard/api-gateway/alerts',
  APIGATEWAY_REPORTS:   '/dashboard/api-gateway/reports',

  // QA / Test Engineer Routes
  QA_DASHBOARD:  '/dashboard/qa-engineer',
  QA_SUITES:     '/dashboard/qa-engineer/suites',
  QA_CASES:      '/dashboard/qa-engineer/cases',
  QA_RUNS:       '/dashboard/qa-engineer/runs',
  QA_BUGS:       '/dashboard/qa-engineer/bugs',
  QA_AUTOMATION: '/dashboard/qa-engineer/automation',
  QA_SECURITY:   '/dashboard/qa-engineer/security',
  QA_REPORTS:    '/dashboard/qa-engineer/reports',

  // Data Engineer Routes
  DATAENG_DASHBOARD: '/dashboard/data-engineer',
  DATAENG_ETL:       '/dashboard/data-engineer/etl',
  DATAENG_STREAMS:   '/dashboard/data-engineer/streams',
  DATAENG_SOURCES:   '/dashboard/data-engineer/sources',
  DATAENG_QUALITY:   '/dashboard/data-engineer/quality',
  DATAENG_SECURITY:  '/dashboard/data-engineer/security',
  DATAENG_LOGS:      '/dashboard/data-engineer/logs',
  DATAENG_ALERTS:    '/dashboard/data-engineer/alerts',
  DATAENG_REPORTS:   '/dashboard/data-engineer/reports',

  // Data Analyst Routes
  ANALYST_DASHBOARD:  '/dashboard/data-analyst',
  ANALYST_SOURCES:    '/dashboard/data-analyst/sources',
  ANALYST_QUERIES:    '/dashboard/data-analyst/queries',
  ANALYST_DASHBOARDS: '/dashboard/data-analyst/dashboards',
  ANALYST_REPORTS:    '/dashboard/data-analyst/reports',
  ANALYST_INSIGHTS:   '/dashboard/data-analyst/insights',
  ANALYST_FILTERS:    '/dashboard/data-analyst/filters',

  // AI / ML Engineer Routes
  ML_DASHBOARD:   '/dashboard/ml-engineer',
  ML_REGISTRY:    '/dashboard/ml-engineer/registry',
  ML_DATASETS:    '/dashboard/ml-engineer/datasets',
  ML_EXPERIMENTS: '/dashboard/ml-engineer/experiments',
  ML_TRAINING:    '/dashboard/ml-engineer/training',
  ML_INFERENCE:   '/dashboard/ml-engineer/inference',
  ML_MONITORING:  '/dashboard/ml-engineer/monitoring',
  ML_ALERTS:      '/dashboard/ml-engineer/alerts',
  ML_REPORTS:     '/dashboard/ml-engineer/reports',

  // Clinical Informaticist Routes
  INFORMATICIST_DASHBOARD: '/dashboard/clinical-informaticist',
  INFORMATICIST_WORKFLOWS: '/dashboard/clinical-informaticist/workflows',
  INFORMATICIST_CDSS:      '/dashboard/clinical-informaticist/cdss',
  INFORMATICIST_STANDARDS: '/dashboard/clinical-informaticist/standardization',
  INFORMATICIST_QUALITY:   '/dashboard/clinical-informaticist/quality',
  INFORMATICIST_UX:        '/dashboard/clinical-informaticist/ux-analytics',
  INFORMATICIST_ALERTS:    '/dashboard/clinical-informaticist/alerts',

  // Health Data Scientist Routes
  DATASCI_DASHBOARD:  '/dashboard/health-data-scientist',
  DATASCI_EXPLORER:   '/dashboard/health-data-scientist/explorer',
  DATASCI_MODELS:     '/dashboard/health-data-scientist/models',
  DATASCI_FEATURES:   '/dashboard/health-data-scientist/features',
  DATASCI_PREDICTIONS:'/dashboard/health-data-scientist/predictions',
  DATASCI_POPULATION: '/dashboard/health-data-scientist/population',
  DATASCI_REPORTS:    '/dashboard/health-data-scientist/reports',

  // AI Ethics Specialist Routes
  ETHICS_DASHBOARD_OLD:      '/dashboard/ai-ethics-specialist',
  ETHICS_REGISTRY:       '/dashboard/ai-ethics-specialist/registry',
  ETHICS_BIAS:           '/dashboard/ai-ethics-specialist/bias',
  ETHICS_EXPLAINABILITY: '/dashboard/ai-ethics-specialist/explainability',
  ETHICS_RISK:           '/dashboard/ai-ethics-specialist/risk',
  ETHICS_COMPLIANCE:     '/dashboard/ai-ethics-specialist/compliance',
  ETHICS_ALERTS:         '/dashboard/ai-ethics-specialist/alerts',

  // AI Governance Officer Routes
  GOV_DASHBOARD:      '/dashboard/ai-governance-officer',
  GOV_REGISTRY:       '/dashboard/ai-governance-officer/registry',
  GOV_APPROVALS:      '/dashboard/ai-governance-officer/approvals',
  GOV_ETHICS:         '/dashboard/ai-governance-officer/ethics',
  GOV_COMPLIANCE:     '/dashboard/ai-governance-officer/compliance',
  GOV_RISK:           '/dashboard/ai-governance-officer/risk',
  GOV_MONITORING:     '/dashboard/ai-governance-officer/monitoring',
  GOV_AUDITS:         '/dashboard/ai-governance-officer/audits',
  GOV_REPORTS:        '/dashboard/ai-governance-officer/reports',

  // IoMT Device Management Routes
  IOMT_DASHBOARD:      '/dashboard/iomt-device',
  IOMT_REGISTRY:       '/dashboard/iomt-device/registry',
  IOMT_STREAM:         '/dashboard/iomt-device/stream',
  IOMT_AUTH:           '/dashboard/iomt-device/auth',
  IOMT_VALIDATION:     '/dashboard/iomt-device/validation',
  IOMT_SECURITY:       '/dashboard/iomt-device/security',
  IOMT_ALERTS:         '/dashboard/iomt-device/alerts',
  IOMT_REPORTS:        '/dashboard/iomt-device/reports',

  // Service Accounts Routes
  SA_DASHBOARD:      '/dashboard/service-accounts',
  SA_IDENTITIES:     '/dashboard/service-accounts/identities',
  SA_KEYS:           '/dashboard/service-accounts/keys',
  SA_TOKENS:         '/dashboard/service-accounts/tokens',
  SA_ROLES:          '/dashboard/service-accounts/roles',
  SA_POLICIES:       '/dashboard/service-accounts/policies',
  SA_API_CALLS:      '/dashboard/service-accounts/api-calls',
  SA_SECRETS:        '/dashboard/service-accounts/secrets',
  SA_ALERTS:         '/dashboard/service-accounts/alerts',
  SA_REPORTS:        '/dashboard/service-accounts/reports',

  // Automation Bots Routes
  AUTO_DASHBOARD:    '/dashboard/automation-bots',
  AUTO_AGENTS:       '/dashboard/automation-bots/agents',
  AUTO_JOBS:         '/dashboard/automation-bots/jobs',
  AUTO_METRICS:      '/dashboard/automation-bots/metrics',
  AUTO_LOGS:         '/dashboard/automation-bots/logs',
  AUTO_WORKFLOWS:    '/dashboard/automation-bots/workflows',
  AUTO_EVENTS:       '/dashboard/automation-bots/events',
  AUTO_REMEDIATION:  '/dashboard/automation-bots/remediation',
  AUTO_REPORTS:      '/dashboard/automation-bots/reports',

  // SOC Analyst Routes
  SOC_DASHBOARD:     '/dashboard/soc-analyst',
  SOC_ALERTS:        '/dashboard/soc-analyst/alerts',
  SOC_ACTIVE:        '/dashboard/soc-analyst/active-incidents',
  SOC_HISTORY:       '/dashboard/soc-analyst/history',
  SOC_LOGS:          '/dashboard/soc-analyst/logs',
  SOC_EVENTS:        '/dashboard/soc-analyst/events',
  SOC_INDICATORS:    '/dashboard/soc-analyst/indicators',
  SOC_PLAYBOOKS:     '/dashboard/soc-analyst/playbooks',
  SOC_REPORTS:       '/dashboard/soc-analyst/reports',

  // Incident Responder Routes
  IR_DASHBOARD:      '/dashboard/incident-responder',
  IR_INCIDENTS:      '/dashboard/incident-responder/incidents',
  IR_RESPONSE:       '/dashboard/incident-responder/response',
  IR_CONTAINMENT:    '/dashboard/incident-responder/containment',
  IR_RECOVERY:       '/dashboard/incident-responder/recovery',
  IR_FORENSICS:      '/dashboard/incident-responder/forensics',
  IR_PLAYBOOKS:      '/dashboard/incident-responder/playbooks',
  IR_ALERTS:         '/dashboard/incident-responder/alerts',
  IR_REPORTS:        '/dashboard/incident-responder/reports',

  // Security Engineer Routes
  SE_DASHBOARD:      '/dashboard/security-engineer',
  SE_RULES:          '/dashboard/security-engineer/rules',
  SE_EDR:            '/dashboard/security-engineer/edr-xdr',
  SE_ZTA:            '/dashboard/security-engineer/policies',
  SE_IDS:            '/dashboard/security-engineer/ids-ips',
  SE_HARDENING:      '/dashboard/security-engineer/hardening',
  SE_EVENTS:         '/dashboard/security-engineer/events',
  SE_INCIDENTS:      '/dashboard/security-engineer/incidents',
  SE_REPORTS:        '/dashboard/security-engineer/reports',

  // Threat Intelligence Routes
  TI_DASHBOARD:      '/dashboard/threat-intel',
  TI_INDICATORS:     '/dashboard/threat-intel/indicators',
  TI_CAMPAIGNS:      '/dashboard/threat-intel/campaigns',
  TI_FEEDS:          '/dashboard/threat-intel/feeds',
  TI_CORRELATION:    '/dashboard/threat-intel/correlation',
  TI_RULES:          '/dashboard/threat-intel/rules',
  TI_REPORTS:        '/dashboard/threat-intel/reports',
  // Strategic Planning Routes
  STRATEGY_DASHBOARD:  '/dashboard/strategic-planning',
  STRATEGY_PLANS:      '/dashboard/strategic-planning/plans',
  STRATEGY_OBJECTIVES: '/dashboard/strategic-planning/objectives',
  STRATEGY_INITIATIVES:'/dashboard/strategic-planning/initiatives',
  STRATEGY_FORECASTS:  '/dashboard/strategic-planning/forecasts',
  // Enterprise Risk Oversight Routes
  RISK_OVERSIGHT_DASHBOARD:   '/dashboard/enterprise-risk',
  RISK_OVERSIGHT_REGISTER:    '/dashboard/enterprise-risk/register',
  RISK_OVERSIGHT_ASSESSMENTS: '/dashboard/enterprise-risk/assessments',
  RISK_OVERSIGHT_MITIGATION:  '/dashboard/enterprise-risk/mitigation',
  RISK_OVERSIGHT_EVENTS:      '/dashboard/enterprise-risk/events',
  // Board Reporting Service Routes
  BOARD_REPORTING_DASHBOARD:   '/dashboard/board-reporting',
  BOARD_REPORTING_REPORTS:     '/dashboard/board-reporting/reports',
  BOARD_REPORTING_SECTIONS:    '/dashboard/board-reporting/sections',
  BOARD_REPORTING_SCHEDULES:   '/dashboard/board-reporting/schedules',
  BOARD_REPORTING_DISTRIBUTION:'/dashboard/board-reporting/distribution',
  // Performance Intelligence Service Routes
  PERFORMANCE_DASHBOARD_OLD:    '/dashboard/performance-intelligence',
  PERFORMANCE_METRICS:      '/dashboard/performance-intelligence/metrics',
  PERFORMANCE_BENCHMARKS:   '/dashboard/performance-intelligence/benchmarks',
  PERFORMANCE_SCORES:       '/dashboard/performance-intelligence/scores',
  PERFORMANCE_INSIGHTS:     '/dashboard/performance-intelligence/insights',
  // Legal Risk Analytics Service Routes
  LEGAL_RISK_DASHBOARD:    '/dashboard/legal-risk-analytics',
  LEGAL_RISK_SCORES:       '/dashboard/legal-risk-analytics/scores',
  LEGAL_RISK_FACTORS:      '/dashboard/legal-risk-analytics/factors',
  LEGAL_RISK_TRENDS:       '/dashboard/legal-risk-analytics/trends',
  LEGAL_RISK_PREDICTIONS:  '/dashboard/legal-risk-analytics/predictions',
  // Litigation Tracking Service Routes
  LITIGATION_DASHBOARD:    '/dashboard/litigation-tracking',
  LITIGATION_CASES:        '/dashboard/litigation-tracking/cases',
  LITIGATION_HEARINGS:     '/dashboard/litigation-tracking/hearings',
  LITIGATION_PARTIES:      '/dashboard/litigation-tracking/parties',
  LITIGATION_UPDATES:      '/dashboard/litigation-tracking/updates',
  // Evidence Management Service Routes
  EVIDENCE_DASHBOARD:     '/dashboard/evidence-management',
  EVIDENCE_ITEMS:         '/dashboard/evidence-management/items',
  EVIDENCE_CUSTODY:       '/dashboard/evidence-management/custody',
  EVIDENCE_METADATA:      '/dashboard/evidence-management/metadata',
  EVIDENCE_ACCESS_LOG:    '/dashboard/evidence-management/access-log',
  // Legal Case Management Service Routes
  LEGAL_CASE_DASHBOARD:    '/dashboard/legal-case-management',
  LEGAL_CASE_CASES:        '/dashboard/legal-case-management/cases',
  LEGAL_CASE_DOCUMENTS:    '/dashboard/legal-case-management/documents',
  LEGAL_CASE_TASKS:        '/dashboard/legal-case-management/tasks',
  LEGAL_CASE_COMPLIANCE:   '/dashboard/legal-case-management/compliance',
  // Edge Connectivity Manager Service Routes
  EDGE_DASHBOARD:       '/dashboard/edge-connectivity',
  EDGE_NODES:           '/dashboard/edge-connectivity/nodes',
  EDGE_SESSIONS:        '/dashboard/edge-connectivity/sessions',
  EDGE_LINK_METRICS:    '/dashboard/edge-connectivity/link-metrics',
  EDGE_SYNC_LOGS:       '/dashboard/edge-connectivity/sync-logs',
  // Network Observability Service Routes
  NET_OBS_DASHBOARD:      '/dashboard/network-observability',
  NET_OBS_FLOWS:          '/dashboard/network-observability/flows',
  NET_OBS_TRAFFIC:        '/dashboard/network-observability/traffic',
  NET_OBS_DEPENDENCIES:   '/dashboard/network-observability/dependencies',
  NET_OBS_ANOMALIES:      '/dashboard/network-observability/anomalies',
  // Zero Trust Network Control Service Routes
  ZT_NETWORK_DASHBOARD:    '/dashboard/zero-trust-network',
  ZT_NETWORK_POLICIES:     '/dashboard/zero-trust-network/policies',
  ZT_NETWORK_SESSIONS:     '/dashboard/zero-trust-network/sessions',
  ZT_NETWORK_POSTURE:      '/dashboard/zero-trust-network/posture',
  ZT_NETWORK_DECISIONS:    '/dashboard/zero-trust-network/decisions',
  ZT_NETWORK_STEP_CA:      '/dashboard/zero-trust-network/step-ca',
  // Network Management Service Routes
  NET_MGMT_DASHBOARD:     '/dashboard/network-management',
  NET_MGMT_DEVICES:       '/dashboard/network-management/devices',
  NET_MGMT_METRICS:       '/dashboard/network-management/metrics',
  NET_MGMT_TOPOLOGY:      '/dashboard/network-management/topology',
  NET_MGMT_FAULTS:        '/dashboard/network-management/faults',
  // Network Provisioning Service Routes
  NET_PROV_DASHBOARD:     '/dashboard/network-provisioning',
  NET_PROV_NETWORKS:      '/dashboard/network-provisioning/networks',
  NET_PROV_SUBNETS:       '/dashboard/network-provisioning/subnets',
  NET_PROV_IP_ALLOC:      '/dashboard/network-provisioning/ip-allocations',
  NET_PROV_DEVICES:       '/dashboard/network-provisioning/devices',
  // Asset Tracking RTLS Service Routes
  RTLS_DASHBOARD:         '/dashboard/asset-tracking',
  RTLS_ASSETS:            '/dashboard/asset-tracking/assets',
  RTLS_TAGS:              '/dashboard/asset-tracking/tags',
  RTLS_LOCATIONS:         '/dashboard/asset-tracking/locations',
  RTLS_MOVEMENTS:         '/dashboard/asset-tracking/movements',
  // Perimeter Security Service Routes
  PERIMETER_DASHBOARD:    '/dashboard/perimeter-security',
  PERIMETER_ZONES:        '/dashboard/perimeter-security/zones',
  PERIMETER_SENSORS:      '/dashboard/perimeter-security/sensors',
  PERIMETER_INTRUSIONS:   '/dashboard/perimeter-security/intrusions',
  PERIMETER_RESPONSES:    '/dashboard/perimeter-security/responses',
  // Fire & Safety Systems Service Routes
  FIRE_SAFETY_DASHBOARD:   '/dashboard/fire-safety',
  FIRE_SAFETY_DEVICES:     '/dashboard/fire-safety/devices',
  FIRE_SAFETY_EVENTS:      '/dashboard/fire-safety/events',
  FIRE_SAFETY_ACTIONS:     '/dashboard/fire-safety/actions',
  FIRE_SAFETY_EVACUATION:  '/dashboard/fire-safety/evacuation',
  // Security Incident Response Service Routes
  SEC_INCIDENT_DASHBOARD:  '/dashboard/security-incident',
  SEC_INCIDENT_LIST:       '/dashboard/security-incident/incidents',
  SEC_INCIDENT_ACTIONS:    '/dashboard/security-incident/actions',
  SEC_INCIDENT_RESPONDERS: '/dashboard/security-incident/responders',
  SEC_INCIDENT_LOGS:       '/dashboard/security-incident/logs',
  // Visitor Management Service Routes
  VISITOR_DASHBOARD:       '/dashboard/visitor-management',
  VISITOR_REGISTRY:        '/dashboard/visitor-management/visitors',
  VISITOR_VISITS:          '/dashboard/visitor-management/visits',
  VISITOR_BADGES:          '/dashboard/visitor-management/badges',
  VISITOR_LOGS:            '/dashboard/visitor-management/logs',
  // CCTV & Surveillance Service Routes
  CCTV_DASHBOARD:          '/dashboard/cctv-surveillance',
  CCTV_CAMERAS:            '/dashboard/cctv-surveillance/cameras',
  CCTV_STREAMS:            '/dashboard/cctv-surveillance/streams',
  CCTV_RECORDINGS:         '/dashboard/cctv-surveillance/recordings',
  CCTV_EVENTS:             '/dashboard/cctv-surveillance/events',
  // Physical Access Control Service Routes
  ACCESS_DASHBOARD:        '/dashboard/physical-access',
  ACCESS_POINTS:           '/dashboard/physical-access/points',
  ACCESS_CREDENTIALS:      '/dashboard/physical-access/credentials',
  ACCESS_POLICIES:         '/dashboard/physical-access/policies',
  ACCESS_LOGS:             '/dashboard/physical-access/logs',
  // Multi-Tenant Isolation Manager Routes
  TENANT_DASHBOARD:        '/dashboard/multi-tenant',
  TENANT_REGISTRY:         '/dashboard/multi-tenant/tenants',
  TENANT_POLICIES:         '/dashboard/multi-tenant/policies',
  TENANT_LOGS:             '/dashboard/multi-tenant/logs',
  TENANT_PROPAGATION:      '/dashboard/multi-tenant/propagation',
  // SLA & Service Health Manager Routes
  SLA_DASHBOARD:           '/dashboard/sla-health',
  SLA_DEFINITIONS:         '/dashboard/sla-health/definitions',
  SLA_HEALTH:              '/dashboard/sla-health/status',
  SLA_VIOLATIONS:          '/dashboard/sla-health/violations',
  SLA_EVENTS:              '/dashboard/sla-health/events',
  // Automation & RPA Engine Routes
  RPA_DASHBOARD:           '/dashboard/automation-rpa',
  RPA_WORKFLOWS:           '/dashboard/automation-rpa/workflows',
  RPA_RUNS:                '/dashboard/automation-rpa/runs',
  RPA_TASKS:               '/dashboard/automation-rpa/tasks',
  RPA_BOTS:                '/dashboard/automation-rpa/bots',
  // AI Governance & Explainability Routes
  AIGOV_DASHBOARD:         '/dashboard/ai-governance',
  AIGOV_MODELS:            '/dashboard/ai-governance/models',
  AIGOV_DECISIONS:         '/dashboard/ai-governance/decisions',
  AIGOV_EXPLAINABILITY:    '/dashboard/ai-governance/explainability',
  AIGOV_BIAS:              '/dashboard/ai-governance/bias',
  AIGOV_POLICIES:          '/dashboard/ai-governance/policies',
  // Knowledge Graph Engine Routes
  KGRAPH_DASHBOARD:        '/dashboard/knowledge-graph',
  KGRAPH_NODES:            '/dashboard/knowledge-graph/nodes',
  KGRAPH_EDGES:            '/dashboard/knowledge-graph/edges',
  KGRAPH_QUERIES:          '/dashboard/knowledge-graph/queries',
  KGRAPH_INFERENCE:        '/dashboard/knowledge-graph/inference',
  // API Composition Gateway Routes
  API_COMP_DASHBOARD:      '/dashboard/api-composition',
  API_COMP_DEFINITIONS:    '/dashboard/api-composition/definitions',
  API_COMP_ROUTES:         '/dashboard/api-composition/routes',
  API_COMP_LOGS:           '/dashboard/api-composition/logs',
  // Data Fabric / Integration Hub Routes
  FABRIC_DASHBOARD:        '/dashboard/data-fabric',
  FABRIC_PIPELINES:        '/dashboard/data-fabric/pipelines',
  FABRIC_TRANSFORMS:       '/dashboard/data-fabric/transformations',
  FABRIC_EVENTS:           '/dashboard/data-fabric/events',
  FABRIC_SCHEMAS:          '/dashboard/data-fabric/schemas',
  // Alert Correlation Engine Routes
  ALERT_DASHBOARD:         '/dashboard/alert-correlation',
  ALERT_RAW:               '/dashboard/alert-correlation/alerts',
  ALERT_INCIDENTS:         '/dashboard/alert-correlation/incidents',
  ALERT_MAPPINGS:          '/dashboard/alert-correlation/mappings',
  ALERT_RULES:             '/dashboard/alert-correlation/rules',
  // Operational Command Center Routes
  CMD_DASHBOARD:           '/dashboard/command-center',
  CMD_INCIDENTS:           '/dashboard/command-center/incidents',
  CMD_ACTIONS:             '/dashboard/command-center/commands',
  CMD_EVENTS:              '/dashboard/command-center/events',
  CMD_SESSIONS:            '/dashboard/command-center/sessions',
  // Clinical Pathway Intelligence Routes
  PATHWAY_DASHBOARD:       '/dashboard/clinical-pathway',
  PATHWAY_DEFINITIONS:     '/dashboard/clinical-pathway/pathways',
  PATHWAY_STEPS:           '/dashboard/clinical-pathway/steps',
  PATHWAY_JOURNEYS:        '/dashboard/clinical-pathway/journeys',
  PATHWAY_VARIANCES:       '/dashboard/clinical-pathway/variances',
  // Resource Optimization Engine Routes
  RESOPT_DASHBOARD:        '/dashboard/resource-optimization',
  RESOPT_RESOURCES:        '/dashboard/resource-optimization/resources',
  RESOPT_ALLOCATIONS:      '/dashboard/resource-optimization/allocations',
  RESOPT_RUNS:             '/dashboard/resource-optimization/runs',
  RESOPT_RESULTS:          '/dashboard/resource-optimization/results',
  // Simulation & What-If Engine Routes
  SIMULATION_DASHBOARD:    '/dashboard/simulation',
  SIMULATION_RUNS:         '/dashboard/simulation/runs',
  SIMULATION_SCENARIOS:    '/dashboard/simulation/scenarios',
  SIMULATION_RESULTS:      '/dashboard/simulation/results',
  SIMULATION_EVENTS:       '/dashboard/simulation/events',
  // Digital Twin Engine Routes
  TWIN_DASHBOARD:          '/dashboard/digital-twin',
  TWIN_ENTITIES:           '/dashboard/digital-twin/twins',
  TWIN_STATES:             '/dashboard/digital-twin/states',
  TWIN_EVENTS:             '/dashboard/digital-twin/events',
  TWIN_SIMULATIONS:        '/dashboard/digital-twin/simulations',
  // Redpanda Console Routes
  REDPANDA_DASHBOARD:      '/dashboard/redpanda-console',
  REDPANDA_SESSIONS:       '/dashboard/redpanda-console/sessions',
  REDPANDA_TOPICS:         '/dashboard/redpanda-console/topics',
  REDPANDA_CONSUMERS:      '/dashboard/redpanda-console/consumers',
  // SonarQube Quality Service Routes
  SONAR_DASHBOARD:         '/dashboard/sonarqube',
  SONAR_PROJECTS:          '/dashboard/sonarqube/projects',
  SONAR_ANALYSES:          '/dashboard/sonarqube/analyses',
  SONAR_ISSUES:            '/dashboard/sonarqube/issues',
  SONAR_GATES:             '/dashboard/sonarqube/gates',
  // Gitea Source Control Service Routes
  GITEA_DASHBOARD:         '/dashboard/gitea',
  GITEA_REPOS:             '/dashboard/gitea/repositories',
  GITEA_COMMITS:           '/dashboard/gitea/commits',
  GITEA_PRS:               '/dashboard/gitea/pull-requests',
  GITEA_ISSUES:            '/dashboard/gitea/issues',
  // OpenSearch Service Routes
  OPENSEARCH_DASHBOARD:    '/dashboard/opensearch',
  OPENSEARCH_INDICES:      '/dashboard/opensearch/indices',
  OPENSEARCH_DOCUMENTS:    '/dashboard/opensearch/documents',
  OPENSEARCH_QUERIES:      '/dashboard/opensearch/queries',
  // Jaeger Tracing Service Routes
  JAEGER_DASHBOARD:        '/dashboard/jaeger',
  JAEGER_TRACES:           '/dashboard/jaeger/traces',
  JAEGER_SPANS:            '/dashboard/jaeger/spans',
  JAEGER_DEPENDENCIES:     '/dashboard/jaeger/dependencies',
  // Loki Logging Service Routes
  LOKI_DASHBOARD:          '/dashboard/loki',
  LOKI_STREAMS:            '/dashboard/loki/streams',
  LOKI_ENTRIES:            '/dashboard/loki/entries',
  LOKI_INDEX:              '/dashboard/loki/index',
  // Grafana Visualization Service Routes
  GRAFANA_DASHBOARD:       '/dashboard/grafana',
  GRAFANA_DASHBOARDS:      '/dashboard/grafana/dashboards',
  GRAFANA_PANELS:          '/dashboard/grafana/panels',
  GRAFANA_DATASOURCES:     '/dashboard/grafana/datasources',
  GRAFANA_ALERTS:          '/dashboard/grafana/alerts',
  // Prometheus Monitoring Service Routes
  PROM_DASHBOARD:          '/dashboard/prometheus',
  PROM_METRICS:            '/dashboard/prometheus/metrics',
  PROM_RULES:              '/dashboard/prometheus/rules',
  PROM_EVENTS:             '/dashboard/prometheus/events',
  // Redpanda Streaming Service Routes
  REDPANDA_STREAMING_DASHBOARD: '/dashboard/redpanda',
  REDPANDA_STREAMING_TOPICS:    '/dashboard/redpanda/topics',
  REDPANDA_STREAMING_MESSAGES:  '/dashboard/redpanda/messages',
  REDPANDA_STREAMING_OFFSETS:   '/dashboard/redpanda/offsets',
  // Redis Cache Service Routes
  REDIS_DASHBOARD:         '/dashboard/redis',
  REDIS_KEYS:              '/dashboard/redis/keys',
  REDIS_SESSIONS:          '/dashboard/redis/sessions',
  REDIS_RATELIMITS:        '/dashboard/redis/ratelimits',
  // Postal Mail Service Routes
  POSTAL_DASHBOARD:        '/dashboard/postal',
  POSTAL_MESSAGES:         '/dashboard/postal/messages',
  POSTAL_QUEUES:           '/dashboard/postal/queues',
  POSTAL_BOUNCES:          '/dashboard/postal/bounces',
  // Coturn Relay Service Routes
  COTURN_DASHBOARD:        '/dashboard/coturn',
  COTURN_SESSIONS:         '/dashboard/coturn/sessions',
  COTURN_CREDENTIALS:      '/dashboard/coturn/credentials',
  COTURN_USAGELOGS:        '/dashboard/coturn/usagelogs',
  // Jitsi Conferencing Service Routes
  JITSI_DASHBOARD:         '/dashboard/jitsi',
  JITSI_ROOMS:             '/dashboard/jitsi/rooms',
  JITSI_PARTICIPANTS:      '/dashboard/jitsi/participants',
  JITSI_SESSIONS:          '/dashboard/jitsi/sessions',
  JITSI_MEDIALOGS:         '/dashboard/jitsi/medialogs',
  // IoT Messaging Service Routes
  IOT_DASHBOARD:           '/dashboard/iot',
  IOT_CONNECTIONS:         '/dashboard/iot/connections',
  IOT_TOPICS:              '/dashboard/iot/topics',
  IOT_MESSAGES:            '/dashboard/iot/messages',
  IOT_COMMANDS:            '/dashboard/iot/commands',
  IOT_EVENTS:              '/dashboard/iot/events',
  // Wazuh SIEM/XDR Service Routes
  WAZUH_DASHBOARD:         '/dashboard/wazuh',
  WAZUH_ALERTS:            '/dashboard/wazuh/alerts',
  WAZUH_AGENTS:            '/dashboard/wazuh/agents',
  WAZUH_VULNERABILITIES:   '/dashboard/wazuh/vulnerabilities',
  WAZUH_FIM:               '/dashboard/wazuh/fim',
  WAZUH_COMPLIANCE:        '/dashboard/wazuh/compliance',
  // Threat Detection Service Routes
  THREAT_DETECT_DASHBOARD:  '/dashboard/threat-detection',
  THREAT_DETECT_ALERTS:     '/dashboard/threat-detection/alerts',
  THREAT_DETECT_ANOMALIES:  '/dashboard/threat-detection/anomalies',
  THREAT_DETECT_RULES:      '/dashboard/threat-detection/rules',
  THREAT_DETECT_ENGINES:    '/dashboard/threat-detection/engines',
  // Kong Gateway Service Routes
  KONG_DASHBOARD:           '/dashboard/kong-gateway',
  KONG_SERVICES:            '/dashboard/kong-gateway/services',
  KONG_PLUGINS:             '/dashboard/kong-gateway/plugins',
  KONG_UPSTREAMS:           '/dashboard/kong-gateway/upstreams',
  KONG_CONSUMERS:           '/dashboard/kong-gateway/consumers',
  KONG_ALERTS:              '/dashboard/kong-gateway/alerts',

  // GraphQL Federation Gateway Routes
  GRAPHQL_GW_DASHBOARD:    '/dashboard/graphql-gateway',


  // ── AI Platform Service Routes ────────────────────────────────────────────
  AI_PLATFORM_DASHBOARD:    '/dashboard/ai-platform',
  AI_PLATFORM_MODELS:       '/dashboard/ai-platform/models',
  AI_PLATFORM_MODEL_DETAIL: '/dashboard/ai-platform/models/detail',
  AI_PLATFORM_TRAINING:     '/dashboard/ai-platform/training',
  AI_PLATFORM_INFERENCE:    '/dashboard/ai-platform/inference',
  AI_PLATFORM_CDSS:         '/dashboard/ai-platform/cdss',
  AI_PLATFORM_CDSS_RULES:   '/dashboard/ai-platform/cdss/rules',
  AI_PLATFORM_CDSS_ALERTS:  '/dashboard/ai-platform/cdss/alerts',
  AI_PLATFORM_TWINS:        '/dashboard/ai-platform/digital-twins',
  AI_PLATFORM_TWINS_SIM:    '/dashboard/ai-platform/digital-twins/simulations',
  AI_PLATFORM_PIPELINES:    '/dashboard/ai-platform/pipelines',
  AI_PLATFORM_FEATURES:     '/dashboard/ai-platform/feature-store',
  AI_PLATFORM_GOVERNANCE:   '/dashboard/ai-platform/governance',
  AI_PLATFORM_BIAS:         '/dashboard/ai-platform/governance/bias',
  AI_PLATFORM_EXPLAINABILITY:'/dashboard/ai-platform/governance/explainability',
  AI_PLATFORM_MONITORING:   '/dashboard/ai-platform/monitoring',
  AI_PLATFORM_ALERTS:       '/dashboard/ai-platform/alerts',
  AI_PLATFORM_REPORTS:      '/dashboard/ai-platform/reports',

  // Clinical Research Service Routes
  RESEARCH_DASHBOARD:       '/dashboard/clinical-research',
  RESEARCH_TRIALS:          '/dashboard/clinical-research/trials',
  RESEARCH_PATIENTS:        '/dashboard/clinical-research/patients',
  RESEARCH_DATASETS:        '/dashboard/clinical-research/datasets',
  RESEARCH_COMPLIANCE:      '/dashboard/clinical-research/compliance',

  // Population Health Service Routes
  POP_HEALTH_DASHBOARD:     '/dashboard/population-health',
  POP_HEALTH_COHORTS:       '/dashboard/population-health/cohorts',
  POP_HEALTH_CAMPAIGNS:     '/dashboard/population-health/campaigns',
  POP_HEALTH_RISK:          '/dashboard/population-health/risk',
  POP_HEALTH_EPI:           '/dashboard/population-health/epidemiology',

  // MLflow Service Routes
  MLFLOW_DASHBOARD:         '/dashboard/mlflow',
  MLFLOW_EXPERIMENTS:       '/dashboard/mlflow/experiments',
  MLFLOW_MODELS:            '/dashboard/mlflow/models',
  MLFLOW_RUNS:              '/dashboard/mlflow/runs',
  MLFLOW_REGISTRY:          '/dashboard/mlflow/registry',

  // TF Serving Service Routes
  TF_SERVING_DASHBOARD:     '/dashboard/tf-serving',
  TF_SERVING_MODELS:        '/dashboard/tf-serving/models',
  TF_SERVING_VERSIONS:      '/dashboard/tf-serving/versions',
  TF_SERVING_MONITORING:    '/dashboard/tf-serving/monitoring',

  // Medical Education Service Routes
  MED_ED_DASHBOARD:         '/dashboard/medical-education',
  MED_ED_CURRICULUM:        '/dashboard/medical-education/curriculum',
  MED_ED_STUDENTS:          '/dashboard/medical-education/students',
  MED_ED_EXAMS:             '/dashboard/medical-education/exams',
  MED_ED_CERTIFICATIONS:    '/dashboard/medical-education/certifications',

  // Credentialing Service Routes
  CREDENTIALING_DASHBOARD:  '/dashboard/credentialing',
  CREDENTIALING_STAFF:      '/dashboard/credentialing/staff',
  CREDENTIALING_PRIVILEGES: '/dashboard/credentialing/privileges',
  CREDENTIALING_VERIFY:     '/dashboard/credentialing/verify',
  CREDENTIALING_RENEWALS:   '/dashboard/credentialing/renewals',

  // Quality Management Service Routes
  QUALITY_MGMT_DASHBOARD:   '/dashboard/quality-management',
  QUALITY_MGMT_INCIDENTS:   '/dashboard/quality-management/incidents',
  QUALITY_MGMT_AUDITS:      '/dashboard/quality-management/audits',
  QUALITY_MGMT_INDICATORS:  '/dashboard/quality-management/indicators',
  QUALITY_MGMT_PROJECTS:    '/dashboard/quality-management/projects',

  // Accreditation Service Routes
  ACCREDITATION_DASHBOARD:  '/dashboard/accreditation',
  ACCREDITATION_STANDARDS:   '/dashboard/accreditation/standards',
  ACCREDITATION_EVIDENCE:    '/dashboard/accreditation/evidence',
  ACCREDITATION_SURVEYS:     '/dashboard/accreditation/surveys',
  ACCREDITATION_GAP_ANALYSIS: '/dashboard/accreditation/gap-analysis',

  // Ethics Service Routes
  ETHICS_DASHBOARD:         '/dashboard/ethics',
  ETHICS_CONSULTATIONS:     '/dashboard/ethics/consultations',
  ETHICS_COMMITTEE:         '/dashboard/ethics/committee',
  ETHICS_POLICIES:          '/dashboard/ethics/policies',
  ETHICS_COI:               '/dashboard/ethics/coi',

  // Data Governance Service Routes
  DATA_GOVERNANCE_DASHBOARD: '/dashboard/data-governance',
  DATA_GOVERNANCE_POLICIES:  '/dashboard/data-governance/policies',
  DATA_GOVERNANCE_LINEAGE:   '/dashboard/data-governance/lineage',
  DATA_GOVERNANCE_PRIVACY:   '/dashboard/data-governance/privacy',
  DATA_GOVERNANCE_CATALOG:   '/dashboard/data-governance/catalog',

  // Compliance Governance Service Routes
  COMPLIANCE_DASHBOARD:      '/dashboard/compliance',
  COMPLIANCE_AUDITS:         '/dashboard/compliance/audits',
  COMPLIANCE_RISK_REGISTER:  '/dashboard/compliance/risk-register',
  COMPLIANCE_NON_CONFORMANCE:'/dashboard/compliance/non-conformance',
  COMPLIANCE_TRAINING:       '/dashboard/compliance/training',

  // Workflow Engine Service Routes
  WORKFLOW_DASHBOARD:        '/dashboard/workflow',
  WORKFLOW_DEFINITIONS:      '/dashboard/workflow/definitions',
  WORKFLOW_TASKS:            '/dashboard/workflow/tasks',
  WORKFLOW_AUTOMATIONS:      '/dashboard/workflow/automations',
  WORKFLOW_ANALYTICS:        '/dashboard/workflow/analytics',

  // Config Service Routes
  CONFIG_DASHBOARD:          '/dashboard/config-service',
  CONFIG_GLOBAL:             '/dashboard/config-service/global',
  CONFIG_FEATURE_FLAGS:      '/dashboard/config-service/feature-flags',
  CONFIG_TENANT_OVERRIDES:   '/dashboard/config-service/tenant-overrides',
  CONFIG_AUDIT_LOG:          '/dashboard/config-service/audit-log',

  // Rostering Service Routes
  ROSTERING_DASHBOARD:       '/dashboard/rostering',
  ROSTERING_SCHEDULES:       '/dashboard/rostering/schedules',
  ROSTERING_SHIFTS:          '/dashboard/rostering/shifts',
  ROSTERING_LEAVE:           '/dashboard/rostering/leave',
  ROSTERING_ANALYTICS:       '/dashboard/rostering/analytics',

  // Performance Service Routes
  PERFORMANCE_DASHBOARD:      '/dashboard/performance',
  PERFORMANCE_APPRAISALS:     '/dashboard/performance/appraisals',
  PERFORMANCE_KPIS:           '/dashboard/performance/kpis',
  PERFORMANCE_FEEDBACK:       '/dashboard/performance/feedback',
  PERFORMANCE_DEVELOPMENT:    '/dashboard/performance/development',

  // Patient Experience Service Routes
  PATIENT_EXP_DASHBOARD:      '/dashboard/patient-experience',
  PATIENT_EXP_SURVEYS:        '/dashboard/patient-experience/surveys',
  PATIENT_EXP_GRIEVANCES:     '/dashboard/patient-experience/grievances',
  PATIENT_EXP_REQUESTS:       '/dashboard/patient-experience/requests',
  PATIENT_EXP_ANALYTICS:      '/dashboard/patient-experience/analytics',

  // Case Management Service Routes
  CASE_MGMT_DASHBOARD:        '/dashboard/case-management',
  CASE_MGMT_DISCHARGE:        '/dashboard/case-management/discharge-planning',
  CASE_MGMT_UTILIZATION:      '/dashboard/case-management/utilization-review',
  CASE_MGMT_COORDINATION:     '/dashboard/case-management/care-coordination',
  CASE_MGMT_REFERRALS:        '/dashboard/case-management/referrals',

  // Fleet Management Service Routes
  FLEET_DASHBOARD:            '/dashboard/fleet-management',
  FLEET_VEHICLES:             '/dashboard/fleet-management/vehicles',
  FLEET_DISPATCH:             '/dashboard/fleet-management/dispatch',
  FLEET_MAINTENANCE:          '/dashboard/fleet-management/maintenance',
  FLEET_TRACKING:             '/dashboard/fleet-management/tracking',

  // Biomedical Engineering Service Routes
  BIOMED_DASHBOARD:           '/dashboard/biomedical',
  BIOMED_EQUIPMENT:           '/dashboard/biomedical/equipment',
  BIOMED_MAINTENANCE:         '/dashboard/biomedical/maintenance',
  BIOMED_CALIBRATION:         '/dashboard/biomedical/calibration',
  BIOMED_INVENTORY:           '/dashboard/biomedical/inventory',

  // Diet & Nutrition Service Routes
  NUTRITION_DASHBOARD:        '/dashboard/nutrition',
  NUTRITION_DIETARY_ORDERS:   '/dashboard/nutrition/dietary-orders',
  NUTRITION_MEAL_PLANNING:    '/dashboard/nutrition/meal-planning',
  NUTRITION_ASSESSMENT:       '/dashboard/nutrition/assessment',
  NUTRITION_KITCHEN:          '/dashboard/nutrition/kitchen-ops',

  // Housekeeping Service Routes
  HOUSEKEEPING_DASHBOARD:     '/dashboard/housekeeping',
  HOUSEKEEPING_ROOMS:         '/dashboard/housekeeping/room-status',
  HOUSEKEEPING_CLEANING:      '/dashboard/housekeeping/cleaning-tasks',
  HOUSEKEEPING_LINEN:         '/dashboard/housekeeping/linen-mgmt',
  HOUSEKEEPING_WASTE:         '/dashboard/housekeeping/waste-mgmt',

  // Incident Management Service Routes
  INCIDENT_DASHBOARD:         '/dashboard/incident-management',
  INCIDENT_REPORTS:           '/dashboard/incident-management/reports',
  INCIDENT_INVESTIGATIONS:    '/dashboard/incident-management/investigations',
  INCIDENT_RCA:               '/dashboard/incident-management/root-cause-analysis',
  INCIDENT_ANALYTICS:         '/dashboard/incident-management/analytics',

  // Risk Management Service Routes
  RISK_MGMT_DASHBOARD:        '/dashboard/risk-management',
  RISK_MGMT_REGISTER:         '/dashboard/risk-management/register',
  RISK_MGMT_ASSESSMENTS:      '/dashboard/risk-management/assessments',
  RISK_MGMT_MITIGATION:       '/dashboard/risk-management/mitigation-plans',
  RISK_MGMT_INSURANCE:        '/dashboard/risk-management/insurance-legal',

  // Vendor Management Service Routes
  VENDOR_DASHBOARD:           '/dashboard/vendor-management',
  VENDOR_DIRECTORY:           '/dashboard/vendor-management/directory',
  VENDOR_CONTRACTS:           '/dashboard/vendor-management/contracts',
  VENDOR_PERFORMANCE:         '/dashboard/vendor-management/performance',
  VENDOR_COMPLIANCE:          '/dashboard/vendor-management/compliance',

  // Insurance Integration Service Routes
  INSURANCE_DASHBOARD:        '/dashboard/insurance',
  INSURANCE_CLAIMS:           '/dashboard/insurance/claims',
  INSURANCE_ELIGIBILITY:      '/dashboard/insurance/eligibility',
  INSURANCE_AUTHORIZATION:    '/dashboard/insurance/authorizations',
  INSURANCE_PAYERS:           '/dashboard/insurance/payers',

  // Regulator Integration Service Routes
  REGULATOR_DASHBOARD:        '/dashboard/regulator',
  REGULATOR_SUBMISSIONS:      '/dashboard/regulator/submissions',
  REGULATOR_LICENSES:         '/dashboard/regulator/licenses',
  REGULATOR_AUDITS:           '/dashboard/regulator/audits',
  REGULATOR_DIRECTIVES:       '/dashboard/regulator/directives',

  // Mortuary Service Routes
  MORTUARY_DASHBOARD:         '/dashboard/mortuary',
  MORTUARY_INTAKE:            '/dashboard/mortuary/intake',
  MORTUARY_STORAGE:           '/dashboard/mortuary/storage',
  MORTUARY_RELEASE:           '/dashboard/mortuary/release',
  MORTUARY_AUTOPSY:           '/dashboard/mortuary/autopsy',

  // Transplant Coordination Service Routes
  TRANSPLANT_DASHBOARD:       '/dashboard/transplant',
  TRANSPLANT_WAITLIST:        '/dashboard/transplant/waitlist',
  TRANSPLANT_DONORS:          '/dashboard/transplant/donors',
  TRANSPLANT_MATCHING:        '/dashboard/transplant/matching',
  TRANSPLANT_LOGISTICS:       '/dashboard/transplant/logistics',
} as const;

/** Local storage keys */
export const STORAGE_KEYS = {
  THEME: 'mt-theme',
  SIDEBAR_COLLAPSED: 'mt-sidebar-collapsed',
  TENANT_ID: 'mt-tenant-id',
  LOCALE: 'mt-locale',
} as const;
