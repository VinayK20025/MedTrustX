/**
 * MedTrustX — Accounts Manager (Role 80) Types
 */

export interface AccountsKPI {
  id: string;
  title: string;
  value: number;
  format: 'currency' | 'percentage' | 'number';
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface RevenueLine {
  department: string;
  today: number;
  mtd: number;
  trend: 'up' | 'down' | 'flat';
}

export interface ExpenseEntry {
  id: string;
  category: 'Salaries' | 'Equipment' | 'Maintenance' | 'Procurement' | 'Utilities' | 'Other';
  description: string;
  amount: number;
  date: string;
  status: 'Approved' | 'Pending' | 'Flagged';
}

export interface InsuranceClaimAccounts {
  id: string;
  patientName: string;
  provider: string;
  claimAmount: number;
  settledAmount?: number;
  submittedAt: string;
  agingDays: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Settled' | 'Appealed';
}

export interface ReconciliationEntry {
  id: string;
  transactionRef: string;
  systemAmount: number;
  bankAmount: number;
  matchStatus: 'Matched' | 'Discrepancy' | 'Unmatched';
  date: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  module: string;
  timestamp: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

export interface AccountsDashboardData {
  kpis: AccountsKPI[];
  revenue: RevenueLine[];
  expenses: ExpenseEntry[];
  claims: InsuranceClaimAccounts[];
  reconciliation: ReconciliationEntry[];
  auditLogs: AuditLogEntry[];
}
