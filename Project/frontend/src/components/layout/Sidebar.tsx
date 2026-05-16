'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/store/ui.store';
import { useAuth } from '@/hooks/useAuth';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { ROUTES } from '@/utils/constants';
import {
  Activity, Users, Stethoscope, Pill, Calendar, CreditCard, FileText, UserCog, Package, Cpu,
  Shield, ClipboardList, BarChart3, Video, Building2, Monitor, Lock, Gavel, Siren, Heart,
  Scissors, Thermometer, Droplets, Bug, ChevronLeft, ChevronRight, Home, Settings, CheckSquare,
  AlertTriangle, Bed, Server, Database, Network, Flame, Crosshair, KeyRound, Eye, ScrollText,
  IndianRupee, Wallet, Receipt, BookCheck, Scale, FileSearch, ShieldCheck,
  Boxes, GitBranch, Gauge, Wrench, FlaskConical,
  Megaphone, Filter, Share2,
  HeartPulse, Target, ShieldAlert,
  ArrowLeftRight, Crown, Zap, Box, TestTube, Truck, HeartHandshake,
  LineChart, Droplet, FileSignature, Clock, ListTodo, BookOpen, MessageSquare,
  MapPin, GitMerge, BellRing, Baby, GitPullRequest, TrendingDown, TrendingUp,
  Code2, XCircle, Map, ListChecks, PlayCircle, Lightbulb, BrainCircuit, BoxSelect, Workflow,
  CheckCircle2, Key, Bot, RotateCw, Combine,
  Terminal, Globe, Plug, Layers, GraduationCap, History, Award,
  Flag, Sliders, Radar, PlaneTakeoff, LifeBuoy,
  LayoutGrid, Briefcase, Trash2, Fingerprint, Send, Search, Apple, LogOut, Wind, FileWarning,
  Navigation, Landmark, Sparkles, Utensils, PieChart, FileCheck, UserCheck, MoveDown, FileBadge,
  ClipboardCheck, MoveUp, List, Store, Skull, Star,
  type LucideIcon,
} from 'lucide-react';

interface NavItem { icon: LucideIcon; label: string; href: string; roles?: string[]; }
interface NavSection { title: string; items: NavItem[]; }

const boardSections: NavSection[] = [
  { title: 'Executive Insights', items: [
    { icon: BarChart3, label: 'Dashboard', href: ROUTES.BOARD_DASHBOARD },
    { icon: CreditCard, label: 'Financial Intelligence', href: ROUTES.BOARD_FINANCIAL },
    { icon: Stethoscope, label: 'Clinical Quality', href: ROUTES.BOARD_CLINICAL },
    { icon: Activity, label: 'Operations Summary', href: ROUTES.BOARD_OPERATIONS },
    { icon: Shield, label: 'Risk & Compliance', href: ROUTES.BOARD_COMPLIANCE },
    { icon: FileText, label: 'Strategic Reports', href: ROUTES.BOARD_REPORTS },
  ]},
  { title: 'System (Read Only)', items: [
    { icon: ClipboardList, label: 'Audit Overview', href: ROUTES.BOARD_AUDIT },
    { icon: Users, label: 'Access Overview', href: ROUTES.BOARD_ACCESS },
  ]}
];

const ceoSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Home, label: 'CEO Dashboard', href: ROUTES.CEO_DASHBOARD },
  ]},
  { title: 'Operations', items: [
    { icon: Activity, label: 'Command Center', href: ROUTES.CEO_OPERATIONS },
    { icon: Thermometer, label: 'ICU Monitoring', href: ROUTES.CEO_ICU },
  ]},
  { title: 'Execution', items: [
    { icon: CheckSquare, label: 'Task Center', href: ROUTES.CEO_TASKS },
    { icon: AlertTriangle, label: 'Escalations', href: ROUTES.CEO_ESCALATIONS },
  ]},
  { title: 'Performance', items: [
    { icon: CreditCard, label: 'Financial', href: ROUTES.CEO_FINANCIAL },
    { icon: Stethoscope, label: 'Clinical', href: ROUTES.CEO_CLINICAL },
  ]},
  { title: 'Governance', items: [
    { icon: Shield, label: 'Risk & Compliance', href: ROUTES.CEO_COMPLIANCE },
    { icon: FileText, label: 'Reports', href: ROUTES.CEO_REPORTS },
  ]}
];

const cooSections: NavSection[] = [
  { title: 'Command Center', items: [
    { icon: Activity, label: 'Operations Dashboard', href: ROUTES.COO_DASHBOARD },
  ]},
  { title: 'Patient Flow', items: [
    { icon: Users, label: 'Admissions & Discharges', href: ROUTES.COO_PATIENT_FLOW },
    { icon: Bed, label: 'Bed Management', href: ROUTES.COO_BEDS },
  ]},
  { title: 'Clinical Ops', items: [
    { icon: Thermometer, label: 'ICU Operations', href: ROUTES.COO_ICU },
    { icon: Heart, label: 'Nursing Operations', href: ROUTES.COO_NURSING },
    { icon: Scissors, label: 'OT Management', href: ROUTES.COO_OT },
  ]},
  { title: 'Resources', items: [
    { icon: UserCog, label: 'Staff Allocation', href: ROUTES.COO_STAFF },
    { icon: Monitor, label: 'Equipment Status', href: ROUTES.COO_EQUIPMENT },
  ]},
  { title: 'Execution', items: [
    { icon: AlertTriangle, label: 'Bottlenecks & Alerts', href: ROUTES.COO_ALERTS },
    { icon: CheckSquare, label: 'Task Execution', href: ROUTES.COO_TASKS },
  ]}
];

const cmoSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Stethoscope, label: 'Clinical Dashboard', href: ROUTES.CMO_DASHBOARD },
  ]},
  { title: 'Quality & Safety', items: [
    { icon: Activity, label: 'Outcomes', href: ROUTES.CMO_OUTCOMES },
    { icon: Bug, label: 'Infection Control', href: ROUTES.CMO_INFECTION },
    { icon: AlertTriangle, label: 'Mortality Review', href: ROUTES.CMO_MORTALITY },
  ]},
  { title: 'Clinical Governance', items: [
    { icon: ClipboardList, label: 'Case Audits', href: ROUTES.CMO_AUDIT },
    { icon: Shield, label: 'Protocol Compliance', href: ROUTES.CMO_COMPLIANCE },
  ]},
  { title: 'Care Delivery', items: [
    { icon: Heart, label: 'Critical Care (ICU)', href: ROUTES.CMO_ICU },
    { icon: Monitor, label: 'Diagnostics Quality', href: ROUTES.CMO_DIAGNOSTICS },
    { icon: Siren, label: 'High-Risk Monitoring', href: ROUTES.CMO_RISK },
  ]}
];

const cnoSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Heart, label: 'Nursing Dashboard', href: ROUTES.CNO_DASHBOARD },
  ]},
  { title: 'Care Delivery', items: [
    { icon: CheckSquare, label: 'Nursing Tasks', href: ROUTES.CNO_TASKS },
    { icon: Users, label: 'Care Tracking', href: ROUTES.CNO_CARE },
    { icon: Activity, label: 'Vitals Monitoring', href: ROUTES.CNO_VITALS },
  ]},
  { title: 'Staff Management', items: [
    { icon: UserCog, label: 'Staff Allocation', href: ROUTES.CNO_STAFFING },
    { icon: Calendar, label: 'Shift Management', href: ROUTES.CNO_SHIFTS },
  ]},
  { title: 'Critical Care', items: [
    { icon: Thermometer, label: 'ICU Nursing', href: ROUTES.CNO_ICU },
    { icon: Siren, label: 'ER Nursing', href: ROUTES.CNO_ER },
  ]},
  { title: 'Governance', items: [
    { icon: Shield, label: 'Missed Care', href: ROUTES.CNO_COMPLIANCE },
    { icon: AlertTriangle, label: 'Care Alerts', href: ROUTES.CNO_ALERTS },
    { icon: FileText, label: 'Nursing Reports', href: ROUTES.CNO_REPORTS },
  ]}
];

const cioSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Monitor, label: 'IT Dashboard', href: ROUTES.CIO_DASHBOARD },
  ]},
  { title: 'Systems', items: [
    { icon: Server, label: 'Services Health', href: ROUTES.CIO_SERVICES },
    { icon: Cpu, label: 'Infrastructure', href: ROUTES.CIO_INFRA },
  ]},
  { title: 'Data', items: [
    { icon: Database, label: 'Data Pipelines', href: ROUTES.CIO_DATA },
  ]},
  { title: 'Integrations', items: [
    { icon: Network, label: 'Integrations', href: ROUTES.CIO_INTEGRATIONS },
  ]},
  { title: 'Operations', items: [
    { icon: Flame, label: 'Incident Management', href: ROUTES.CIO_INCIDENTS },
    { icon: Activity, label: 'Deployments', href: ROUTES.CIO_DEPLOYMENTS },
  ]},
  { title: 'Governance', items: [
    { icon: Shield, label: 'IT Governance', href: ROUTES.CIO_GOVERNANCE },
  ]}
];

const cisoSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Shield, label: 'Security Dashboard', href: ROUTES.CISO_DASHBOARD },
  ]},
  { title: 'Threats', items: [
    { icon: Crosshair, label: 'Threat Monitoring', href: ROUTES.CISO_THREATS },
    { icon: Eye, label: 'Anomaly Detection', href: ROUTES.CISO_ANOMALIES },
    { icon: Radar, label: 'UEBA Intelligence', href: ROUTES.CISO_UEBA },
  ]},
  { title: 'Identity & Access', items: [
    { icon: KeyRound, label: 'Users & Roles', href: ROUTES.CISO_IAM },
    { icon: ScrollText, label: 'Access Logs', href: ROUTES.CISO_LOGS },
  ]},
  { title: 'Compliance', items: [
    { icon: Gavel, label: 'Compliance Status', href: ROUTES.CISO_COMPLIANCE },
  ]},
  { title: 'Incidents', items: [
    { icon: Flame, label: 'Incident Response', href: ROUTES.CISO_INCIDENTS },
  ]},
  { title: 'Governance', items: [
    { icon: Lock, label: 'Security Policies', href: ROUTES.CISO_POLICIES },
    { icon: FileText, label: 'Security Reports', href: ROUTES.CISO_REPORTS },
  ]}
];

const cfoSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: IndianRupee, label: 'Financial Dashboard', href: ROUTES.CFO_DASHBOARD },
  ]},
  { title: 'Revenue', items: [
    { icon: Receipt, label: 'Billing & Revenue', href: ROUTES.CFO_BILLING },
    { icon: CreditCard, label: 'Payments', href: ROUTES.CFO_PAYMENTS },
  ]},
  { title: 'Cost', items: [
    { icon: Wallet, label: 'Cost & Expenses', href: ROUTES.CFO_COST },
  ]},
  { title: 'Insurance', items: [
    { icon: ClipboardList, label: 'Claims Management', href: ROUTES.CFO_CLAIMS },
  ]},
  { title: 'Cash Flow', items: [
    { icon: BarChart3, label: 'Inflow / Outflow', href: ROUTES.CFO_CASHFLOW },
  ]},
  { title: 'Governance', items: [
    { icon: Shield, label: 'Financial Compliance', href: ROUTES.CFO_COMPLIANCE },
    { icon: FileText, label: 'Reports & Forecasting', href: ROUTES.CFO_REPORTS },
  ]}
];

const ccoSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: BookCheck, label: 'Compliance Dashboard', href: ROUTES.CCO_DASHBOARD },
  ]},
  { title: 'Audits', items: [
    { icon: ClipboardList, label: 'Audit Management', href: ROUTES.CCO_AUDITS },
    { icon: FileText, label: 'Audit Reports', href: ROUTES.CCO_AUDIT_REPORTS },
  ]},
  { title: 'Policies', items: [
    { icon: Scale, label: 'Policies & SOPs', href: ROUTES.CCO_POLICIES },
  ]},
  { title: 'Violations', items: [
    { icon: AlertTriangle, label: 'Violations Tracker', href: ROUTES.CCO_VIOLATIONS },
    { icon: CheckSquare, label: 'Corrective Actions', href: ROUTES.CCO_ACTIONS },
  ]},
  { title: 'Documentation', items: [
    { icon: FileSearch, label: 'Records & Evidence', href: ROUTES.CCO_DOCUMENTS },
  ]},
  { title: 'Governance', items: [
    { icon: Shield, label: 'Risk Monitoring', href: ROUTES.CCO_MONITORING },
    { icon: BarChart3, label: 'Compliance Reports', href: ROUTES.CCO_REPORTS },
  ]}
];

const ctoSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Boxes, label: 'Engineering Dashboard', href: ROUTES.CTO_DASHBOARD },
  ]},
  { title: 'Architecture', items: [
    { icon: Network, label: 'Service Map', href: ROUTES.CTO_ARCHITECTURE },
  ]},
  { title: 'Development', items: [
    { icon: GitBranch, label: 'Repositories', href: ROUTES.CTO_REPOS },
  ]},
  { title: 'Pipelines', items: [
    { icon: Server, label: 'CI/CD Pipelines', href: ROUTES.CTO_PIPELINES },
  ]},
  { title: 'Performance', items: [
    { icon: Gauge, label: 'Latency & Throughput', href: ROUTES.CTO_PERFORMANCE },
  ]},
  { title: 'Tech Debt', items: [
    { icon: Wrench, label: 'Debt Backlog', href: ROUTES.CTO_TECH_DEBT },
  ]},
  { title: 'Innovation', items: [
    { icon: FlaskConical, label: 'Feature Flags', href: ROUTES.CTO_FEATURES },
    { icon: FileText, label: 'Engineering Reports', href: ROUTES.CTO_REPORTS },
  ]}
];

const marketingSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Megaphone, label: 'Marketing Dashboard', href: ROUTES.MARKETING_DASHBOARD },
  ]},
  { title: 'Campaigns', items: [
    { icon: Megaphone, label: 'Campaign Management', href: ROUTES.MARKETING_CAMPAIGNS },
    { icon: BarChart3, label: 'Campaign Performance', href: ROUTES.MARKETING_PERFORMANCE },
  ]},
  { title: 'Funnel', items: [
    { icon: Filter, label: 'Lead Funnel', href: ROUTES.MARKETING_FUNNEL },
    { icon: Users, label: 'Patient Acquisition', href: ROUTES.MARKETING_ACQUISITION },
  ]},
  { title: 'Channels', items: [
    { icon: Share2, label: 'Channel Performance', href: ROUTES.MARKETING_CHANNELS },
  ]},
  { title: 'Brand', items: [
    { icon: Heart, label: 'Brand Analytics', href: ROUTES.MARKETING_BRAND },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'Marketing Reports', href: ROUTES.MARKETING_REPORTS },
  ]}
];

const medDirectorSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: HeartPulse, label: 'Clinical Dashboard', href: ROUTES.MED_DIR_DASHBOARD },
  ]},
  { title: 'Departments', items: [
    { icon: Building2, label: 'Units Performance', href: ROUTES.MED_DIR_DEPARTMENTS },
  ]},
  { title: 'Quality', items: [
    { icon: Target, label: 'Outcomes & KPIs', href: ROUTES.MED_DIR_OUTCOMES },
  ]},
  { title: 'Patient Safety', items: [
    { icon: ShieldAlert, label: 'Safety Incidents', href: ROUTES.MED_DIR_SAFETY },
  ]},
  { title: 'Protocols', items: [
    { icon: ScrollText, label: 'Guidelines & SOPs', href: ROUTES.MED_DIR_PROTOCOLS },
  ]},
  { title: 'Governance', items: [
    { icon: Shield, label: 'NABH / JCI', href: ROUTES.MED_DIR_COMPLIANCE },
    { icon: ClipboardList, label: 'Clinical Audits', href: ROUTES.MED_DIR_AUDITS },
    { icon: FileText, label: 'Executive Reports', href: ROUTES.MED_DIR_REPORTS },
  ]}
];

const superintendentSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Operations Dashboard', href: ROUTES.SUPER_DASHBOARD },
  ]},
  { title: 'Patient Flow', items: [
    { icon: ArrowLeftRight, label: 'Admissions & Discharges', href: ROUTES.SUPER_PATIENT_FLOW },
  ]},
  { title: 'Clinical Ops', items: [
    { icon: Bed, label: 'Ward Management', href: ROUTES.SUPER_WARDS },
    { icon: HeartPulse, label: 'ICU Coordination', href: ROUTES.SUPER_ICU },
    { icon: Scissors, label: 'OT Coordination', href: ROUTES.SUPER_OT },
  ]},
  { title: 'Staff', items: [
    { icon: Users, label: 'Staff Coordination', href: ROUTES.SUPER_STAFF },
  ]},
  { title: 'Quality', items: [
    { icon: ShieldAlert, label: 'Incidents & Complaints', href: ROUTES.SUPER_INCIDENTS },
    { icon: AlertTriangle, label: 'Critical Alerts', href: ROUTES.SUPER_ALERTS },
  ]},
  { title: 'Tasks', items: [
    { icon: CheckSquare, label: 'Task Management', href: ROUTES.SUPER_TASKS },
    { icon: FileText, label: 'Daily Reports', href: ROUTES.SUPER_REPORTS },
  ]}
];

const deputyMSSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Execution Dashboard', href: ROUTES.DEPUTY_DASHBOARD },
  ]},
  { title: 'Patient Flow', items: [
    { icon: ArrowLeftRight, label: 'Admissions Queue', href: ROUTES.DEPUTY_PATIENT_FLOW },
  ]},
  { title: 'Ward Ops', items: [
    { icon: Bed, label: 'Ward Monitoring', href: ROUTES.DEPUTY_WARDS },
    { icon: Bed, label: 'Bed Allocation', href: ROUTES.DEPUTY_BEDS },
  ]},
  { title: 'Critical Care', items: [
    { icon: HeartPulse, label: 'ICU Coordination', href: ROUTES.DEPUTY_ICU },
    { icon: Siren, label: 'ER Flow', href: ROUTES.DEPUTY_ER },
  ]},
  { title: 'Staff', items: [
    { icon: Users, label: 'Staff Assignment', href: ROUTES.DEPUTY_STAFF },
  ]},
  { title: 'Issues', items: [
    { icon: ShieldAlert, label: 'Complaints & Incidents', href: ROUTES.DEPUTY_INCIDENTS },
    { icon: AlertTriangle, label: 'Active Alerts', href: ROUTES.DEPUTY_ALERTS },
  ]},
  { title: 'Tasks', items: [
    { icon: CheckSquare, label: 'Task Board', href: ROUTES.DEPUTY_TASKS },
  ]}
];

const hodSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Department Dashboard', href: ROUTES.HOD_DASHBOARD },
  ]},
  { title: 'Patients', items: [
    { icon: Users, label: 'Active Patients', href: ROUTES.HOD_PATIENTS },
    { icon: ClipboardList, label: 'Case Management', href: ROUTES.HOD_CASES },
  ]},
  { title: 'Clinical', items: [
    { icon: Stethoscope, label: 'Clinical Records', href: ROUTES.HOD_CLINICAL },
    { icon: FlaskConical, label: 'Diagnostics', href: ROUTES.HOD_DIAGNOSTICS },
  ]},
  { title: 'Operations', items: [
    { icon: Calendar, label: 'Scheduling & OT', href: ROUTES.HOD_SCHEDULING },
    { icon: UserCog, label: 'Staff Management', href: ROUTES.HOD_STAFF },
  ]},
  { title: 'Quality', items: [
    { icon: Target, label: 'Outcomes', href: ROUTES.HOD_OUTCOMES },
    { icon: AlertTriangle, label: 'Critical Alerts', href: ROUTES.HOD_ALERTS },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'Department Reports', href: ROUTES.HOD_REPORTS },
  ]}
];

const unitHeadSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Unit Dashboard', href: ROUTES.UNIT_DASHBOARD },
  ]},
  { title: 'Patient Monitoring', items: [
    { icon: Monitor, label: 'Live Patient Grid', href: ROUTES.UNIT_PATIENTS },
    { icon: Heart, label: 'Critical Patients', href: ROUTES.UNIT_CRITICAL },
  ]},
  { title: 'Clinical Data', items: [
    { icon: Thermometer, label: 'Vitals Monitoring', href: ROUTES.UNIT_VITALS },
    { icon: FlaskConical, label: 'Lab Results', href: ROUTES.UNIT_LABS },
  ]},
  { title: 'Interventions', items: [
    { icon: ClipboardList, label: 'Orders & Procedures', href: ROUTES.UNIT_ORDERS },
    { icon: Pill, label: 'Medication Tracking', href: ROUTES.UNIT_MEDICATIONS },
  ]},
  { title: 'Staff', items: [
    { icon: UserCog, label: 'Staff Allocation', href: ROUTES.UNIT_STAFF },
  ]},
  { title: 'Alerts', items: [
    { icon: Siren, label: 'Critical Alerts', href: ROUTES.UNIT_ALERTS },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'Unit Reports', href: ROUTES.UNIT_REPORTS },
  ]}
];

const doctorSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Doctor Dashboard', href: ROUTES.DOC_DASHBOARD },
  ]},
  { title: 'Patients', items: [
    { icon: Users, label: 'My Patients', href: ROUTES.DOC_PATIENTS },
  ]},
  { title: 'Clinical', items: [
    { icon: Stethoscope, label: 'Clinical Records', href: ROUTES.DOC_CLINICAL },
    { icon: FlaskConical, label: 'Lab & Imaging', href: ROUTES.DOC_DIAGNOSTICS },
  ]},
  { title: 'Orders', items: [
    { icon: Pill, label: 'Prescriptions & Orders', href: ROUTES.DOC_ORDERS },
  ]},
  { title: 'Schedule', items: [
    { icon: Calendar, label: 'Appointments & Rounds', href: ROUTES.DOC_SCHEDULE },
  ]},
  { title: 'Tasks', items: [
    { icon: CheckSquare, label: 'Pending Tasks', href: ROUTES.DOC_TASKS },
    { icon: FileText, label: 'Clinical Reports', href: ROUTES.DOC_REPORTS },
  ]}
];

const gpSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'GP Dashboard', href: ROUTES.GP_DASHBOARD },
  ]},
  { title: 'OPD Flow', items: [
    { icon: Users, label: 'Patient Queue', href: ROUTES.GP_QUEUE },
  ]},
  { title: 'Consultation', items: [
    { icon: Stethoscope, label: 'Current Patient', href: ROUTES.GP_CONSULTATION },
    { icon: FileText, label: 'Clinical Notes', href: ROUTES.GP_NOTES },
  ]},
  { title: 'Orders', items: [
    { icon: Pill, label: 'Prescriptions', href: ROUTES.GP_PRESCRIPTIONS },
    { icon: Share2, label: 'Specialist Referrals', href: ROUTES.GP_REFERRALS },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'Daily Summary', href: ROUTES.GP_REPORTS },
  ]}
];

const surgeonSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Surgeon Dashboard', href: ROUTES.SURGEON_DASHBOARD },
  ]},
  { title: 'Cases', items: [
    { icon: ClipboardList, label: 'Active Cases', href: ROUTES.SURGEON_CASES },
  ]},
  { title: 'Pre-Op', items: [
    { icon: FileText, label: 'Pre-Op Planning', href: ROUTES.SURGEON_PREOP },
  ]},
  { title: 'Intra-Op', items: [
    { icon: Calendar, label: 'OT Schedule', href: ROUTES.SURGEON_OT },
    { icon: Activity, label: 'Intra-Op Logs', href: ROUTES.SURGEON_INTRAOP },
  ]},
  { title: 'Post-Op', items: [
    { icon: Heart, label: 'Recovery Monitoring', href: ROUTES.SURGEON_POSTOP },
  ]},
  { title: 'Clinical', items: [
    { icon: FileText, label: 'Clinical Notes', href: ROUTES.SURGEON_NOTES },
    { icon: Share2, label: 'Surgical Reports', href: ROUTES.SURGEON_REPORTS },
  ]}
];

const erSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'ER Dashboard', href: ROUTES.ER_DASHBOARD },
  ]},
  { title: 'Triage', items: [
    { icon: Users, label: 'Incoming Patients', href: ROUTES.ER_TRIAGE },
  ]},
  { title: 'Patients', items: [
    { icon: ClipboardList, label: 'Active Cases', href: ROUTES.ER_PATIENTS },
  ]},
  { title: 'Clinical', items: [
    { icon: Stethoscope, label: 'Quick Notes', href: ROUTES.ER_CLINICAL },
  ]},
  { title: 'Orders', items: [
    { icon: Pill, label: 'Emergency Orders', href: ROUTES.ER_ORDERS },
  ]},
  { title: 'Coordination', items: [
    { icon: Share2, label: 'ICU / OT Requests', href: ROUTES.ER_COORDINATION },
  ]},
  { title: 'Alerts', items: [
    { icon: Siren, label: 'Critical Alerts', href: ROUTES.ER_ALERTS },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'ER Summary', href: ROUTES.ER_REPORTS },
  ]}
];

const intensivistSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Critical Review', href: ROUTES.INTENSIVIST_DASHBOARD },
  ]},
  { title: 'Cases', items: [
    { icon: ClipboardList, label: 'Assigned Consults', href: ROUTES.INTENSIVIST_CASES },
  ]},
  { title: 'Clinical Data', items: [
    { icon: LineChart, label: 'Vitals Trends', href: ROUTES.INTENSIVIST_VITALS },
    { icon: Droplet, label: 'Lab Results', href: ROUTES.INTENSIVIST_LABS },
  ]},
  { title: 'Interventions', items: [
    { icon: Activity, label: 'Active Treatments', href: ROUTES.INTENSIVIST_INTERVENTIONS },
  ]},
  { title: 'Reviews', items: [
    { icon: FileSignature, label: 'Recommendations', href: ROUTES.INTENSIVIST_RECOMMENDATIONS },
    { icon: FileText, label: 'Case Notes', href: ROUTES.INTENSIVIST_CASE_REVIEW },
  ]},
  { title: 'Alerts', items: [
    { icon: Siren, label: 'Critical Alerts', href: ROUTES.INTENSIVIST_ALERTS },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'Case Summaries', href: ROUTES.INTENSIVIST_REPORTS },
  ]}
];

const locumSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Shift Dashboard', href: ROUTES.LOCUM_DASHBOARD },
  ]},
  { title: 'Patients', items: [
    { icon: Users, label: 'Assigned Patients', href: ROUTES.LOCUM_PATIENTS },
  ]},
  { title: 'Clinical', items: [
    { icon: FileText, label: 'Patient Summary', href: ROUTES.LOCUM_SUMMARY },
    { icon: FileSignature, label: 'Clinical Notes', href: ROUTES.LOCUM_NOTES },
  ]},
  { title: 'Orders', items: [
    { icon: Pill, label: 'Orders & Prescriptions', href: ROUTES.LOCUM_ORDERS },
  ]},
  { title: 'Handover', items: [
    { icon: Share2, label: 'Handover Dashboard', href: ROUTES.LOCUM_HANDOVER },
    { icon: CheckSquare, label: 'Pending Tasks', href: ROUTES.LOCUM_TASKS },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'Shift Summary', href: ROUTES.LOCUM_REPORTS },
  ]}
];

const residentSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Execution Dashboard', href: ROUTES.RESIDENT_DASHBOARD },
  ]},
  { title: 'Tasks', items: [
    { icon: CheckSquare, label: 'Task Board', href: ROUTES.RESIDENT_TASKS },
  ]},
  { title: 'Patients', items: [
    { icon: Users, label: 'My Patients', href: ROUTES.RESIDENT_PATIENTS },
    { icon: ClipboardList, label: 'Patient Detail', href: ROUTES.RESIDENT_PATIENT_DETAIL },
  ]},
  { title: 'Clinical', items: [
    { icon: FileSignature, label: 'Clinical Notes', href: ROUTES.RESIDENT_NOTES },
  ]},
  { title: 'Execution', items: [
    { icon: Pill, label: 'Orders Execution', href: ROUTES.RESIDENT_ORDERS },
    { icon: Clock, label: 'Daily Rounds', href: ROUTES.RESIDENT_ROUNDS },
  ]},
  { title: 'Escalations', items: [
    { icon: Siren, label: 'Alerts & Escalations', href: ROUTES.RESIDENT_ALERTS },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'Shift Reports', href: ROUTES.RESIDENT_REPORTS },
  ]}
];

const jrSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'JR Dashboard', href: ROUTES.JR_DASHBOARD },
  ]},
  { title: 'Tasks', items: [
    { icon: ListTodo, label: 'Assigned Tasks', href: ROUTES.JR_TASKS },
    { icon: CheckSquare, label: 'Guided Execution', href: ROUTES.JR_TASK_EXECUTION },
  ]},
  { title: 'Patients', items: [
    { icon: Users, label: 'My Patients', href: ROUTES.JR_PATIENTS },
  ]},
  { title: 'Clinical', items: [
    { icon: FileSignature, label: 'Basic Notes', href: ROUTES.JR_NOTES },
    { icon: Clock, label: 'Assisted Rounds', href: ROUTES.JR_ROUNDS },
  ]},
  { title: 'Learning', items: [
    { icon: BookOpen, label: 'Protocols & Guides', href: ROUTES.JR_LEARNING },
  ]},
  { title: 'Escalations', items: [
    { icon: Siren, label: 'Supervisor Alerts', href: ROUTES.JR_ALERTS },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'Daily Summary', href: ROUTES.JR_REPORTS },
  ]}
];

const srSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'SR Dashboard', href: ROUTES.SR_DASHBOARD },
  ]},
  { title: 'Patients', items: [
    { icon: Users, label: 'Ward Patients', href: ROUTES.SR_PATIENTS },
    { icon: ClipboardList, label: 'Patient Detail', href: ROUTES.SR_PATIENT_DETAIL },
  ]},
  { title: 'Team & Tasks', items: [
    { icon: CheckSquare, label: 'Delegation Board', href: ROUTES.SR_TASKS },
    { icon: Users, label: 'My Team', href: ROUTES.SR_TEAM },
  ]},
  { title: 'Clinical', items: [
    { icon: FileSignature, label: 'Clinical Notes', href: ROUTES.SR_NOTES },
    { icon: Clock, label: 'Rounds Management', href: ROUTES.SR_ROUNDS },
  ]},
  { title: 'Orders', items: [
    { icon: Pill, label: 'Orders Management', href: ROUTES.SR_ORDERS },
  ]},
  { title: 'Escalations', items: [
    { icon: Siren, label: 'Critical Alerts', href: ROUTES.SR_ALERTS },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'Shift Reports', href: ROUTES.SR_REPORTS },
  ]}
];

const internSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Learning Dashboard', href: ROUTES.INTERN_DASHBOARD },
  ]},
  { title: 'Patients & Tasks', items: [
    { icon: Users, label: 'Assigned Patients', href: ROUTES.INTERN_PATIENTS },
    { icon: ClipboardList, label: 'Assisted Tasks', href: ROUTES.INTERN_TASKS },
  ]},
  { title: 'Clinical Practice', items: [
    { icon: FileSignature, label: 'Draft Notes', href: ROUTES.INTERN_NOTES },
    { icon: Clock, label: 'Assisted Rounds', href: ROUTES.INTERN_ROUNDS },
  ]},
  { title: 'Education', items: [
    { icon: BookOpen, label: 'Contextual Learning', href: ROUTES.INTERN_LEARNING },
    { icon: MessageSquare, label: 'Supervisor Feedback', href: ROUTES.INTERN_FEEDBACK },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'Learning Summary', href: ROUTES.INTERN_REPORTS },
  ]}
];

const studentSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Learning Dashboard', href: ROUTES.STUDENT_DASHBOARD },
  ]},
  { title: 'Clinical Cases', items: [
    { icon: ClipboardList, label: 'Case Observations', href: ROUTES.STUDENT_CASES },
    { icon: Eye, label: 'Case Learning View', href: ROUTES.STUDENT_CASE_VIEW },
    { icon: FileSignature, label: 'Clinical Notes', href: ROUTES.STUDENT_NOTES },
  ]},
  { title: 'Academics', items: [
    { icon: BookOpen, label: 'Academic Modules', href: ROUTES.STUDENT_ACADEMIC },
    { icon: MessageSquare, label: 'Case Discussions', href: ROUTES.STUDENT_DISCUSSION },
    { icon: Target, label: 'Assessments', href: ROUTES.STUDENT_ASSESSMENT },
  ]},
  { title: 'Progress', items: [
    { icon: MessageSquare, label: 'Feedback', href: ROUTES.STUDENT_FEEDBACK },
    { icon: FileText, label: 'Learning Reports', href: ROUTES.STUDENT_REPORTS },
  ]}
];

const nursingSupSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Nursing Command', href: ROUTES.NURSING_SUP_DASHBOARD },
  ]},
  { title: 'Workforce', items: [
    { icon: Users, label: 'Staff Directory', href: ROUTES.NURSING_SUP_STAFF },
    { icon: Calendar, label: 'Shift Scheduling', href: ROUTES.NURSING_SUP_SHIFTS },
  ]},
  { title: 'Operations', items: [
    { icon: ClipboardList, label: 'Ward Coverage', href: ROUTES.NURSING_SUP_WARDS },
    { icon: CheckSquare, label: 'Nurse Allocation', href: ROUTES.NURSING_SUP_ALLOCATION },
  ]},
  { title: 'Quality & Incidents', items: [
    { icon: Target, label: 'Patient Care', href: ROUTES.NURSING_SUP_CARE },
    { icon: ShieldAlert, label: 'Incidents', href: ROUTES.NURSING_SUP_INCIDENTS },
  ]},
  { title: 'Alerts & Reports', items: [
    { icon: Siren, label: 'Workforce Alerts', href: ROUTES.NURSING_SUP_ALERTS },
    { icon: FileText, label: 'Nursing Reports', href: ROUTES.NURSING_SUP_REPORTS },
  ]}
];

const deputyNursingSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Execution Dashboard', href: ROUTES.DEPUTY_NURSING_DASHBOARD },
  ]},
  { title: 'Workforce', items: [
    { icon: Users, label: 'Available Staff', href: ROUTES.DEPUTY_NURSING_STAFF },
    { icon: Calendar, label: 'Shift Execution', href: ROUTES.DEPUTY_NURSING_SHIFTS },
  ]},
  { title: 'Operations', items: [
    { icon: ClipboardList, label: 'Ward Status', href: ROUTES.DEPUTY_NURSING_WARDS },
    { icon: AlertTriangle, label: 'Coverage Gaps', href: ROUTES.DEPUTY_NURSING_GAPS },
  ]},
  { title: 'Quality & Incidents', items: [
    { icon: CheckSquare, label: 'Task Delays', href: ROUTES.DEPUTY_NURSING_TASKS },
    { icon: ShieldAlert, label: 'Incident Handling', href: ROUTES.DEPUTY_NURSING_INCIDENTS },
  ]},
  { title: 'Alerts & Reports', items: [
    { icon: Siren, label: 'Active Alerts', href: ROUTES.DEPUTY_NURSING_ALERTS },
    { icon: FileText, label: 'Shift Reports', href: ROUTES.DEPUTY_NURSING_REPORTS },
  ]}
];

const wardInChargeSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Ward Dashboard', href: ROUTES.WARD_DASHBOARD },
  ]},
  { title: 'Ward Control', items: [
    { icon: Users, label: 'Ward Patients', href: ROUTES.WARD_PATIENTS },
    { icon: Users, label: 'Staff Management', href: ROUTES.WARD_STAFF },
  ]},
  { title: 'Care Execution', items: [
    { icon: ClipboardList, label: 'Task Board', href: ROUTES.WARD_TASKS },
    { icon: Target, label: 'Care Management', href: ROUTES.WARD_CARE },
    { icon: CheckSquare, label: 'Ward Rounds', href: ROUTES.WARD_ROUNDS },
  ]},
  { title: 'Incidents & Alerts', items: [
    { icon: ShieldAlert, label: 'Incident Reports', href: ROUTES.WARD_INCIDENTS },
    { icon: Siren, label: 'Critical Alerts', href: ROUTES.WARD_ALERTS },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'Ward Reports', href: ROUTES.WARD_REPORTS },
  ]}
];

const nurseSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Nurse Workspace', href: ROUTES.NURSE_DASHBOARD },
  ]},
  { title: 'Execution', items: [
    { icon: ClipboardList, label: 'My Tasks', href: ROUTES.NURSE_TASKS },
    { icon: Users, label: 'My Patients', href: ROUTES.NURSE_PATIENTS },
  ]},
  { title: 'Care Delivery', items: [
    { icon: ShieldCheck, label: 'Medication', href: ROUTES.NURSE_MEDICATION },
    { icon: Activity, label: 'Vitals', href: ROUTES.NURSE_VITALS },
    { icon: FileText, label: 'Procedures', href: ROUTES.NURSE_PROCEDURES },
    { icon: CheckSquare, label: 'Nursing Rounds', href: ROUTES.NURSE_ROUNDS },
  ]},
  { title: 'Safety', items: [
    { icon: Siren, label: 'Critical Alerts', href: ROUTES.NURSE_ALERTS },
    { icon: FileText, label: 'Shift Summary', href: ROUTES.NURSE_REPORTS },
  ]}
];

const icuNurseSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'ICU Workspace', href: ROUTES.ICU_NURSE_DASHBOARD },
  ]},
  { title: 'Monitoring', items: [
    { icon: Users, label: 'Patient Grid', href: ROUTES.ICU_NURSE_PATIENTS },
    { icon: Activity, label: 'Live Vitals', href: ROUTES.ICU_NURSE_VITALS },
  ]},
  { title: 'Interventions', items: [
    { icon: ClipboardList, label: 'Tasks & Meds', href: ROUTES.ICU_NURSE_CARE },
    { icon: ShieldCheck, label: 'Protocols', href: ROUTES.ICU_NURSE_TASKS },
  ]},
  { title: 'Critical Events', items: [
    { icon: Siren, label: 'Alerts & Alarms', href: ROUTES.ICU_NURSE_ALERTS },
    { icon: FileText, label: 'Shift Summary', href: ROUTES.ICU_NURSE_REPORTS },
  ]}
];

const erNurseSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'ER Workspace', href: ROUTES.ER_NURSE_DASHBOARD },
  ]},
  { title: 'Triage & Flow', items: [
    { icon: Users, label: 'Triage Queue', href: ROUTES.ER_NURSE_TRIAGE },
    { icon: Activity, label: 'Active Cases', href: ROUTES.ER_NURSE_PATIENTS },
    { icon: Droplet, label: 'Transfers', href: ROUTES.ER_NURSE_TRANSFER },
  ]},
  { title: 'Interventions', items: [
    { icon: HeartPulse, label: 'Emergency Care', href: ROUTES.ER_NURSE_CARE },
    { icon: ClipboardList, label: 'Tasks', href: ROUTES.ER_NURSE_TASKS },
  ]},
  { title: 'Safety & Handoff', items: [
    { icon: Siren, label: 'Critical Alerts', href: ROUTES.ER_NURSE_ALERTS },
    { icon: FileText, label: 'Shift Summary', href: ROUTES.ER_NURSE_REPORTS },
  ]}
];

const otNurseSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'OT Workspace', href: ROUTES.OT_NURSE_DASHBOARD },
    { icon: FileText, label: 'Surgery Schedule', href: ROUTES.OT_NURSE_SCHEDULE },
  ]},
  { title: 'Surgery Control', items: [
    { icon: Activity, label: 'Active Surgery', href: ROUTES.OT_NURSE_ACTIVE },
  ]},
  { title: 'Workflow', items: [
    { icon: ShieldCheck, label: 'Pre-Op Checklist', href: ROUTES.OT_NURSE_PREOP },
    { icon: ClipboardList, label: 'Intra-Op Tracking', href: ROUTES.OT_NURSE_INTRAOP },
    { icon: FileText, label: 'Post-Op Handover', href: ROUTES.OT_NURSE_POSTOP },
  ]},
  { title: 'Safety', items: [
    { icon: Siren, label: 'Safety Alerts', href: ROUTES.OT_NURSE_ALERTS },
    { icon: FileText, label: 'Surgery Reports', href: ROUTES.OT_NURSE_REPORTS },
  ]}
];

const triageNurseSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Triage Dashboard', href: ROUTES.TRIAGE_NURSE_DASHBOARD },
  ]},
  { title: 'Intake Flow', items: [
    { icon: Users, label: 'Incoming Queue', href: ROUTES.TRIAGE_NURSE_QUEUE },
    { icon: Activity, label: 'Patient Intake', href: ROUTES.TRIAGE_NURSE_INTAKE },
  ]},
  { title: 'Evaluation', items: [
    { icon: ClipboardList, label: 'Assessment Form', href: ROUTES.TRIAGE_NURSE_ASSESS },
    { icon: MapPin, label: 'Routing & Transfer', href: ROUTES.TRIAGE_NURSE_ROUTING },
  ]},
  { title: 'Safety', items: [
    { icon: Siren, label: 'Critical Alerts', href: ROUTES.TRIAGE_NURSE_ALERTS },
    { icon: FileText, label: 'Triage Reports', href: ROUTES.TRIAGE_NURSE_REPORTS },
  ]}
];

const icnSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'ICN Dashboard', href: ROUTES.ICN_DASHBOARD },
  ]},
  { title: 'Surveillance', items: [
    { icon: Users, label: 'Active Cases', href: ROUTES.ICN_CASES },
    { icon: MapPin, label: 'Infection Tracking', href: ROUTES.ICN_TRACKING },
  ]},
  { title: 'Analysis', items: [
    { icon: BarChart3, label: 'Analytics & Trends', href: ROUTES.ICN_ANALYTICS },
    { icon: ShieldCheck, label: 'Hygiene Compliance', href: ROUTES.ICN_COMPLIANCE },
  ]},
  { title: 'Incidents', items: [
    { icon: GitMerge, label: 'Outbreak Investigation', href: ROUTES.ICN_INVESTIGATION },
    { icon: Siren, label: 'Infection Alerts', href: ROUTES.ICN_ALERTS },
    { icon: FileText, label: 'Reports', href: ROUTES.ICN_REPORTS },
  ]}
];

const assistantSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Home, label: 'Dashboard', href: ROUTES.ASSISTANT_DASHBOARD },
  ]},
  { title: 'Tasks', items: [
    { icon: ClipboardList, label: 'My Tasks', href: ROUTES.ASSISTANT_TASKS },
    { icon: CheckSquare, label: 'Execution', href: ROUTES.ASSISTANT_EXECUTION },
  ]},
  { title: 'Care & Patients', items: [
    { icon: Users, label: 'Patients', href: ROUTES.ASSISTANT_PATIENTS },
    { icon: Activity, label: 'Care Modules', href: ROUTES.ASSISTANT_CARE },
  ]},
  { title: 'Communication', items: [
    { icon: BellRing, label: 'Alerts & Calls', href: ROUTES.ASSISTANT_ALERTS },
    { icon: FileText, label: 'Shift Summary', href: ROUTES.ASSISTANT_REPORTS },
  ]}
];

const anmSections: NavSection[] = [
  { title: 'Home', items: [
    { icon: Home, label: 'Dashboard', href: ROUTES.ANM_DASHBOARD },
  ]},
  { title: 'Community Care', items: [
    { icon: Users, label: 'Maternal Care', href: ROUTES.ANM_MATERNAL },
    { icon: Baby, label: 'Child Care', href: ROUTES.ANM_CHILD },
  ]},
  { title: 'Field Operations', items: [
    { icon: FileText, label: 'Visit Recording', href: ROUTES.ANM_VISITS },
    { icon: Calendar, label: 'Immunization', href: ROUTES.ANM_SCHEDULE },
  ]},
  { title: 'Alerts & Reports', items: [
    { icon: BellRing, label: 'Reminders', href: ROUTES.ANM_ALERTS },
    { icon: FileText, label: 'Health Reports', href: ROUTES.ANM_REPORTS },
  ]}
];

const sreSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'SRE Dashboard', href: ROUTES.SRE_DASHBOARD },
    { icon: Server, label: 'Applications', href: ROUTES.SRE_APPLICATIONS },
  ]},
  { title: 'Observability', items: [
    { icon: BarChart3, label: 'Metrics', href: ROUTES.SRE_METRICS },
    { icon: FileText, label: 'Logs', href: ROUTES.SRE_LOGS },
    { icon: Activity, label: 'Traces', href: ROUTES.SRE_TRACES },
  ]},
  { title: 'Reliability', items: [
    { icon: ShieldAlert, label: 'Active Incidents', href: ROUTES.SRE_INCIDENTS_ACTIVE },
    { icon: Clock, label: 'Incident History', href: ROUTES.SRE_INCIDENTS_HISTORY },
    { icon: Settings, label: 'SLO Targets', href: ROUTES.SRE_SLO_TARGETS },
  ]},
  { title: 'Operations', items: [
    { icon: BellRing, label: 'Alerts', href: ROUTES.SRE_NOTIFICATIONS },
    { icon: FileText, label: 'Runbooks', href: ROUTES.SRE_RUNBOOKS },
    { icon: FileText, label: 'Reliability Reports', href: ROUTES.SRE_REPORTS },
  ]}
];

const itOpsSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Ops Dashboard', href: ROUTES.ITOPS_DASHBOARD },
  ]},
  { title: 'Governance', items: [
    { icon: Server, label: 'System Health', href: ROUTES.ITOPS_SERVICES },
    { icon: Target, label: 'SLA Targets', href: ROUTES.ITOPS_TARGETS },
  ]},
  { title: 'Coordination', items: [
    { icon: GitPullRequest, label: 'Active Incidents', href: ROUTES.ITOPS_INCIDENTS_ACTIVE },
    { icon: ShieldAlert, label: 'Escalations', href: ROUTES.ITOPS_ESCALATIONS },
    { icon: Users, label: 'Team Assignments', href: ROUTES.ITOPS_ASSIGNMENTS },
  ]},
  { title: 'Access & Identity', items: [
    { icon: UserCog, label: 'User Management', href: ROUTES.IT_USERS },
  ]},
  { title: 'Metrics & Reports', items: [
    { icon: BarChart3, label: 'Performance Metrics', href: ROUTES.ITOPS_METRICS },
    { icon: BellRing, label: 'Alerts', href: ROUTES.ITOPS_NOTIFICATIONS },
    { icon: FileText, label: 'Operational Reports', href: ROUTES.ITOPS_REPORTS },
  ]}
];

const superAdminSections: NavSection[] = [
  { title: 'Command Center', items: [
    { icon: Crown, label: 'Global Dashboard', href: ROUTES.SUPER_ADMIN_DASHBOARD },
  ]},
  { title: 'Governance', items: [
    { icon: Building2, label: 'Tenants', href: ROUTES.SUPER_ADMIN_TENANTS },
    { icon: Shield, label: 'Global Policies', href: ROUTES.SUPER_ADMIN_POLICIES },
    { icon: Users, label: 'Cross-Tenant Users', href: ROUTES.SUPER_ADMIN_USERS },
  ]},
  { title: 'Control', items: [
    { icon: Zap, label: 'System Overrides', href: ROUTES.SUPER_ADMIN_OVERRIDES },
    { icon: Monitor, label: 'Monitoring', href: ROUTES.SUPER_ADMIN_MONITORING },
  ]},
  { title: 'Audit & Alerts', items: [
    { icon: ScrollText, label: 'Audit Trail', href: ROUTES.SUPER_ADMIN_AUDIT },
    { icon: BellRing, label: 'Global Alerts', href: ROUTES.SUPER_ADMIN_ALERTS },
  ]}
];


const bloodBankSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Droplets, label: 'Blood Bank', href: ROUTES.BLOODBANK_DASHBOARD },
  ]},
  { title: 'Donors & Stock', items: [
    { icon: Users, label: 'Donor Profiles', href: ROUTES.BLOODBANK_DONORS },
    { icon: Activity, label: 'Collection', href: ROUTES.BLOODBANK_COLLECTION },
    { icon: Box, label: 'Inventory Level', href: ROUTES.BLOODBANK_INVENTORY },
  ]},
  { title: 'Testing & Issue', items: [
    { icon: TestTube, label: 'Screening', href: ROUTES.BLOODBANK_TESTING },
    { icon: Target, label: 'Crossmatch', href: ROUTES.BLOODBANK_MATCHING },
    { icon: CheckSquare, label: 'Issuance', href: ROUTES.BLOODBANK_ISSUANCE },
  ]},
  { title: 'Compliance', items: [
    { icon: ShieldCheck, label: 'Regulatory Docs', href: ROUTES.BLOODBANK_COMPLIANCE },
    { icon: FileText, label: 'Logs & Reports', href: ROUTES.BLOODBANK_REPORTS },
  ]}
];

const bloodTechSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Tech Dashboard', href: ROUTES.BLOOD_TECH_DASHBOARD },
  ]},
  { title: 'Lab Execution', items: [
    { icon: Droplets, label: 'Collection', href: ROUTES.BLOOD_TECH_COLLECTION },
    { icon: TestTube, label: 'Testing', href: ROUTES.BLOOD_TECH_TESTING },
    { icon: GitMerge, label: 'Crossmatching', href: ROUTES.BLOOD_TECH_MATCHING },
  ]},
  { title: 'Inventory', items: [
    { icon: Box, label: 'Storage', href: ROUTES.BLOOD_TECH_STORAGE },
    { icon: Truck, label: 'Issuance', href: ROUTES.BLOOD_TECH_ISSUANCE },
  ]},
  { title: 'Records', items: [
    { icon: FileText, label: 'Logs & Reports', href: ROUTES.BLOOD_TECH_REPORTS },
  ]}
];

const painSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Pain Dashboard', href: ROUTES.PAIN_DASHBOARD },
  ]},
  { title: 'Patients', items: [
    { icon: Users, label: 'Active Cases', href: ROUTES.PAIN_PATIENTS },
  ]},
  { title: 'Assessment', items: [
    { icon: Activity, label: 'Pain Scales', href: ROUTES.PAIN_ASSESSMENT },
  ]},
  { title: 'Treatment', items: [
    { icon: Pill, label: 'Plans', href: ROUTES.PAIN_TREATMENT },
  ]},
  { title: 'Procedures', items: [
    { icon: Scissors, label: 'Interventions', href: ROUTES.PAIN_PROCEDURES },
  ]},
  { title: 'Monitoring', items: [
    { icon: TrendingDown, label: 'Trends', href: ROUTES.PAIN_MONITORING },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'Outcomes', href: ROUTES.PAIN_REPORTS },
  ]}
];

const geneticSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Activity, label: 'Genetic Dashboard', href: ROUTES.GENETIC_DASHBOARD },
  ]},
  { title: 'Patients', items: [
    { icon: Users, label: 'Active Cases', href: ROUTES.GENETIC_CASES },
  ]},
  { title: 'Assessment', items: [
    { icon: GitBranch, label: 'Family History', href: ROUTES.GENETIC_FAMILY },
    { icon: AlertTriangle, label: 'Risk Analysis', href: ROUTES.GENETIC_RISK },
  ]},
  { title: 'Test Results', items: [
    { icon: FileText, label: 'Reports', href: ROUTES.GENETIC_RESULTS },
  ]},
  { title: 'Counseling', items: [
    { icon: HeartHandshake, label: 'Sessions', href: ROUTES.GENETIC_SESSIONS },
  ]},
  { title: 'Decisions', items: [
    { icon: Target, label: 'Options', href: ROUTES.GENETIC_DECISIONS },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'Genetic Profiles', href: ROUTES.GENETIC_PROFILES },
  ]}
];

const infosecSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Shield, label: 'Compliance Dashboard', href: ROUTES.INFOSEC_DASHBOARD },
  ]},
  { title: 'Frameworks', items: [
    { icon: BookCheck, label: 'Standards (ISO, HIPAA)', href: ROUTES.INFOSEC_STANDARDS },
  ]},
  { title: 'Controls', items: [
    { icon: ShieldCheck, label: 'Policies & Controls', href: ROUTES.INFOSEC_CONTROLS },
  ]},
  { title: 'Audits', items: [
    { icon: FileSearch, label: 'Audit Management', href: ROUTES.INFOSEC_AUDITS },
  ]},
  { title: 'Risks', items: [
    { icon: AlertTriangle, label: 'Risk Register', href: ROUTES.INFOSEC_RISKS },
  ]},
  { title: 'Incidents', items: [
    { icon: Siren, label: 'Security Events', href: ROUTES.INFOSEC_INCIDENTS },
  ]},
  { title: 'Evidence & Reports', items: [
    { icon: FileText, label: 'Documents', href: ROUTES.INFOSEC_EVIDENCE },
    { icon: BarChart3, label: 'Compliance Reports', href: ROUTES.INFOSEC_REPORTS },
  ]}
];

const riskManagerSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: ShieldAlert, label: 'Risk Dashboard', href: ROUTES.RISK_DASHBOARD },
  ]},
  { title: 'Risks', items: [
    { icon: AlertTriangle, label: 'Risk Register', href: ROUTES.RISK_REGISTER },
  ]},
  { title: 'Assessment', items: [
    { icon: BarChart3, label: 'Evaluations', href: ROUTES.RISK_ASSESSMENT },
  ]},
  { title: 'Mitigation', items: [
    { icon: Wrench, label: 'Actions', href: ROUTES.RISK_ACTIONS },
  ]},
  { title: 'Assets', items: [
    { icon: Server, label: 'Systems', href: ROUTES.RISK_SYSTEMS },
  ]},
  { title: 'Incidents', items: [
    { icon: Siren, label: 'Security Events', href: ROUTES.RISK_EVENTS },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'Risk Reports', href: ROUTES.RISK_REPORTS },
  ]}
];

const dpoSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Shield, label: 'Privacy Dashboard', href: ROUTES.DPO_DASHBOARD },
  ]},
  { title: 'Data Map', items: [
    { icon: Database, label: 'Processing Activities', href: ROUTES.DPO_PROCESSING },
  ]},
  { title: 'Consent', items: [
    { icon: CheckSquare, label: 'Consent Records', href: ROUTES.DPO_CONSENT },
  ]},
  { title: 'Requests', items: [
    { icon: ClipboardList, label: 'Data Subject Requests', href: ROUTES.DPO_REQUESTS },
  ]},
  { title: 'Breaches', items: [
    { icon: Siren, label: 'Breach Incidents', href: ROUTES.DPO_BREACHES },
  ]},
  { title: 'Assessments', items: [
    { icon: AlertTriangle, label: 'DPIA', href: ROUTES.DPO_DPIA },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'Compliance Reports', href: ROUTES.DPO_REPORTS },
  ]}
];

const internalAuditorSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: FileSearch, label: 'Audit Dashboard', href: ROUTES.AUDIT_DASHBOARD },
  ]},
  { title: 'Controls', items: [
    { icon: BookCheck, label: 'Control Library', href: ROUTES.AUDIT_CONTROLS },
  ]},
  { title: 'Audits', items: [
    { icon: ClipboardList, label: 'Active Audits', href: ROUTES.AUDIT_ACTIVE },
  ]},
  { title: 'Mapping', items: [
    { icon: GitBranch, label: 'Standards Mapping', href: ROUTES.AUDIT_MAPPING },
  ]},
  { title: 'Findings', items: [
    { icon: AlertTriangle, label: 'Issues & Gaps', href: ROUTES.AUDIT_FINDINGS },
  ]},
  { title: 'CAPA', items: [
    { icon: Wrench, label: 'Corrective Actions', href: ROUTES.AUDIT_CAPA },
  ]},
  { title: 'Evidence & Reports', items: [
    { icon: FileText, label: 'Evidence', href: ROUTES.AUDIT_EVIDENCE },
    { icon: BarChart3, label: 'Audit Reports', href: ROUTES.AUDIT_REPORTS },
  ]}
];

const devopsSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Gauge, label: 'DevOps Dashboard', href: ROUTES.DEVOPS_DASHBOARD },
  ]},
  { title: 'Pipelines', items: [
    { icon: GitBranch, label: 'CI/CD Pipelines', href: ROUTES.DEVOPS_PIPELINES },
  ]},
  { title: 'Deployments', items: [
    { icon: Zap, label: 'Releases', href: ROUTES.DEVOPS_DEPLOYMENTS },
  ]},
  { title: 'Infrastructure', items: [
    { icon: Server, label: 'Environments', href: ROUTES.DEVOPS_ENVIRONMENTS },
    { icon: Boxes, label: 'IaC Resources', href: ROUTES.DEVOPS_IAC },
  ]},
  { title: 'Monitoring', items: [
    { icon: ScrollText, label: 'Logs', href: ROUTES.DEVOPS_LOGS },
    { icon: BarChart3, label: 'Metrics', href: ROUTES.DEVOPS_METRICS },
  ]},
  { title: 'Alerts', items: [
    { icon: Siren, label: 'Incidents', href: ROUTES.DEVOPS_INCIDENTS },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'DevOps Reports', href: ROUTES.DEVOPS_REPORTS },
  ]}
];

const devSecOpsSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: ShieldCheck, label: 'SecOps Dashboard', href: ROUTES.DEVSECOPS_DASHBOARD },
  ]},
  { title: 'Pipelines', items: [
    { icon: GitBranch, label: 'Secure Pipelines', href: ROUTES.DEVSECOPS_PIPELINES },
  ]},
  { title: 'Security Scans', items: [
    { icon: Eye, label: 'SAST', href: ROUTES.DEVSECOPS_SAST },
    { icon: Network, label: 'DAST', href: ROUTES.DEVSECOPS_DAST },
    { icon: Package, label: 'SCA', href: ROUTES.DEVSECOPS_SCA },
  ]},
  { title: 'Vulnerabilities', items: [
    { icon: Bug, label: 'Issues', href: ROUTES.DEVSECOPS_VULNERABILITIES },
  ]},
  { title: 'Policies', items: [
    { icon: Shield, label: 'Security Rules', href: ROUTES.DEVSECOPS_POLICIES },
  ]},
  { title: 'Compliance', items: [
    { icon: BookCheck, label: 'Standards', href: ROUTES.DEVSECOPS_COMPLIANCE },
  ]},
  { title: 'Reports', items: [
    { icon: FileText, label: 'Security Reports', href: ROUTES.DEVSECOPS_REPORTS },
  ]}
];

const softDevSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Code2, label: 'Dev Dashboard', href: ROUTES.SOFTDEV_DASHBOARD },
  ]},
  { title: 'Projects', items: [
    { icon: Boxes, label: 'Services', href: ROUTES.SOFTDEV_SERVICES },
  ]},
  { title: 'APIs', items: [
    { icon: Cpu, label: 'Endpoints', href: ROUTES.SOFTDEV_ENDPOINTS },
  ]},
  { title: 'Code', items: [
    { icon: GitBranch, label: 'Repositories', href: ROUTES.SOFTDEV_REPOSITORIES },
  ]},
  { title: 'Testing', items: [
    { icon: FlaskConical, label: 'Unit Tests', href: ROUTES.SOFTDEV_TESTS },
  ]},
  { title: 'Security', items: [
    { icon: ShieldCheck, label: 'Code Analysis', href: ROUTES.SOFTDEV_SECURITY },
  ]},
  { title: 'Deployment', items: [
    { icon: Zap, label: 'Builds', href: ROUTES.SOFTDEV_BUILDS },
  ]},
  { title: 'Reports', items: [
    { icon: BarChart3, label: 'Dev Metrics', href: ROUTES.SOFTDEV_REPORTS },
  ]}
];

const integrationSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Network, label: 'Integration Dashboard', href: ROUTES.INTEGRATION_DASHBOARD }]},
  { title: 'Interfaces', items: [{ icon: GitBranch, label: 'Interface Registry', href: ROUTES.INTEGRATION_INTERFACES }]},
  { title: 'Messages', items: [{ icon: MessageSquare, label: 'Message Stream', href: ROUTES.INTEGRATION_MESSAGES }, { icon: XCircle, label: 'Error Queue', href: ROUTES.INTEGRATION_ERRORS }]},
  { title: 'Mapping', items: [{ icon: Map, label: 'Field Mapping', href: ROUTES.INTEGRATION_MAPPING }, { icon: GitMerge, label: 'Routing Engine', href: ROUTES.INTEGRATION_ROUTING }]},
  { title: 'FHIR', items: [{ icon: Code2, label: 'FHIR API', href: ROUTES.INTEGRATION_FHIR }]},
  { title: 'Reports', items: [{ icon: FileText, label: 'Integration Reports', href: ROUTES.INTEGRATION_REPORTS }]}
];

const managementSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: ClipboardList, label: 'Management Command Center', href: ROUTES.MANAGEMENT }]},
  { title: 'Routing', items: [{ icon: GitMerge, label: 'Management Routing', href: ROUTES.MANAGEMENT_ROUTING }]},
  { title: 'Operations', items: [{ icon: ClipboardList, label: 'Case Management', href: ROUTES.MANAGEMENT }, { icon: Network, label: 'Network Management', href: ROUTES.NET_MGMT_DASHBOARD }]},
  { title: 'Governance', items: [{ icon: Shield, label: 'Visitor Management', href: ROUTES.VISITOR_DASHBOARD }, { icon: FileText, label: 'Evidence Management', href: ROUTES.EVIDENCE_DASHBOARD }]},
];

const legalComplianceSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Scale, label: 'Compliance Dashboard', href: ROUTES.LEGAL_COMPLIANCE }]},
  { title: 'Statutory', items: [{ icon: FileText, label: 'Licenses & Permits', href: ROUTES.LEGAL_COMPLIANCE_LICENSES }, { icon: Scale, label: 'Regulatory Laws', href: ROUTES.LEGAL_COMPLIANCE_REGULATIONS }]},
  { title: 'Violations', items: [{ icon: AlertTriangle, label: 'Violations Tracker', href: ROUTES.LEGAL_COMPLIANCE_VIOLATIONS }]},
  { title: 'Audits', items: [{ icon: ClipboardList, label: 'Audit Checklists', href: ROUTES.LEGAL_COMPLIANCE_CHECKLISTS }, { icon: Calendar, label: 'Audit Schedule', href: ROUTES.LEGAL_COMPLIANCE_AUDITS }]},
  { title: 'Reports', items: [{ icon: FileText, label: 'Statutory Reports', href: ROUTES.LEGAL_COMPLIANCE_REPORTS }]},
];

const complianceSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: BookCheck, label: 'Compliance Dashboard', href: ROUTES.COMPLIANCE }]},
  { title: 'Governance', items: [{ icon: ClipboardList, label: 'Policies & Standards', href: ROUTES.COMPLIANCE_POLICIES }]},
  { title: 'Issues', items: [{ icon: AlertTriangle, label: 'Violations Tracker', href: ROUTES.COMPLIANCE_VIOLATIONS }]},
  { title: 'Resources', items: [{ icon: FileText, label: 'Documents Library', href: ROUTES.COMPLIANCE_DOCUMENTS }]},
  { title: 'Consent', items: [{ icon: CheckCircle2, label: 'Patient Consents', href: ROUTES.COMPLIANCE_CONSENTS }]},
  { title: 'Audits', items: [{ icon: Calendar, label: 'Compliance Checks', href: ROUTES.COMPLIANCE_CHECKS }]},
];

const auditSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: FileSearch, label: 'Audit Dashboard', href: ROUTES.AUDIT }]},
  { title: 'Portfolio', items: [{ icon: ClipboardList, label: 'Audit Schedule', href: ROUTES.AUDIT_AUDITS }]},
  { title: 'Control Framework', items: [{ icon: BookCheck, label: 'Control Library', href: ROUTES.AUDIT_CONTROLS }]},
  { title: 'Observations', items: [{ icon: AlertTriangle, label: 'Findings Tracker', href: ROUTES.AUDIT_FINDINGS }]},
  { title: 'Remediation', items: [{ icon: Wrench, label: 'CAPA Actions', href: ROUTES.AUDIT_CAPA }]},
  { title: 'Documentation', items: [{ icon: FileText, label: 'Audit Reports', href: ROUTES.AUDIT_REPORTS }]},
];

const apiGatewaySections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Server, label: 'Gateway Dashboard', href: ROUTES.APIGATEWAY_DASHBOARD }]},
  { title: 'APIs', items: [{ icon: Boxes, label: 'API Registry', href: ROUTES.APIGATEWAY_REGISTRY }]},
  { title: 'Traffic', items: [{ icon: Activity, label: 'Traffic Monitor', href: ROUTES.APIGATEWAY_TRAFFIC }]},
  { title: 'Security', items: [{ icon: Lock, label: 'Security Policies', href: ROUTES.APIGATEWAY_SECURITY }, { icon: Shield, label: 'Rate Limits', href: ROUTES.APIGATEWAY_POLICIES }]},
  { title: 'Routing', items: [{ icon: GitBranch, label: 'Routes & LB', href: ROUTES.APIGATEWAY_ROUTING }]},
  { title: 'Alerts', items: [{ icon: Siren, label: 'Gateway Alerts', href: ROUTES.APIGATEWAY_ALERTS }]},
  { title: 'Reports', items: [{ icon: BarChart3, label: 'Analytics', href: ROUTES.APIGATEWAY_ANALYTICS }]},
  { title: 'Kong Gateway', items: [
    { icon: Globe, label: 'Kong Console', href: ROUTES.KONG_DASHBOARD },
    { icon: Server, label: 'Services', href: ROUTES.KONG_SERVICES },
    { icon: Plug, label: 'Plugins', href: ROUTES.KONG_PLUGINS },
    { icon: Layers, label: 'Upstreams', href: ROUTES.KONG_UPSTREAMS },
    { icon: Users, label: 'Consumers', href: ROUTES.KONG_CONSUMERS },
  ]},
  { title: 'GraphQL Federation', items: [
    { icon: GitMerge, label: 'GraphQL Gateway', href: ROUTES.GRAPHQL_GW_DASHBOARD },
  ]},
  { title: 'API Composition', items: [
    { icon: Combine, label: 'Composition Dashboard', href: ROUTES.API_COMP_DASHBOARD },
    { icon: GitBranch, label: 'Composed Routes', href: ROUTES.API_COMP_ROUTES },
    { icon: ScrollText, label: 'Composition Logs', href: ROUTES.API_COMP_LOGS },
  ]},
];

const qaSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: FlaskConical, label: 'QA Dashboard', href: ROUTES.QA_DASHBOARD }]},
  { title: 'Test Cases', items: [{ icon: CheckSquare, label: 'Suites', href: ROUTES.QA_SUITES }, { icon: ListChecks, label: 'Cases', href: ROUTES.QA_CASES }]},
  { title: 'Execution', items: [{ icon: PlayCircle, label: 'Test Runs', href: ROUTES.QA_RUNS }]},
  { title: 'Defects', items: [{ icon: Bug, label: 'Bug Tracker', href: ROUTES.QA_BUGS }]},
  { title: 'Automation', items: [{ icon: Zap, label: 'Scripts', href: ROUTES.QA_AUTOMATION }]},
  { title: 'Security Tests', items: [{ icon: ShieldCheck, label: 'Vulnerabilities', href: ROUTES.QA_SECURITY }]},
  { title: 'Reports', items: [{ icon: BarChart3, label: 'Coverage', href: ROUTES.QA_REPORTS }]}
];

const dataEngSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Database, label: 'Data Dashboard', href: ROUTES.DATAENG_DASHBOARD }]},
  { title: 'Pipelines', items: [{ icon: GitBranch, label: 'ETL/ELT', href: ROUTES.DATAENG_ETL }, { icon: Activity, label: 'Streams', href: ROUTES.DATAENG_STREAMS }]},
  { title: 'Data Sources', items: [{ icon: Server, label: 'Systems', href: ROUTES.DATAENG_SOURCES }]},
  { title: 'Quality', items: [{ icon: CheckSquare, label: 'Validation', href: ROUTES.DATAENG_QUALITY }]},
  { title: 'Security', items: [{ icon: Lock, label: 'Access Control', href: ROUTES.DATAENG_SECURITY }]},
  { title: 'Monitoring', items: [{ icon: ScrollText, label: 'Logs', href: ROUTES.DATAENG_LOGS }]},
  { title: 'Alerts', items: [{ icon: Siren, label: 'Incidents', href: ROUTES.DATAENG_ALERTS }]},
  { title: 'Reports', items: [{ icon: BarChart3, label: 'Data Metrics', href: ROUTES.DATAENG_REPORTS }]}
];

const dataAnalystSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: BarChart3, label: 'Analytics Dashboard', href: ROUTES.ANALYST_DASHBOARD }]},
  { title: 'Datasets', items: [{ icon: Database, label: 'Sources', href: ROUTES.ANALYST_SOURCES }]},
  { title: 'Analysis', items: [{ icon: Activity, label: 'Queries', href: ROUTES.ANALYST_QUERIES }]},
  { title: 'Dashboards', items: [{ icon: BarChart3, label: 'Visualizations', href: ROUTES.ANALYST_DASHBOARDS }]},
  { title: 'Reports', items: [{ icon: FileText, label: 'Generated Reports', href: ROUTES.ANALYST_REPORTS }]},
  { title: 'Insights', items: [{ icon: Lightbulb, label: 'Findings', href: ROUTES.ANALYST_INSIGHTS }]},
  { title: 'Tools', items: [{ icon: Filter, label: 'Filters', href: ROUTES.ANALYST_FILTERS }]}
];

const mlEngineerSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: BrainCircuit, label: 'ML Dashboard', href: ROUTES.ML_DASHBOARD }]},
  { title: 'Models', items: [{ icon: BoxSelect, label: 'Model Registry', href: ROUTES.ML_REGISTRY }]},
  { title: 'Data', items: [{ icon: Database, label: 'Datasets', href: ROUTES.ML_DATASETS }]},
  { title: 'Development', items: [{ icon: GitBranch, label: 'Experiments', href: ROUTES.ML_EXPERIMENTS }, { icon: Cpu, label: 'Training Jobs', href: ROUTES.ML_TRAINING }]},
  { title: 'Deployment', items: [{ icon: Server, label: 'Inference', href: ROUTES.ML_INFERENCE }]},
  { title: 'Observability', items: [{ icon: Activity, label: 'Monitoring', href: ROUTES.ML_MONITORING }, { icon: ShieldAlert, label: 'Alerts', href: ROUTES.ML_ALERTS }]},
  { title: 'Reports', items: [{ icon: FileText, label: 'Metrics', href: ROUTES.ML_REPORTS }]}
];

const informaticistSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Workflow, label: 'Clinical Intelligence', href: ROUTES.INFORMATICIST_DASHBOARD }]},
  { title: 'Workflows', items: [{ icon: GitBranch, label: 'Workflow Design', href: ROUTES.INFORMATICIST_WORKFLOWS }]},
  { title: 'Decision Support', items: [{ icon: BellRing, label: 'CDSS Rules', href: ROUTES.INFORMATICIST_CDSS }]},
  { title: 'Data Governance', items: [{ icon: BookOpen, label: 'Standardization', href: ROUTES.INFORMATICIST_STANDARDS }, { icon: ShieldAlert, label: 'Data Quality', href: ROUTES.INFORMATICIST_QUALITY }]},
  { title: 'Usability', items: [{ icon: Activity, label: 'UX Analytics', href: ROUTES.INFORMATICIST_UX }]},
  { title: 'Monitoring', items: [{ icon: AlertTriangle, label: 'Smart Alerts', href: ROUTES.INFORMATICIST_ALERTS }]}
];

const dataScientistSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Activity, label: 'Data Science Hub', href: ROUTES.DATASCI_DASHBOARD }]},
  { title: 'Exploration', items: [{ icon: Database, label: 'Data Explorer', href: ROUTES.DATASCI_EXPLORER }]},
  { title: 'Predictive Analytics', items: [{ icon: BrainCircuit, label: 'Models', href: ROUTES.DATASCI_MODELS }, { icon: Users, label: 'Risk Predictions', href: ROUTES.DATASCI_PREDICTIONS }]},
  { title: 'Feature Engineering', items: [{ icon: Filter, label: 'Feature Store', href: ROUTES.DATASCI_FEATURES }]},
  { title: 'Insights', items: [{ icon: Activity, label: 'Population Health', href: ROUTES.DATASCI_POPULATION }]},
  { title: 'Reports', items: [{ icon: FileText, label: 'Science Reports', href: ROUTES.DATASCI_REPORTS }]}
];

const aiEthicsSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: ShieldCheck, label: 'Ethics Dashboard', href: ROUTES.ETHICS_DASHBOARD }]},
  { title: 'Governance', items: [{ icon: BrainCircuit, label: 'Model Registry', href: ROUTES.ETHICS_REGISTRY }, { icon: Scale, label: 'Bias Engine', href: ROUTES.ETHICS_BIAS }]},
  { title: 'Transparency', items: [{ icon: Eye, label: 'Explainability (XAI)', href: ROUTES.ETHICS_EXPLAINABILITY }]},
  { title: 'Compliance & Risk', items: [{ icon: AlertTriangle, label: 'Risk Assessment', href: ROUTES.ETHICS_RISK }, { icon: ShieldCheck, label: 'Compliance Tracking', href: ROUTES.ETHICS_COMPLIANCE }]},
  { title: 'Monitoring', items: [{ icon: ShieldAlert, label: 'Ethical Alerts', href: ROUTES.ETHICS_ALERTS }]}
];

const aiGovernanceSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: ShieldCheck, label: 'Gov. Dashboard', href: ROUTES.GOV_DASHBOARD }]},
  { title: 'Model Governance', items: [{ icon: BrainCircuit, label: 'Registry', href: ROUTES.GOV_REGISTRY }, { icon: CheckCircle2, label: 'Approvals', href: ROUTES.GOV_APPROVALS }]},
  { title: 'Ethics', items: [{ icon: Scale, label: 'Fairness / Bias', href: ROUTES.GOV_ETHICS }]},
  { title: 'Compliance', items: [{ icon: ShieldCheck, label: 'Regulations', href: ROUTES.GOV_COMPLIANCE }]},
  { title: 'Risk', items: [{ icon: AlertTriangle, label: 'AI Risks', href: ROUTES.GOV_RISK }]},
  { title: 'Audits', items: [{ icon: FileSearch, label: 'Reviews', href: ROUTES.GOV_AUDITS }, { icon: FileText, label: 'Reports', href: ROUTES.GOV_REPORTS }]}
];

const iomtSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Server, label: 'IoMT Platform', href: ROUTES.IOMT_DASHBOARD }]},
  { title: 'Devices', items: [{ icon: Cpu, label: 'Registered Devices', href: ROUTES.IOMT_REGISTRY }]},
  { title: 'Data Stream', items: [{ icon: Activity, label: 'Live Data', href: ROUTES.IOMT_STREAM }]},
  { title: 'Security (Zero-Trust)', items: [{ icon: Key, label: 'Authentication', href: ROUTES.IOMT_AUTH }, { icon: ShieldCheck, label: 'Validation', href: ROUTES.IOMT_VALIDATION }, { icon: Lock, label: 'Security Policies', href: ROUTES.IOMT_SECURITY }]},
  { title: 'Alerts', items: [{ icon: AlertTriangle, label: 'Incidents', href: ROUTES.IOMT_ALERTS }, { icon: FileText, label: 'Device Logs', href: ROUTES.IOMT_REPORTS }]}
];

const serviceAccountSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Cpu, label: 'Identity Hub', href: ROUTES.SA_DASHBOARD }]},
  { title: 'Service Accounts', items: [{ icon: ShieldCheck, label: 'Identities', href: ROUTES.SA_IDENTITIES }]},
  { title: 'Credentials', items: [{ icon: Key, label: 'Keys', href: ROUTES.SA_KEYS }, { icon: Key, label: 'Tokens', href: ROUTES.SA_TOKENS }]},
  { title: 'Permissions', items: [{ icon: Lock, label: 'Roles', href: ROUTES.SA_ROLES }, { icon: ShieldCheck, label: 'Policies', href: ROUTES.SA_POLICIES }]},
  { title: 'Access Logs', items: [{ icon: FileText, label: 'API Calls', href: ROUTES.SA_API_CALLS }]},
  { title: 'Rotation', items: [{ icon: RotateCw, label: 'Secrets Management', href: ROUTES.SA_SECRETS }]},
  { title: 'Alerts & Reports', items: [{ icon: AlertTriangle, label: 'Incidents', href: ROUTES.SA_ALERTS }, { icon: FileText, label: 'Security Reports', href: ROUTES.SA_REPORTS }]}
];

const automationSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Bot, label: 'Automation Hub', href: ROUTES.AUTO_DASHBOARD }]},
  { title: 'Bots', items: [{ icon: Workflow, label: 'Agents', href: ROUTES.AUTO_AGENTS }]},
  { title: 'Pipelines', items: [{ icon: PlayCircle, label: 'Jobs', href: ROUTES.AUTO_JOBS }]},
  { title: 'Monitoring', items: [{ icon: Activity, label: 'Metrics', href: ROUTES.AUTO_METRICS }, { icon: FileText, label: 'Logs', href: ROUTES.AUTO_LOGS }]},
  { title: 'Automation', items: [{ icon: Workflow, label: 'Workflows', href: ROUTES.AUTO_WORKFLOWS }]},
  { title: 'Incidents', items: [{ icon: AlertTriangle, label: 'Events', href: ROUTES.AUTO_EVENTS }]},
  { title: 'Actions', items: [{ icon: RotateCw, label: 'Remediation', href: ROUTES.AUTO_REMEDIATION }]},
  { title: 'Reports', items: [{ icon: FileText, label: 'Metrics', href: ROUTES.AUTO_REPORTS }]}
];

const socAnalystSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: ShieldAlert, label: 'SOC Dashboard', href: ROUTES.SOC_DASHBOARD }]},
  { title: 'Alerts', items: [{ icon: AlertTriangle, label: 'SIEM Alerts', href: ROUTES.SOC_ALERTS }]},
  { title: 'Incidents', items: [{ icon: ShieldAlert, label: 'Active', href: ROUTES.SOC_ACTIVE }, { icon: FileText, label: 'History', href: ROUTES.SOC_HISTORY }]},
  { title: 'Investigation', items: [{ icon: FileSearch, label: 'Logs', href: ROUTES.SOC_LOGS }, { icon: Activity, label: 'Events', href: ROUTES.SOC_EVENTS }]},
  { title: 'Threats', items: [{ icon: Crosshair, label: 'Indicators', href: ROUTES.SOC_INDICATORS }]},
  { title: 'Playbooks', items: [{ icon: Workflow, label: 'Response Actions', href: ROUTES.SOC_PLAYBOOKS }]},
  { title: 'Reports', items: [{ icon: FileText, label: 'Security Reports', href: ROUTES.SOC_REPORTS }]},
  { title: 'Wazuh SIEM/XDR', items: [
    { icon: Shield, label: 'Wazuh Console', href: ROUTES.WAZUH_DASHBOARD },
    { icon: AlertTriangle, label: 'Alerts', href: ROUTES.WAZUH_ALERTS },
    { icon: Server, label: 'Agents', href: ROUTES.WAZUH_AGENTS },
    { icon: FileSearch, label: 'FIM Events', href: ROUTES.WAZUH_FIM },
    { icon: Lock, label: 'Compliance', href: ROUTES.WAZUH_COMPLIANCE },
  ]},
  { title: 'Threat Detection', items: [
    { icon: Crosshair, label: 'Detection Console',     href: ROUTES.THREAT_DETECT_DASHBOARD },
    { icon: ShieldAlert, label: 'Detection Alerts',    href: ROUTES.THREAT_DETECT_ALERTS },
    { icon: Activity, label: 'Behavioral Anomalies',   href: ROUTES.THREAT_DETECT_ANOMALIES },
    { icon: Target, label: 'Detection Rules',          href: ROUTES.THREAT_DETECT_RULES },
    { icon: Server, label: 'Engine Status',            href: ROUTES.THREAT_DETECT_ENGINES },
  ]},
];

const incidentResponderSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: ShieldAlert, label: 'IR Dashboard', href: ROUTES.IR_DASHBOARD }]},
  { title: 'Incidents', items: [{ icon: AlertTriangle, label: 'Active Breaches', href: ROUTES.IR_INCIDENTS }]},
  { title: 'Response', items: [{ icon: PlayCircle, label: 'Actions', href: ROUTES.IR_RESPONSE }]},
  { title: 'Containment', items: [{ icon: ShieldCheck, label: 'System Isolation', href: ROUTES.IR_CONTAINMENT }]},
  { title: 'Recovery', items: [{ icon: RotateCw, label: 'Service Recovery', href: ROUTES.IR_RECOVERY }]},
  { title: 'Forensics', items: [{ icon: FileSearch, label: 'Evidence', href: ROUTES.IR_FORENSICS }]},
  { title: 'Playbooks', items: [{ icon: Workflow, label: 'Execution', href: ROUTES.IR_PLAYBOOKS }]},
  { title: 'Reports', items: [{ icon: FileText, label: 'IR Reports', href: ROUTES.IR_REPORTS }]},
  { title: 'Threat Detection', items: [
    { icon: Crosshair, label: 'Detection Console', href: ROUTES.THREAT_DETECT_DASHBOARD },
    { icon: ShieldAlert, label: 'Active Detections', href: ROUTES.THREAT_DETECT_ALERTS },
    { icon: Activity, label: 'Behavioral Anomalies', href: ROUTES.THREAT_DETECT_ANOMALIES },
  ]},
];

const securityEngineerSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Shield, label: 'Security Dashboard', href: ROUTES.SE_DASHBOARD }]},
  { title: 'Firewall', items: [{ icon: ShieldCheck, label: 'Rules', href: ROUTES.SE_RULES }]},
  { title: 'Endpoint Security', items: [{ icon: Monitor, label: 'EDR/XDR', href: ROUTES.SE_EDR }]},
  { title: 'Zero Trust', items: [{ icon: Lock, label: 'Policies', href: ROUTES.SE_ZTA }]},
  { title: 'Network Security', items: [{ icon: Server, label: 'IDS/IPS', href: ROUTES.SE_IDS }]},
  { title: 'Configuration', items: [{ icon: Settings, label: 'Hardening', href: ROUTES.SE_HARDENING }]},
  { title: 'Monitoring', items: [{ icon: Activity, label: 'Events', href: ROUTES.SE_EVENTS }]},
  { title: 'Reports', items: [{ icon: FileText, label: 'Security Metrics', href: ROUTES.SE_REPORTS }]},
  { title: 'Wazuh XDR', items: [
    { icon: Shield, label: 'Wazuh Console', href: ROUTES.WAZUH_DASHBOARD },
    { icon: AlertTriangle, label: 'Vulnerabilities', href: ROUTES.WAZUH_VULNERABILITIES },
    { icon: FileSearch, label: 'FIM Integrity', href: ROUTES.WAZUH_FIM },
    { icon: Lock, label: 'Compliance', href: ROUTES.WAZUH_COMPLIANCE },
  ]},
];


const threatIntelSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Crosshair, label: 'Intel Dashboard', href: ROUTES.TI_DASHBOARD }]},
  { title: 'Threats', items: [{ icon: AlertTriangle, label: 'Indicators (IOC)', href: ROUTES.TI_INDICATORS }]},
  { title: 'Campaigns', items: [{ icon: ShieldAlert, label: 'Attack Campaigns', href: ROUTES.TI_CAMPAIGNS }]},
  { title: 'Feeds', items: [{ icon: Activity, label: 'External Sources', href: ROUTES.TI_FEEDS }]},
  { title: 'Analysis', items: [{ icon: GitMerge, label: 'Correlation', href: ROUTES.TI_CORRELATION }]},
  { title: 'Detection', items: [{ icon: ShieldCheck, label: 'Rule Feeds', href: ROUTES.TI_RULES }]},
  { title: 'Reports', items: [{ icon: FileText, label: 'Intel Reports', href: ROUTES.TI_REPORTS }]}
];

// ─── Clinical Research ────────────────────────────────────────────────────────
const clinicalResearchSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: FlaskConical, label: 'Research Dashboard', href: ROUTES.RESEARCH_DASHBOARD }]},
  { title: 'Studies', items: [{ icon: ClipboardList, label: 'Clinical Trials', href: ROUTES.RESEARCH_TRIALS }]},
  { title: 'Cohorts', items: [{ icon: Users, label: 'Trial Patients', href: ROUTES.RESEARCH_PATIENTS }]},
  { title: 'Data', items: [{ icon: Database, label: 'Research Datasets', href: ROUTES.RESEARCH_DATASETS }]},
  { title: 'Ethics', items: [{ icon: Scale, label: 'Compliance & IRB', href: ROUTES.RESEARCH_COMPLIANCE }]}
];

// ─── Population Health ────────────────────────────────────────────────────────
const popHealthSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Activity, label: 'PopHealth Hub', href: ROUTES.POP_HEALTH_DASHBOARD }]},
  { title: 'Stratification', items: [{ icon: Users, label: 'Patient Cohorts', href: ROUTES.POP_HEALTH_COHORTS }]},
  { title: 'Interventions', items: [{ icon: Target, label: 'Campaigns', href: ROUTES.POP_HEALTH_CAMPAIGNS }]},
  { title: 'Predictive', items: [{ icon: ShieldAlert, label: 'Risk Models', href: ROUTES.POP_HEALTH_RISK }]},
  { title: 'Surveillance', items: [{ icon: Globe, label: 'Epidemiology', href: ROUTES.POP_HEALTH_EPI }]}
];

// ─── AI Platform (Unified Intelligence Hub) ────────────────────────────────────
const aiPlatformSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: BrainCircuit, label: 'AI Platform Hub', href: ROUTES.AI_PLATFORM_DASHBOARD },
  ]},
  { title: 'Models', items: [
    { icon: BoxSelect,    label: 'Model Registry',   href: ROUTES.AI_PLATFORM_MODELS    },
    { icon: Cpu,          label: 'Training Jobs',     href: ROUTES.AI_PLATFORM_TRAINING  },
    { icon: Activity,     label: 'Inference Monitor', href: ROUTES.AI_PLATFORM_INFERENCE },
  ]},
  { title: 'Clinical AI', items: [
    { icon: Siren,        label: 'CDSS Alerts',       href: ROUTES.AI_PLATFORM_CDSS      },
    { icon: Network,      label: 'Digital Twins',     href: ROUTES.AI_PLATFORM_TWINS     },
  ]},
  { title: 'Data & Features', items: [
    { icon: GitBranch,    label: 'Analytics Pipelines',href: ROUTES.AI_PLATFORM_PIPELINES },
    { icon: Zap,          label: 'Feature Store',      href: ROUTES.AI_PLATFORM_FEATURES  },
  ]},
  { title: 'Governance', items: [
    { icon: Scale,        label: 'AI Governance',      href: ROUTES.AI_PLATFORM_GOVERNANCE},
    { icon: Eye,          label: 'Bias & Explainability', href: ROUTES.AI_PLATFORM_BIAS },
  ]},
  { title: 'Ops', items: [
    { icon: Monitor,      label: 'Platform Monitoring', href: ROUTES.AI_PLATFORM_MONITORING},
    { icon: AlertTriangle,label: 'AI Alerts',           href: ROUTES.AI_PLATFORM_ALERTS   },
    { icon: FileText,     label: 'AI Reports',          href: ROUTES.AI_PLATFORM_REPORTS  },
  ]},
];

// ─── MLflow (MLOps Tracking) ──────────────────────────────────────────────────
const mlflowSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: GitBranch, label: 'MLflow Dashboard', href: ROUTES.MLFLOW_DASHBOARD }]},
  { title: 'Tracking', items: [
    { icon: FlaskConical, label: 'Experiments', href: ROUTES.MLFLOW_EXPERIMENTS },
    { icon: Activity, label: 'Runs', href: ROUTES.MLFLOW_RUNS }
  ]},
  { title: 'Registry', items: [
    { icon: BoxSelect, label: 'Models', href: ROUTES.MLFLOW_MODELS },
    { icon: Database, label: 'Model Registry', href: ROUTES.MLFLOW_REGISTRY }
  ]}
];

// ─── TF Serving (Model Serving) ────────────────────────────────────────────────
const tfServingSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Cpu, label: 'TF Serving Dashboard', href: ROUTES.TF_SERVING_DASHBOARD }]},
  { title: 'Service', items: [
    { icon: Box, label: 'Deployed Models', href: ROUTES.TF_SERVING_MODELS },
    { icon: History, label: 'Model Versions', href: ROUTES.TF_SERVING_VERSIONS }
  ]},
  { title: 'Operations', items: [
    { icon: Gauge, label: 'Performance', href: ROUTES.TF_SERVING_MONITORING }
  ]}
];

// ─── Medical Education ────────────────────────────────────────────────────────
const medEdSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: GraduationCap, label: 'Med Ed Dashboard', href: ROUTES.MED_ED_DASHBOARD }]},
  { title: 'Academic', items: [
    { icon: BookOpen, label: 'Curriculum', href: ROUTES.MED_ED_CURRICULUM },
    { icon: Users, label: 'Student Directory', href: ROUTES.MED_ED_STUDENTS }
  ]},
  { title: 'Assessment', items: [
    { icon: ClipboardList, label: 'Exams & Results', href: ROUTES.MED_ED_EXAMS },
    { icon: Award, label: 'Certifications', href: ROUTES.MED_ED_CERTIFICATIONS }
  ]}
];

// ─── Credentialing ────────────────────────────────────────────────────────────
const credentialingSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: FileSignature, label: 'Credentialing Hub', href: ROUTES.CREDENTIALING_DASHBOARD }]},
  { title: 'Staff', items: [
    { icon: Users, label: 'Staff Roster', href: ROUTES.CREDENTIALING_STAFF },
    { icon: ShieldCheck, label: 'Privileges', href: ROUTES.CREDENTIALING_PRIVILEGES }
  ]},
  { title: 'Verification', items: [
    { icon: FileSearch, label: 'Verify Documents', href: ROUTES.CREDENTIALING_VERIFY },
    { icon: RotateCw, label: 'Renewals', href: ROUTES.CREDENTIALING_RENEWALS }
  ]}
];

// ─── Quality Management ───────────────────────────────────────────────────────
const qualityMgmtSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Target, label: 'Quality Dashboard', href: ROUTES.QUALITY_MGMT_DASHBOARD }]},
  { title: 'Safety', items: [
    { icon: ShieldAlert, label: 'Incident Reporting', href: ROUTES.QUALITY_MGMT_INCIDENTS },
    { icon: ListTodo, label: 'Quality Projects', href: ROUTES.QUALITY_MGMT_PROJECTS }
  ]},
  { title: 'Performance', items: [
    { icon: LineChart, label: 'Clinical Indicators', href: ROUTES.QUALITY_MGMT_INDICATORS },
    { icon: CheckCircle2, label: 'Compliance Audits', href: ROUTES.QUALITY_MGMT_AUDITS }
  ]}
];

// ─── Accreditation ────────────────────────────────────────────────────────────
const accreditationSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Award, label: 'Accreditation Hub', href: ROUTES.ACCREDITATION_DASHBOARD }]},
  { title: 'Compliance', items: [
    { icon: Gavel, label: 'Standards & Rules', href: ROUTES.ACCREDITATION_STANDARDS },
    { icon: ScrollText, label: 'Evidence Binder', href: ROUTES.ACCREDITATION_EVIDENCE }
  ]},
  { title: 'Evaluation', items: [
    { icon: FileSearch, label: 'Gap Analysis', href: ROUTES.ACCREDITATION_GAP_ANALYSIS },
    { icon: ClipboardList, label: 'Mock Surveys', href: ROUTES.ACCREDITATION_SURVEYS }
  ]}
];

// ─── Ethics ───────────────────────────────────────────────────────────────────
const ethicsSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Scale, label: 'Ethics Dashboard', href: ROUTES.ETHICS_DASHBOARD }]},
  { title: 'Clinical Ethics', items: [
    { icon: MessageSquare, label: 'Consultations', href: ROUTES.ETHICS_CONSULTATIONS },
    { icon: Heart, label: 'Policy Review', href: ROUTES.ETHICS_POLICIES }
  ]},
  { title: 'Governance', items: [
    { icon: Users, label: 'Ethics Committee', href: ROUTES.ETHICS_COMMITTEE },
    { icon: ShieldCheck, label: 'COI Tracking', href: ROUTES.ETHICS_COI }
  ]}
];

// ─── Data Governance ──────────────────────────────────────────────────────────
const dataGovernanceSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Shield, label: 'Governance Hub', href: ROUTES.DATA_GOVERNANCE_DASHBOARD }]},
  { title: 'Privacy & Policy', items: [
    { icon: Lock, label: 'Privacy Control', href: ROUTES.DATA_GOVERNANCE_PRIVACY },
    { icon: ScrollText, label: 'Data Policies', href: ROUTES.DATA_GOVERNANCE_POLICIES }
  ]},
  { title: 'Management', items: [
    { icon: Database, label: 'Data Catalog', href: ROUTES.DATA_GOVERNANCE_CATALOG },
    { icon: GitBranch, label: 'Data Lineage', href: ROUTES.DATA_GOVERNANCE_LINEAGE }
  ]}
];

// ─── Compliance Governance ────────────────────────────────────────────────────
const complianceGovSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Gavel, label: 'Compliance Dashboard', href: ROUTES.COMPLIANCE_DASHBOARD }]},
  { title: 'Audits & Risks', items: [
    { icon: ClipboardList, label: 'Audit Registry', href: ROUTES.COMPLIANCE_AUDITS },
    { icon: AlertTriangle, label: 'Risk Register', href: ROUTES.COMPLIANCE_RISK_REGISTER }
  ]},
  { title: 'Correction', items: [
    { icon: ShieldCheck, label: 'Non-Conformance', href: ROUTES.COMPLIANCE_NON_CONFORMANCE },
    { icon: BookCheck, label: 'Compliance Training', href: ROUTES.COMPLIANCE_TRAINING }
  ]}
];

// ─── Workflow Engine ──────────────────────────────────────────────────────────
const workflowSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Workflow, label: 'Workflow Console', href: ROUTES.WORKFLOW_DASHBOARD }]},
  { title: 'Orchestration', items: [
    { icon: GitBranch, label: 'Process Models', href: ROUTES.WORKFLOW_DEFINITIONS },
    { icon: ListChecks, label: 'Active Tasks', href: ROUTES.WORKFLOW_TASKS }
  ]},
  { title: 'Intelligence', items: [
    { icon: Zap, label: 'Automations', href: ROUTES.WORKFLOW_AUTOMATIONS },
    { icon: BarChart3, label: 'BPM Analytics', href: ROUTES.WORKFLOW_ANALYTICS }
  ]}
];

// ─── Config Service ───────────────────────────────────────────────────────────
const configSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Settings, label: 'Config Dashboard', href: ROUTES.CONFIG_DASHBOARD }]},
  { title: 'Environment', items: [
    { icon: Globe, label: 'Global Settings', href: ROUTES.CONFIG_GLOBAL },
    { icon: Flag, label: 'Feature Flags', href: ROUTES.CONFIG_FEATURE_FLAGS }
  ]},
  { title: 'Governance', items: [
    { icon: Sliders, label: 'Tenant Overrides', href: ROUTES.CONFIG_TENANT_OVERRIDES },
    { icon: History, label: 'Audit Log', href: ROUTES.CONFIG_AUDIT_LOG }
  ]}
];

// ─── Rostering Service ────────────────────────────────────────────────────────
const rosteringSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Calendar, label: 'Staff Roster Hub', href: ROUTES.ROSTERING_DASHBOARD }]},
  { title: 'Scheduling', items: [
    { icon: Clock, label: 'Shift Roster', href: ROUTES.ROSTERING_SHIFTS },
    { icon: Users, label: 'Staff Directory', href: ROUTES.ROSTERING_SCHEDULES }
  ]},
  { title: 'Operations', items: [
    { icon: PlaneTakeoff, label: 'Leave & Time-Off', href: ROUTES.ROSTERING_LEAVE },
    { icon: BarChart3, label: 'Staffing Analytics', href: ROUTES.ROSTERING_ANALYTICS }
  ]}
];

// ─── Performance Service ──────────────────────────────────────────────────────
const performanceSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: TrendingUp, label: 'Performance Hub', href: ROUTES.PERFORMANCE_DASHBOARD }]},
  { title: 'Evaluation', items: [
    { icon: ClipboardList, label: 'Staff Appraisals', href: ROUTES.PERFORMANCE_APPRAISALS },
    { icon: Target, label: 'Clinical KPIs', href: ROUTES.PERFORMANCE_KPIS }
  ]},
  { title: 'Growth', items: [
    { icon: MessageSquare, label: '360° Feedback', href: ROUTES.PERFORMANCE_FEEDBACK },
    { icon: GraduationCap, label: 'Development Goals', href: ROUTES.PERFORMANCE_DEVELOPMENT }
  ]}
];

// ─── Patient Experience ───────────────────────────────────────────────────────
const patientExpSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Heart, label: 'Experience Hub', href: ROUTES.PATIENT_EXP_DASHBOARD }]},
  { title: 'Feedback', items: [
    { icon: ClipboardList, label: 'Satisfaction Surveys', href: ROUTES.PATIENT_EXP_SURVEYS },
    { icon: MessageSquare, label: 'Grievance Tracking', href: ROUTES.PATIENT_EXP_GRIEVANCES }
  ]},
  { title: 'Advocacy', items: [
    { icon: LifeBuoy, label: 'Patient Requests', href: ROUTES.PATIENT_EXP_REQUESTS },
    { icon: BarChart3, label: 'Sentiment Analytics', href: ROUTES.PATIENT_EXP_ANALYTICS }
  ]}
];

// ─── Case Management ──────────────────────────────────────────────────────────
const caseMgmtSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Briefcase, label: 'Case Control Plane', href: ROUTES.CASE_MGMT_DASHBOARD }]},
  { title: 'Planning', items: [
    { icon: LogOut, label: 'Discharge Planning', href: ROUTES.CASE_MGMT_DISCHARGE },
    { icon: FileCheck, label: 'Utilization Review', href: ROUTES.CASE_MGMT_UTILIZATION }
  ]},
  { title: 'Coordination', items: [
    { icon: GitMerge, label: 'Care Coordination', href: ROUTES.CASE_MGMT_COORDINATION },
    { icon: UserCheck, label: 'Social Work Referrals', href: ROUTES.CASE_MGMT_REFERRALS }
  ]}
];

