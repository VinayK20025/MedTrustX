Below is a complete Keycloak role hierarchy design tailored for your MedTrustX DHOS (Zero Trust, multi-tenant, microservices). This is not a flat RBAC model—it is a hierarchical + composable role system designed to interoperate with OPA (ABAC), tenant isolation, and service-level enforcement.

1. DESIGN PRINCIPLES
Structural Constraints
Multi-tenant isolation (hard boundary)
No direct permission-to-user mapping
Roles are composable via inheritance
Fine-grained control delegated to OPA (ABAC)
Role Types
Type
Purpose
Realm Roles
Global platform roles
Client Roles
Service-specific permissions
Composite Roles
Aggregated business roles
Attribute Roles
Contextual (ABAC inputs)


2. REALM ROLE HIERARCHY (TOP LEVEL)
SUPER_ADMIN
 ├── PLATFORM_ADMIN
 │    ├── IAM_ADMIN
 │    ├── SECURITY_ADMIN
 │    ├── COMPLIANCE_ADMIN
 │    └── INFRA_ADMIN
 │
 ├── TENANT_ADMIN
 │    ├── HOSPITAL_ADMIN
 │    ├── CLINICAL_ADMIN
 │    ├── OPERATIONS_ADMIN
 │    └── FINANCE_ADMIN
 │
 ├── CLINICAL_USER
 │    ├── DOCTOR
 │    ├── NURSE
 │    ├── ICU_STAFF
 │    ├── LAB_STAFF
 │    ├── PHARMACY_STAFF
 │
 ├── SUPPORT_USER
 │    ├── ADMIN_STAFF
 │    ├── BILLING_STAFF
 │    ├── HR_STAFF
 │    ├── RECORDS_STAFF
 │
 ├── SYSTEM_ENTITY
 │    ├── SERVICE_ACCOUNT
 │    ├── IOMT_DEVICE
 │    ├── AUTOMATION_BOT
 │
 └── AUDITOR
      ├── INTERNAL_AUDITOR
      ├── EXTERNAL_AUDITOR
      └── REGULATORY_INSPECTOR


3. CLIENT ROLE MODEL (SERVICE-LEVEL PERMISSIONS)
Each microservice = Keycloak Client
Example clients:
patient-service
clinical-service
diagnostics-service
pharmacy-service
icu-service
medical-records-service
devices-service

Example: clinical-service roles
clinical.read
clinical.write
clinical.delete
clinical.approve
clinical.audit


Example: patient-service
patient.read
patient.write
patient.search
patient.link_mpi


Example: diagnostics-service
diagnostics.order.create
diagnostics.result.read
diagnostics.result.write
diagnostics.result.validate


4. COMPOSITE ROLE DESIGN (CORE)
Composite roles map business roles → service permissions

A. DOCTOR (Composite Role)
DOCTOR
 ├── patient.read
 ├── clinical.read
 ├── clinical.write
 ├── diagnostics.result.read
 ├── pharmacy.prescription.create
 ├── medical-records.read
 ├── cdss.read

Attributes (ABAC Inputs)
{
 "department": "cardiology",
 "access_scope": "assigned_patients",
 "can_prescribe": true
}


B. NURSE
NURSE
 ├── patient.read
 ├── nursing.task.execute
 ├── clinical.read
 ├── pharmacy.administration.write
 ├── icu.vitals.write


C. ICU_DOCTOR
ICU_DOCTOR
 ├── DOCTOR
 ├── icu.full_access
 ├── devices.telemetry.read


D. LAB_TECHNICIAN
LAB_TECHNICIAN
 ├── diagnostics.order.read
 ├── diagnostics.sample.update
 ├── diagnostics.result.write


E. PHARMACIST
PHARMACIST
 ├── pharmacy.dispense
 ├── pharmacy.read
 ├── cdss.drug_interaction.read


F. ADMIN_STAFF
ADMIN_STAFF
 ├── patient.read
 ├── appointment.manage
 ├── billing.read


G. IAM_ADMIN
IAM_ADMIN
 ├── realm.manage-users
 ├── realm.manage-roles
 ├── realm.view-audit
 ├── client.manage