// ─── Fleet Management ─────────────────────────────────────────────────────────
const fleetSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Truck, label: 'Fleet Control Hub', href: ROUTES.FLEET_DASHBOARD }]},
  { title: 'Operations', items: [
    { icon: Navigation, label: 'Dispatch Center', href: ROUTES.FLEET_DISPATCH },
    { icon: MapPin, label: 'Real-time Tracking', href: ROUTES.FLEET_TRACKING }
  ]},
  { title: 'Maintenance', items: [
    { icon: Wrench, label: 'Vehicle Service', href: ROUTES.FLEET_MAINTENANCE },
    { icon: Users, label: 'Driver Registry', href: ROUTES.FLEET_VEHICLES }
  ]}
];

// ─── Biomedical Engineering ───────────────────────────────────────────────────
const biomedSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Monitor, label: 'Biomed Control Hub', href: ROUTES.BIOMED_DASHBOARD }]},
  { title: 'Asset Mgmt', items: [
    { icon: Activity, label: 'Medical Equipment', href: ROUTES.BIOMED_EQUIPMENT },
    { icon: Package, label: 'Parts Inventory', href: ROUTES.BIOMED_INVENTORY }
  ]},
  { title: 'Service', items: [
    { icon: Wrench, label: 'Maintenance Log', href: ROUTES.BIOMED_MAINTENANCE },
    { icon: Thermometer, label: 'Calibration Sync', href: ROUTES.BIOMED_CALIBRATION }
  ]}
];

// ─── Diet & Nutrition ─────────────────────────────────────────────────────────
const nutritionSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Utensils, label: 'Nutrition Hub', href: ROUTES.NUTRITION_DASHBOARD }]},
  { title: 'Clinical', items: [
    { icon: ClipboardList, label: 'Dietary Orders', href: ROUTES.NUTRITION_DIETARY_ORDERS },
    { icon: Activity, label: 'Patient Assessment', href: ROUTES.NUTRITION_ASSESSMENT }
  ]},
  { title: 'Operations', items: [
    { icon: Apple, label: 'Meal Planning', href: ROUTES.NUTRITION_MEAL_PLANNING },
    { icon: Flame, label: 'Kitchen Operations', href: ROUTES.NUTRITION_KITCHEN }
  ]}
];

// ─── Housekeeping ─────────────────────────────────────────────────────────────
const housekeepingSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Sparkles, label: 'Housekeeping Hub', href: ROUTES.HOUSEKEEPING_DASHBOARD }]},
  { title: 'Facility', items: [
    { icon: LayoutGrid, label: 'Room Status', href: ROUTES.HOUSEKEEPING_ROOMS },
    { icon: CheckCircle2, label: 'Cleaning Tasks', href: ROUTES.HOUSEKEEPING_CLEANING }
  ]},
  { title: 'Logistics', items: [
    { icon: Wind, label: 'Linen Management', href: ROUTES.HOUSEKEEPING_LINEN },
    { icon: Trash2, label: 'Waste Disposal', href: ROUTES.HOUSEKEEPING_WASTE }
  ]}
];

// ─── Incident Management ──────────────────────────────────────────────────────
const incidentSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: ShieldAlert, label: 'Incident Command', href: ROUTES.INCIDENT_DASHBOARD }]},
  { title: 'Reporting', items: [
    { icon: FileWarning, label: 'Active Reports', href: ROUTES.INCIDENT_REPORTS },
    { icon: Search, label: 'Investigations', href: ROUTES.INCIDENT_INVESTIGATIONS }
  ]},
  { title: 'Analysis', items: [
    { icon: GitBranch, label: 'Root Cause Analysis', href: ROUTES.INCIDENT_RCA },
    { icon: BarChart3, label: 'Safety Analytics', href: ROUTES.INCIDENT_ANALYTICS }
  ]}
];

// ─── Risk Management ──────────────────────────────────────────────────────────
const riskMgmtSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: ShieldCheck, label: 'Risk Control Hub', href: ROUTES.RISK_MGMT_DASHBOARD }]},
  { title: 'Registry', items: [
    { icon: List, label: 'Risk Register', href: ROUTES.RISK_MGMT_REGISTER },
    { icon: ClipboardCheck, label: 'Assessments', href: ROUTES.RISK_MGMT_ASSESSMENTS }
  ]},
  { title: 'Governance', items: [
    { icon: HeartHandshake, label: 'Mitigation Plans', href: ROUTES.RISK_MGMT_MITIGATION },
    { icon: Gavel, label: 'Insurance & Legal', href: ROUTES.RISK_MGMT_INSURANCE }
  ]}
];

// ─── Vendor Management ────────────────────────────────────────────────────────
const vendorSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Store, label: 'Vendor Hub', href: ROUTES.VENDOR_DASHBOARD }]},
  { title: 'Registry', items: [
    { icon: Briefcase, label: 'Vendor Directory', href: ROUTES.VENDOR_DIRECTORY },
    { icon: FileText, label: 'Active Contracts', href: ROUTES.VENDOR_CONTRACTS }
  ]},
  { title: 'Performance', items: [
    { icon: Star, label: 'SLA Performance', href: ROUTES.VENDOR_PERFORMANCE },
    { icon: ShieldCheck, label: 'Compliance Audit', href: ROUTES.VENDOR_COMPLIANCE }
  ]}
];

// ─── Insurance Integration ────────────────────────────────────────────────────
const insuranceSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: ShieldCheck, label: 'Insurance Hub', href: ROUTES.INSURANCE_DASHBOARD }]},
  { title: 'Operations', items: [
    { icon: FileCheck, label: 'Claims Engine', href: ROUTES.INSURANCE_CLAIMS },
    { icon: CreditCard, label: 'Eligibility Check', href: ROUTES.INSURANCE_ELIGIBILITY }
  ]},
  { title: 'Governance', items: [
    { icon: History, label: 'Prior Auth Registry', href: ROUTES.INSURANCE_AUTHORIZATION },
    { icon: PieChart, label: 'Payer Performance', href: ROUTES.INSURANCE_PAYERS }
  ]}
];

// ─── Regulator Integration ────────────────────────────────────────────────────
const regulatorSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Landmark, label: 'Compliance Hub', href: ROUTES.REGULATOR_DASHBOARD }]},
  { title: 'Reporting', items: [
    { icon: Send, label: 'Statutory Submissions', href: ROUTES.REGULATOR_SUBMISSIONS },
    { icon: FileBadge, label: 'Licenses & Certs', href: ROUTES.REGULATOR_LICENSES }
  ]},
  { title: 'Oversight', items: [
    { icon: ShieldCheck, label: 'Regulator Audits', href: ROUTES.REGULATOR_AUDITS },
    { icon: BellRing, label: 'Directives & Alerts', href: ROUTES.REGULATOR_DIRECTIVES }
  ]}
];

// ─── Mortuary Service ─────────────────────────────────────────────────────────
const mortuarySections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Skull, label: 'Mortuary Command', href: ROUTES.MORTUARY_DASHBOARD }]},
  { title: 'Ops', items: [
    { icon: MoveDown, label: 'Intake / Registry', href: ROUTES.MORTUARY_INTAKE },
    { icon: Box, label: 'Storage & Capacity', href: ROUTES.MORTUARY_STORAGE }
  ]},
  { title: 'Governance', items: [
    { icon: MoveUp, label: 'Release / Burial', href: ROUTES.MORTUARY_RELEASE },
    { icon: Stethoscope, label: 'Autopsy / Forensic', href: ROUTES.MORTUARY_AUTOPSY }
  ]}
];

// ─── Forensic Service ─────────────────────────────────────────────────────────
const forensicSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Fingerprint, label: 'Forensic Hub', href: ROUTES.FORENSIC_DASHBOARD }]},
  { title: 'Investigation', items: [
    { icon: Briefcase, label: 'Case Registry', href: ROUTES.FORENSIC_CASES },
    { icon: ShieldAlert, label: 'Evidence Control', href: ROUTES.FORENSIC_EVIDENCE }
  ]},
  { title: 'Medico-Legal', items: [
    { icon: FileText, label: 'Legal Reporting', href: ROUTES.FORENSIC_DOCS },
    { icon: Scale, label: 'Court & Witness', href: ROUTES.FORENSIC_COURT }
  ]}
];

// ─── Transplant Coordination ──────────────────────────────────────────────────
const transplantSections: NavSection[] = [
  { title: 'Overview', items: [{ icon: Activity, label: 'Transplant Hub', href: ROUTES.TRANSPLANT_DASHBOARD }]},
  { title: 'Waitlist', items: [
    { icon: ClipboardList, label: 'Waiting List', href: ROUTES.TRANSPLANT_WAITLIST },
    { icon: HeartPulse, label: 'Donor Registry', href: ROUTES.TRANSPLANT_DONORS }
  ]},
  { title: 'Ops', items: [
    { icon: GitMerge, label: 'Matching & Compatibility', href: ROUTES.TRANSPLANT_MATCHING },
    { icon: Truck, label: 'Organ Logistics', href: ROUTES.TRANSPLANT_LOGISTICS }
  ]}
];

// CDSS-only view for clinical roles
const cdssOnlySections: NavSection[] = [
  { title: 'Clinical AI', items: [
    { icon: Siren,       label: 'CDSS Alerts',     href: ROUTES.AI_PLATFORM_CDSS      },
    { icon: BrainCircuit,label: 'AI Model Status',  href: ROUTES.AI_PLATFORM_MONITORING},
    { icon: Network,     label: 'Digital Twins',   href: ROUTES.AI_PLATFORM_TWINS     },
  ]},
];

const menuSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Home, label: 'Dashboard', href: ROUTES.DASHBOARD },
  ]},
  { title: 'Clinical Core', items: [
    { icon: Users, label: 'Patients', href: ROUTES.PATIENTS },
    { icon: Stethoscope, label: 'Clinical', href: ROUTES.CLINICAL },
    { icon: Activity, label: 'Diagnostics', href: ROUTES.DIAGNOSTICS },
    { icon: Pill, label: 'Pharmacy', href: ROUTES.PHARMACY },
    { icon: Heart, label: 'Nursing', href: ROUTES.NURSING },
    { icon: Scissors, label: 'OT Management', href: ROUTES.OT },
    { icon: Thermometer, label: 'ICU', href: ROUTES.ICU },
    { icon: Siren, label: 'Emergency', href: ROUTES.ER },
    { icon: Droplets, label: 'Blood Bank', href: ROUTES.BLOOD_BANK },
    { icon: Bug, label: 'Infection Control', href: ROUTES.INFECTION },
    { icon: FileText, label: 'Medical Records', href: ROUTES.RECORDS },
  ]},
  { title: 'Operations', items: [
    { icon: Calendar, label: 'Appointments', href: ROUTES.APPOINTMENTS },
    { icon: CreditCard, label: 'Billing', href: ROUTES.BILLING },
    { icon: Package, label: 'Inventory', href: ROUTES.INVENTORY },
    { icon: UserCog, label: 'HR & Staff', href: ROUTES.HR },
    { icon: Building2, label: 'Facilities', href: ROUTES.FACILITIES },
    { icon: ClipboardList, label: 'Orders', href: ROUTES.ORDERS },
  ]},
  { title: 'Platform', items: [
    { icon: Video, label: 'Telemedicine', href: ROUTES.TELEMEDICINE },
    { icon: BarChart3, label: 'Analytics', href: ROUTES.ANALYTICS },
    { icon: Cpu, label: 'IoMT Devices', href: ROUTES.DEVICES },
    { icon: Shield, label: 'IAM & ZTA', href: ROUTES.IAM },
    { icon: Lock, label: 'Security', href: ROUTES.SECURITY },
    { icon: Gavel, label: 'Compliance', href: ROUTES.COMPLIANCE },
    { icon: Monitor, label: 'Monitoring', href: ROUTES.MONITORING },
  ]},
];

const ztaEngineerSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Shield, label: 'ZTA Command Center', href: ROUTES.ZT_NETWORK_DASHBOARD },
  ]},
  { title: 'Network Control', items: [
    { icon: Lock, label: 'Access Policies', href: ROUTES.ZT_NETWORK_POLICIES },
    { icon: Network, label: 'Active Sessions', href: ROUTES.ZT_NETWORK_SESSIONS },
  ]},
  { title: 'Endpoints & Trust', items: [
    { icon: Monitor, label: 'Device Posture', href: ROUTES.ZT_NETWORK_POSTURE },
    { icon: KeyRound, label: 'Step CA (PKI)', href: ROUTES.ZT_NETWORK_STEP_CA },
  ]},
  { title: 'Auditing', items: [
    { icon: FileSearch, label: 'Access Decisions', href: ROUTES.ZT_NETWORK_DECISIONS },
  ]},
];

const himSections: NavSection[] = [
  { title: 'Health Info Mgmt', items: [
    { icon: Users, label: 'Master Patient Index', href: ROUTES.EHR_PATIENTS },
    { icon: FileText, label: 'EHR Validation', href: ROUTES.EHR_VALIDATION },
    { icon: Activity, label: 'HIM Dashboard', href: ROUTES.HIM_DASHBOARD },
  ]},
];

const iamAdminSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Shield, label: 'IAM Dashboard', href: ROUTES.IAM },
  ]},
  { title: 'Identity', items: [
    { icon: Users, label: 'Users & Groups', href: '/dashboard/iam/users' },
    { icon: KeyRound, label: 'Roles (RBAC/ABAC)', href: '/dashboard/iam/roles' },
    { icon: Lock, label: 'Policies', href: '/dashboard/iam/policies' },
  ]},
  { title: 'Access & Auth', items: [
    { icon: ShieldCheck, label: 'Auth Methods (MFA)', href: '/dashboard/iam/auth' },
    { icon: CheckSquare, label: 'Access Requests', href: '/dashboard/iam/requests' },
    { icon: ScrollText, label: 'Access Reviews', href: '/dashboard/iam/reviews' },
  ]},
  { title: 'Governance', items: [
    { icon: FileSearch, label: 'Audit Logs', href: '/dashboard/iam/audit' },
  ]}
];

const pamAdminSections: NavSection[] = [
  { title: 'Overview', items: [
    { icon: Shield, label: 'PAM Workspace', href: ROUTES.PAM_DASHBOARD },
  ]},
  { title: 'Live Control', items: [
    { icon: Terminal, label: 'Live Monitoring', href: ROUTES.PAM_MONITORING },
    { icon: Activity, label: 'Active Sessions', href: ROUTES.PAM_SESSIONS },
  ]},
  { title: 'Access & Policy', items: [
    { icon: KeyRound, label: 'Vaulted Accounts', href: ROUTES.PAM_ACCESS },
    { icon: Lock, label: 'PAM Policies', href: ROUTES.PAM_POLICIES },
    { icon: CheckSquare, label: 'JIT Requests', href: ROUTES.PAM_REQUESTS },
  ]},
  { title: 'Audit & Compliance', items: [
    { icon: Video, label: 'Session Recordings', href: ROUTES.PAM_RECORDINGS },
    { icon: AlertTriangle, label: 'Risk Alerts', href: ROUTES.PAM_ALERTS },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname();
  const isDesktop = useIsDesktop();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const mobileOpen = useUIStore((s) => s.sidebarMobileOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarMobileOpen = useUIStore((s) => s.setSidebarMobileOpen);
  const { user } = useAuth();

  const roleStr = user?.roles.join(' ').toLowerCase() || '';

  const isSuperAdminRole = roleStr.includes('super administrator');
  const isBoardRole = roleStr.includes('board member') || roleStr.includes('tenant_admin');
  const isCeoRole = roleStr.includes('chief executive officer');
  const isCooRole = roleStr.includes('chief operating officer');
  const isCmoRole = roleStr.includes('chief medical officer');
  const isCnoRole = roleStr.includes('chief nursing officer');
  const isCioRole = roleStr.includes('chief information officer');
  const isCisoRole = roleStr.includes('chief information security officer');
  const isCfoRole = roleStr.includes('chief financial officer');
  const isCcoRole = roleStr.includes('chief compliance officer');
  const isCtoRole = roleStr.includes('chief technology officer');
  const isMarketingRole = roleStr.includes('marketing');
  const isMedDirectorRole = roleStr.includes('medical director');
  const isSuperintendentRole = roleStr.includes('medical superintendent') && !roleStr.includes('deputy');
  const isDeputyMSRole = roleStr.includes('deputy') && roleStr.includes('superintendent') && !roleStr.includes('nursing');
  const isHODRole = roleStr.includes('head of department');
  const isUnitHeadRole = roleStr.includes('unit head') || roleStr.includes('clinical director');
  const isSurgeonRole = roleStr.includes('surgeon') && !roleStr.includes('orthopedic');
  const isIntensivistRole = roleStr.includes('intensivist');
  const isERRole = roleStr.includes('emergency physician');
  const isDoctorRole = roleStr.includes('doctor') && !roleStr.includes('locum') && !roleStr.includes('resident');
  const isGPRole = roleStr.includes('general physician');
  const isLocumRole = roleStr.includes('locum');
  const isSrRole = roleStr.includes('senior resident');
  const isJrRole = roleStr.includes('junior resident');
  const isResidentRole = roleStr.includes('resident') && !roleStr.includes('senior') && !roleStr.includes('junior');
  const isInternRole = roleStr.includes('intern');
  const isStudentRole = roleStr.includes('student');
  const isNursingSupRole = roleStr.includes('nursing superintendent') && !roleStr.includes('deputy');
  const isDeputyNursingRole = roleStr.includes('deputy') && roleStr.includes('nursing');
  const isWardInChargeRole = roleStr.includes('ward in-charge') || roleStr.includes('head nurse');
  const isIcuNurseRole = roleStr.includes('icu nurse');
  const isErNurseRole = roleStr.includes('er nurse');
  const isOtNurseRole = roleStr.includes('ot nurse');
  const isTriageNurseRole = roleStr.includes('triage nurse');
  const isIcnRole = roleStr.includes('infection control nurse');
  const isNurseRole = roleStr.includes('nurse') && !roleStr.includes('icu') && !roleStr.includes('er') && !roleStr.includes('ot') && !roleStr.includes('triage') && !roleStr.includes('superintendent') && !roleStr.includes('head');
  const isAssistantRole = roleStr.includes('nursing assistant');
  const isAnmRole = roleStr.includes('anm') || roleStr.includes('auxiliary nurse');
  const isSreRole = roleStr.includes('site reliability engineer') || roleStr.includes('sre');
  const isItOpsRole = roleStr.includes('it operations');

  const isBloodBankRole = roleStr.includes('blood bank officer');
  const isBloodTechRole = roleStr.includes('blood bank technician');
  const isPainRole = roleStr.includes('pain management');
  const isGeneticRole = roleStr.includes('genetic counselor');
  const isInfosecRole = roleStr.includes('infosec compliance');
  const isRiskManagerRole = roleStr.includes('infosec risk');
  const isDpoRole = roleStr.includes('data protection officer');
  const isInternalAuditorRole = roleStr.includes('internal auditor');
  const isDevOpsRole = roleStr.includes('devops');
  const isDevSecOpsRole = roleStr.includes('devsecops');
  const isSoftDevRole = roleStr.includes('software developer');
  const isManagementRole = roleStr.includes('management') || roleStr.includes('operations manager') || roleStr.includes('hospital admin') || roleStr.includes('tenant admin');
  const isLegalComplianceRole = roleStr.includes('compliance officer') || roleStr.includes('legal') || roleStr.includes('statutory') || roleStr.includes('chief compliance officer');
  const isComplianceRole = roleStr.includes('compliance') && !roleStr.includes('chief compliance officer') && !roleStr.includes('compliance officer');
  const isAuditRole = roleStr.includes('auditor') || roleStr.includes('audit manager') || roleStr.includes('chief audit');
  const isIntegrationRole = roleStr.includes('integration engineer');
  const isApiGatewayRole = roleStr.includes('gateway manager');
  const isQARole = roleStr.includes('qa') || roleStr.includes('test engineer');
  const isDataEngRole = roleStr.includes('data engineer');
  const isDataAnalystRole = roleStr.includes('data analyst');
  const isMlEngineerRole = roleStr.includes('ml engineer');
  const isInformaticistRole = roleStr.includes('clinical informaticist');
  const isDataScientistRole = roleStr.includes('data scientist');
  const isAiEthicsRole = roleStr.includes('ai ethics');
  const isAiGovRole = roleStr.includes('ai governance');
  const isIomtRole = roleStr.includes('iomt');
  const isServiceAccountRole = roleStr.includes('service accounts');
  const isAutomationRole = roleStr.includes('automation');
  const isSocAnalystRole = roleStr.includes('soc analyst');
  const isIncidentResponderRole = roleStr.includes('incident responder');
  const isSecurityEngineerRole = roleStr.includes('security engineer');
  const isThreatIntelRole = roleStr.includes('threat intelligence');
  const isIamAdminRole = roleStr.includes('iam') || roleStr.includes('identity');
  const isPamAdminRole = roleStr.includes('pam') || roleStr.includes('privileged access');
  // AI Platform roles — unified hub for all ML / AI / Data science personas
  const isAiPlatformRole = roleStr.includes('ml engineer') || roleStr.includes('ai/ml')
    || roleStr.includes('health data scientist') || roleStr.includes('clinical informaticist')
    || roleStr.includes('ai platform') || roleStr.includes('data scientist');
  const isZtaEngineerRole = roleStr.includes('zta') || roleStr.includes('zero trust');
  const isHimRole = roleStr.includes('him') || roleStr.includes('health information');
  const isClinicalResearchRole = roleStr.includes('researcher') || roleStr.includes('clinical research') || roleStr.includes('trial coordinator') || roleStr.includes('research nurse');
  const isPopHealthRole = roleStr.includes('population health') || roleStr.includes('epidemiologist') || roleStr.includes('public health');
  const isMlopsRole = roleStr.includes('mlops') || roleStr.includes('machine learning operations');
  const isTfServingRole = roleStr.includes('model serving') || roleStr.includes('ml infra');
  const isMedEdRole = roleStr.includes('med ed') || roleStr.includes('education') || roleStr.includes('resident') || roleStr.includes('student');
  const isCredentialingRole = roleStr.includes('credentialing') || roleStr.includes('medical staff office') || roleStr.includes('privileging');
  const isQualityMgmtRole = roleStr.includes('quality') || roleStr.includes('patient safety') || roleStr.includes('compliance');
  const isAccreditationRole = roleStr.includes('accreditation') || roleStr.includes('surveyor') || roleStr.includes('standards officer');
  const isEthicsRole = roleStr.includes('ethics') || roleStr.includes('bioethics') || roleStr.includes('committee member');
  const isDataGovernanceRole = roleStr.includes('data governance') || roleStr.includes('data steward') || roleStr.includes('privacy officer');
  const isComplianceGovRole = roleStr.includes('compliance') || roleStr.includes('regulatory') || roleStr.includes('auditor');
  const isWorkflowRole = roleStr.includes('workflow') || roleStr.includes('process engineer') || roleStr.includes('automation');
  const isConfigRole = roleStr.includes('config') || roleStr.includes('system admin') || roleStr.includes('devops');
  const isRosteringRole = roleStr.includes('roster') || roleStr.includes('scheduling') || roleStr.includes('hr') || roleStr.includes('nursing supervisor');
  const isPerformanceRole = roleStr.includes('performance') || roleStr.includes('appraisal') || roleStr.includes('quality lead');
  const isPatientExpRole = roleStr.includes('patient experience') || roleStr.includes('advocacy') || roleStr.includes('ombudsman') || roleStr.includes('patient relations');
  const isCaseMgmtRole = roleStr.includes('case management') || roleStr.includes('discharge planner') || roleStr.includes('social worker') || roleStr.includes('utilization review');
  const isFleetRole = roleStr.includes('fleet') || roleStr.includes('transport') || roleStr.includes('ambulance') || roleStr.includes('logistics');
  const isBiomedRole = roleStr.includes('biomed') || roleStr.includes('engineering') || roleStr.includes('equipment technician');
  const isNutritionRole = roleStr.includes('nutrition') || roleStr.includes('dietary') || roleStr.includes('dietitian') || roleStr.includes('food service');
  const isHousekeepingRole = roleStr.includes('housekeeping') || roleStr.includes('janitorial') || roleStr.includes('environmental service') || roleStr.includes('cleaning');
  const isIncidentRole = roleStr.includes('incident') || roleStr.includes('risk') || roleStr.includes('safety') || roleStr.includes('quality assurance');
  const isRiskMgmtRole = roleStr.includes('risk manager') || roleStr.includes('enterprise risk') || roleStr.includes('insurance manager');
  const isVendorRole = roleStr.includes('vendor') || roleStr.includes('procurement') || roleStr.includes('contracts manager') || roleStr.includes('supply chain');
  const isInsuranceRole = roleStr.includes('insurance') || roleStr.includes('billing') || roleStr.includes('claims') || roleStr.includes('revenue cycle');
  const isRegulatorRole = roleStr.includes('regulator') || roleStr.includes('compliance officer') || roleStr.includes('statutory') || roleStr.includes('inspector');
  const isMortuaryRole = roleStr.includes('mortuary') || roleStr.includes('forensic tech') || roleStr.includes('funeral manager') || roleStr.includes('anatomical');
  const isForensicRole = roleStr.includes('forensic') || roleStr.includes('medico-legal') || roleStr.includes('expert witness') || roleStr.includes('pathologist');
  const isTransplantRole = roleStr.includes('transplant') || roleStr.includes('coordinator') || roleStr.includes('organ bank') || roleStr.includes('procurement');

  const roleSpecificSections = isSuperAdminRole ? superAdminSections : isBoardRole ? boardSections : isCeoRole ? ceoSections : isCooRole ? cooSections : isCmoRole ? cmoSections : isCnoRole ? cnoSections : isCioRole ? cioSections : isCisoRole ? cisoSections : isCfoRole ? cfoSections : isCcoRole ? ccoSections : isCtoRole ? ctoSections : isMarketingRole ? marketingSections : isMedDirectorRole ? medDirectorSections : isSuperintendentRole ? superintendentSections : isDeputyMSRole ? deputyMSSections : isHODRole ? hodSections : isUnitHeadRole ? unitHeadSections : isSurgeonRole ? surgeonSections : isERRole ? erSections : isIntensivistRole ? intensivistSections : isLocumRole ? locumSections : isSrRole ? srSections : isJrRole ? jrSections : isResidentRole ? residentSections : isInternRole ? internSections : isStudentRole ? studentSections : isNursingSupRole ? nursingSupSections : isDeputyNursingRole ? deputyNursingSections : isWardInChargeRole ? wardInChargeSections : isIcuNurseRole ? icuNurseSections : isErNurseRole ? erNurseSections : isOtNurseRole ? otNurseSections : isTriageNurseRole ? triageNurseSections : isIcnRole ? icnSections : isNurseRole ? nurseSections : isAssistantRole ? assistantSections : isAnmRole ? anmSections : isSreRole ? sreSections : isItOpsRole ? itOpsSections : isForensicRole ? forensicSections : isBloodBankRole ? bloodBankSections : isBloodTechRole ? bloodTechSections : isPainRole ? painSections : isGeneticRole ? geneticSections : isInfosecRole ? infosecSections : isRiskManagerRole ? riskManagerSections : isDpoRole ? dpoSections : isInternalAuditorRole ? internalAuditorSections : isDevOpsRole ? devopsSections : isDevSecOpsRole ? devSecOpsSections : isSoftDevRole ? softDevSections : isManagementRole ? managementSections : isLegalComplianceRole ? legalComplianceSections : isComplianceRole ? complianceSections : isAuditRole ? auditSections : isIntegrationRole ? integrationSections : isApiGatewayRole ? apiGatewaySections : isQARole ? qaSections : isDataEngRole ? dataEngSections : isDataAnalystRole ? dataAnalystSections
    // AI Platform roles — get the full hub
    : isAiPlatformRole ? aiPlatformSections
    : isMlEngineerRole ? aiPlatformSections
    : isInformaticistRole ? aiPlatformSections
    : isDataScientistRole ? aiPlatformSections
    : isMlopsRole ? mlflowSections
    : isTfServingRole ? tfServingSections
    : isMedEdRole ? medEdSections
    : isCredentialingRole ? credentialingSections
    : isQualityMgmtRole ? qualityMgmtSections
    : isAccreditationRole ? accreditationSections
    : isEthicsRole ? ethicsSections
    : isDataGovernanceRole ? dataGovernanceSections
    : isComplianceGovRole ? complianceGovSections
    : isWorkflowRole ? workflowSections
    : isConfigRole ? configSections
    : isRosteringRole ? rosteringSections
    : isPerformanceRole ? performanceSections
    : isPatientExpRole ? patientExpSections
    : isCaseMgmtRole ? caseMgmtSections
    : isFleetRole ? fleetSections
    : isBiomedRole ? biomedSections
    : isNutritionRole ? nutritionSections
    : isHousekeepingRole ? housekeepingSections
    : isIncidentRole ? incidentSections
    : isRiskMgmtRole ? riskMgmtSections
    : isVendorRole ? vendorSections
    : isInsuranceRole ? insuranceSections
    : isRegulatorRole ? regulatorSections
    : isMortuaryRole ? mortuarySections
    : isForensicRole ? forensicSections
    : isTransplantRole ? transplantSections
    : isClinicalResearchRole ? clinicalResearchSections
    : isPopHealthRole ? popHealthSections
    : isAiEthicsRole ? aiEthicsSections
    : isAiGovRole ? aiGovernanceSections
    : isIomtRole ? iomtSections : isServiceAccountRole ? serviceAccountSections : isAutomationRole ? automationSections : isSocAnalystRole ? socAnalystSections : isIncidentResponderRole ? incidentResponderSections : isSecurityEngineerRole ? securityEngineerSections : isThreatIntelRole ? threatIntelSections : isIamAdminRole ? iamAdminSections : isPamAdminRole ? pamAdminSections : isZtaEngineerRole ? ztaEngineerSections : isHimRole ? himSections : isDoctorRole ? doctorSections : isGPRole ? gpSections : [];

  // Append AI Platform CDSS section to clinical roles that benefit from AI alerts
  const clinicalRoleWithAi = (isCmoRole || isMedDirectorRole || isHODRole || isUnitHeadRole || isDoctorRole || isSurgeonRole || isERRole || isIntensivistRole) && roleSpecificSections.length > 0;
  const activeSections = roleSpecificSections.length > 0
    ? clinicalRoleWithAi
      ? [...roleSpecificSections, ...cdssOnlySections, ...menuSections.slice(1)]
      : [...roleSpecificSections, ...menuSections.slice(1)]
    : menuSections;

  const open = isDesktop ? !collapsed : mobileOpen;

  return (
    <>
      {/* Mobile overlay */}
      {!isDesktop && mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarMobileOpen(false)} />
      )}

      <aside className={cn(
        'flex flex-col bg-surface-dark border-r border-white/[0.06] transition-all duration-300 z-sidebar',
        isDesktop ? (collapsed ? 'w-16' : 'w-[260px]') : 'fixed inset-y-0 left-0 w-[260px]',
        !isDesktop && !mobileOpen && '-translate-x-full',
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {open && (
              <div className="animate-fade-in">
                <h1 className="text-sm font-bold text-white tracking-tight">MedTrustX</h1>
                <p className="text-2xs text-gray-500 uppercase tracking-widest">DHOS Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle (desktop only) */}
        {isDesktop && (
          <button onClick={toggleSidebar} className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface border border-white/10 flex items-center justify-center text-gray-400 hover:text-white z-10 transition-colors">
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-5">
          {activeSections.map((section) => (
            <div key={section.title}>
              {open && <p className="px-4 mb-2 text-2xs font-semibold uppercase tracking-widest text-gray-600">{section.title}</p>}
              <div className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const active = pathname === item.href || pathname?.startsWith(item.href + '/');
                  return (
                    <Link key={item.href} href={item.href} className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      active ? 'bg-teal-500/10 text-teal-400 border-l-2 border-teal-500 ml-0' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]',
                      !open && 'justify-center px-0',
                    )}>
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {open && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {open && (
          <div className="p-3 border-t border-white/[0.06] flex-shrink-0">
            <a href={ROUTES.SETTINGS} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </a>
            <div className="mt-2 mx-2 p-2.5 rounded-lg bg-teal-500/5 border border-teal-500/10 text-center">
              <p className="text-2xs text-gray-500 uppercase tracking-wider">Zero Trust</p>
              <p className="text-xs text-teal-400 font-medium">Enforced ✓</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