H. AUDITOR
AUDITOR
 ├── audit.read
 ├── medical-records.audit
 ├── logs.read


5. TENANT ISOLATION MODEL
Realm Strategy
Two valid approaches:
Option A (Recommended)
Single realm
Tenant via attribute:
{
 "tenant_id": "hospital-123"
}

Enforcement
Injected into JWT
Enforced by OPA + services

Option B
Separate realm per tenant (less scalable)

6. ATTRIBUTE-BASED ACCESS (ABAC EXTENSION)
Keycloak provides attributes → OPA evaluates
User Attributes
{
 "tenant_id": "tenant-1",
 "department": "ICU",
 "role_level": "senior",
 "assigned_patients": ["uuid1", "uuid2"]
}


Token Example (JWT Claims)
{
 "sub": "user-id",
 "roles": ["DOCTOR"],
 "tenant_id": "tenant-1",
 "department": "cardiology"
}


7. ROLE HIERARCHY INHERITANCE LOGIC
Example Resolution
ICU_DOCTOR
 → inherits DOCTOR
 → inherits clinical.write
 → inherits icu.full_access

At runtime:
Keycloak resolves roles
JWT includes flattened permissions
OPA enforces context rules

8. PRIVILEGED ACCESS (PAM INTEGRATION)
Roles
PRIVILEGED_ADMIN
 ├── requires approval
 ├── time-bound access
 ├── session recording

Flow
Request elevated role
Approval (Access Reviewer)
Temporary token issued
Auto-expiry

9. BREAK-GLASS (EMERGENCY ACCESS)
Role
EMERGENCY_ACCESS
 ├── clinical.read_all
 ├── icu.read_all

Controls
Mandatory justification
Full audit trail
Time-limited

10. SERVICE ACCOUNT DESIGN
Example
SERVICE_ACCOUNT: clinical-service
 ├── patient.read
 ├── diagnostics.read
 ├── cdss.trigger

Constraints
mTLS required
No human login
Scoped tokens

11. IOMT DEVICE ROLES
DEVICE_MONITOR
 ├── devices.telemetry.publish
 ├── devices.status.update

Security
Certificate-based identity
No read access

12. ROLE NAMING CONVENTION
<domain>.<resource>.<action>

Examples:
clinical.note.write
patient.identity.read
diagnostics.result.validate
pharmacy.drug.dispense
icu.alert.resolve


13. ROLE GOVERNANCE
Lifecycle
Stage
Action
Creation
IAM Admin
Approval
Compliance
Assignment
Manager
Review
Quarterly
Revocation
Automated


14. ACCESS REVIEW MODEL
Periodic (ISO 27001)
Trigger-based (role change)
Risk-based (ISO 31000)

15. AUDIT LOGGING
Every role usage logs:
user_id
role
action
resource
timestamp
tenant_id

16. COMPLIANCE ALIGNMENT
ISO 27001
Role-based access control
Least privilege
Access review
HIPAA
Minimum necessary access
PHI protection
GDPR
Data minimization
Role restriction
DPDP Act 2023
Consent-bound access
HITRUST
Risk-based role assignment

17. FINAL ARCHITECTURE VIEW
USER
 → Keycloak Authentication
 → JWT (roles + attributes)
 → Service Gateway
 → OPA (policy decision)
 → Microservice (enforced access)
 → Audit Log


18. CRITICAL DESIGN INSIGHT
Keycloak is NOT your final authorization layer.
It provides:
Identity
Role hierarchy
Token claims
Actual enforcement:
OPA (context-aware, patient-aware, tenant-aware)

19. WHAT MAKES THIS ENTERPRISE-GRADE
Hierarchical roles (not flat)
Service-scoped permissions
Attribute-driven decisions
Tenant isolation
Break-glass + PAM
Full auditability
____________________
User and Roles
1) Executive & Governance Leadership 
Board Member Hospital Owner / Director 
Chief Executive Officer (CEO) 
Chief Operating Officer (COO) 
Chief Medical Officer (CMO) 
Chief Nursing Officer (CNO) 
Chief Information Officer (CIO) 
Chief Information Security Officer (CISO) 
Chief Financial Officer (CFO) 
Chief Compliance Officer (CCO) 
Chief Technology Officer (CTO)
Chief Marketing Officer (CMO)

2) Medical Leadership & Department Heads 
Medical Superintendent Deputy 
Medical Superintendent 
Head of Department (HOD – each specialty) 
Clinical Director Unit Head (ICU, ER, OT, etc.) 
3) Physicians & Medical Practitioners (Full Spectrum) 
General & Specialist Doctors 
General Physician 
Surgeon (General + Specialized) 

Anesthesiologist 
Cardiologist 
Neurologist 
Orthopedic 
Surgeon 
Dermatologist 
Gastroenterologist 
Endocrinologist 
Nephrologist 
Urologist 
Pulmonologist 
Oncologist 
Hematologist 
Rheumatologist 
Infectious Disease Specialist 
Specialized Care 
Pediatrician 
Neonatologist 
Gynecologist / Obstetrician 
Psychiatrist 
Ophthalmologist 
ENT 
Specialist Emergency & Critical Care 

Emergency Physician 
Intensivist Visiting & External Visiting 
Consultant Locum Doctor 
4) Medical Training & Academic Roles 
Resident Doctor 
Junior Resident (JR) 
Senior Resident (SR) 
Medical Intern 
Medical Student Clinical Fellow 
5) Nursing Hierarchy (Complete) 
Nursing Superintendent 
Deputy Nursing Superintendent 
Head Nurse / Ward In-Charge 
Staff Nurse 
ICU Nurse 
ER Nurse 
OT Nurse 
Triage Nurse
Infection Control Nurse
Nursing Assistant 
Auxiliary Nurse Midwife (ANM) 
6) Allied Health Professionals 
Physiotherapist Occupational 
Therapist Speech 
Therapist Respiratory 
Therapist Dietitian / Nutritionist 
Clinical Psychologist Counselor 
7) Surgical & Operation Theatre Roles 
OT Manager Surgeon 
Assistant Scrub Nurse 
Circulating Nurse 
OT Technician 
Anesthesia Technician 
8) Diagnostics & Laboratory Roles 
Laboratory Pathologist 
Microbiologist 
Biochemist Lab 
Technician Lab 
Assistant Phlebotomist 
Imaging Radiologist 
Radiology Technician 
MRI Technician 
CT Scan Technician 
Ultrasound Technician 
9) Pharmacy Roles 
Chief Pharmacist 
Clinical Pharmacist 
Pharmacist 
Pharmacy Technician 
Pharmacy Assistant 
10) Patient Care & Coordination 
Care Coordinator 
Case Manager 
Patient Counselor 
Medical Social Worker 
Patient Relationship Manager 
11) Medical Records & Health 
Information Medical Records Officer (MRO) 
Health Information Manager (HIM) 
Medical Coder Medical Transcriptionist 
12) Administrative & Office Roles 
Hospital Administrator 
Front Desk Executive / Receptionist 
Admission Officer & Appointment Scheduler 
Discharge Coordinator 
HR Manager 
HR Executive 
Training Coordinator 
13) Finance, Billing & Insurance 
Billing Executive 
Accounts Manager 
Accountant Insurance 
Coordinator TPA 
Coordinator Claims
Processing Officer 
14) Operations & Facility Management 
Operations Manager 
Facility Manager 
Maintenance Engineer 
Electrician 
Plumber 
HVAC Technician 
15) Biomedical & Technical Support 
Biomedical Engineer 
Biomedical Technician 
Medical Equipment Technician 
16) IT & Digital Health Roles (Hospital Internal) 
IT Administrator System 
Administrator Network 
Administrator Helpdesk Support 
Application Support Engineer 
EHR System Operator 
17) Security & Safety (Physical) 
Security Manager (Physical)
Security Guard 
Surveillance Operator (CCTV) 
Fire Safety Officer 
18) Infection Control & Quality 
Infection Control Officer 
Infection Control Nurse 
Quality Manager 
Quality Analyst 
Accreditation Coordinator (NABH, JCI, etc.) 
19) Legal, Ethics & Compliance (Hospital Internal) 
Legal Advisor 
Ethics Committee Member 
Legal Compliance Officer 
Legal Risk Manager 
20) Logistics & Supply Chain 
Procurement Manager 
Procurement Officer 
Inventory Manager 
Storekeeper (Medical Store) 
Storekeeper (Non-Medical Store) 
Supply Chain Coordinator 
21) Support & Non-Clinical 
Staff Ward 
Assistant Transport Staff (Patient Transport) 
Ambulance Driver 
Ambulance Paramedic 
Housekeeping Staff 
Laundry Staff
Kitchen Staff / Diet Kitchen Worker 
22) Emergency & Field Roles 
Paramedic Emergency 
Medical Technician (EMT) 
Ambulance Coordinator 
23) Research & Clinical Trials 
Clinical Researcher Principal Investigator (PI) 
Trial Coordinator 
Research Nurse 
Data Manager (Clinical Trials) 
24) Telemedicine & Remote Care 
Telemedicine Doctor 
Remote Consultant 
Telehealth Coordinator 
25) External Interaction Roles (Human but Outside Org) 
External Auditor 
Regulatory Inspector
Insurance Representative 
Third-Party Vendor Staff 
26) Rare but Real Roles 
Organ Transplant Coordinator 
Mortuary Staff 
Forensic Specialist 
Blood Bank Officer 
Blood Bank Technician 
Pain Management Specialist 
Palliative Care Specialist 
Genetic Counselor 
27) Compliance & Governance Roles 
Information Security Compliance Officer - Ensure regulatory adherence Manage audits 
Information Security Risk Manager - Conduct risk assessments Maintain risk register 
Data Protection Officer (DPO) - GDPR compliance Data privacy governance 
Internal Auditor - Audit controls Validate compliance mapping 
28) DevSecOps & Engineering Roles - These build and maintain the platform. 
DevOps Engineer - CI/CD pipelines Infrastructure automation 
DevSecOps Engineer - Integrate security into pipelines Automate compliance checks 
Software Developer - Build APIs and services Implement secure coding practices 
QA / Test Engineer - Functional + security testing 
29) Cloud & Infrastructure Roles - Manage underlying cloud platform. 
Platform Engineer - Maintain Kubernetes / container platform Network Engineer Implement micro-segmentation Manage VPCs / zero trust network 
30) Data & AI Roles 
Data Engineer - Build data pipelines Ensure secure data flow 
Data Analyst - Analyze healthcare insights 
AI/ML Engineer - Develop models (risk scoring, anomaly detection) 
AI Governance Officer  -Ensure ethical and compliant AI usage 
31) SRE / Operations Roles Ensure availability and reliability. 
Site Reliability Engineer (SRE) - Monitor uptime Handle incidents
IT Operations Manager - Oversee system health and SLAs 
33) Device & System Roles (Non-Human Actors) - Critical in Zero Trust. 
IoMT Device (Medical Devices) - Send patient data Must be authenticated and validated 
Service Accounts  -API-to-API communication 
Automation Bots - CI/CD pipelines Monitoring agents 
34) Super Admin / Platform Owner System 
Super Administrator Global control across tenants Override capabilities
35) Identity & Access Management (IAM) - Roles Critical for Zero Trust enforcement. 
IAM Administrator - Define roles (RBAC/ABAC) - Configure access policies Manage MFA Access Reviewer / Approver Approve access requests Conduct periodic reviews 
Privileged Access Manager (PAM Operator) - Control elevated access sessions Monitor admin activities 
36) Security Operations Roles - Responsible for threat detection and response. 
Security Analyst (SOC Analyst) - Monitor alerts (SIEM) Investigate incidents 
Security Engineer - Implement security controls Configure firewalls, EDR, ZTA policies 
Incident Responder  - Handle breaches Perform containment and recovery 
Threat Intelligence  - Analyst Analyze attack patterns Feed detection systems




