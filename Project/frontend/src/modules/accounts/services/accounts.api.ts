import type {
  AccountsDashboardData, AccountsKPI, RevenueLine, ExpenseEntry,
  InsuranceClaimAccounts, ReconciliationEntry, AuditLogEntry
} from '../types/accounts.types';

export interface AccountsFilters { period?: string; }

const mockKpis: AccountsKPI[] = [
  { id: '1', title: 'Daily Revenue', value: 510000, format: 'currency', trend: 'up', trendValue: '+8.2%', status: 'success' },
  { id: '2', title: 'Daily Expenses', value: 230000, format: 'currency', trend: 'down', trendValue: '-3.1%', status: 'success' },
  { id: '3', title: 'Profit Margin', value: 54.9, format: 'percentage', trend: 'up', trendValue: '+2.4%', status: 'success' },
  { id: '4', title: 'Outstanding', value: 120000, format: 'currency', trend: 'up', trendValue: '+₹18K', status: 'warning' },
];

const mockRevenue: RevenueLine[] = [
  { department: 'OPD Consultations', today: 85000, mtd: 2140000, trend: 'up' },
  { department: 'IPD Room Charges', today: 160000, mtd: 4250000, trend: 'up' },
  { department: 'Pharmacy', today: 95000, mtd: 2680000, trend: 'flat' },
  { department: 'Laboratory', today: 72000, mtd: 1920000, trend: 'up' },
  { department: 'Diagnostics', today: 55000, mtd: 1540000, trend: 'down' },
  { department: 'Procedures / OT', today: 43000, mtd: 1180000, trend: 'flat' },
];

const mockExpenses: ExpenseEntry[] = [
  { id: 'EX-1', category: 'Salaries', description: 'Monthly staff payroll', amount: 1850000, date: new Date().toISOString(), status: 'Approved' },
  { id: 'EX-2', category: 'Procurement', description: 'Surgical supplies — Q2', amount: 340000, date: new Date(Date.now() - 86400000).toISOString(), status: 'Approved' },
  { id: 'EX-3', category: 'Maintenance', description: 'HVAC system repair', amount: 48000, date: new Date(Date.now() - 172800000).toISOString(), status: 'Pending' },
  { id: 'EX-4', category: 'Equipment', description: 'Portable ultrasound unit', amount: 285000, date: new Date(Date.now() - 259200000).toISOString(), status: 'Flagged' },
];

const mockClaims: InsuranceClaimAccounts[] = [
  { id: 'IC-1', patientName: 'Vikram Singh', provider: 'Star Health', claimAmount: 120000, settledAmount: 120000, submittedAt: new Date(Date.now() - 604800000).toISOString(), agingDays: 7, status: 'Settled' },
  { id: 'IC-2', patientName: 'Maya Devi', provider: 'ICICI Lombard', claimAmount: 75000, submittedAt: new Date(Date.now() - 864000000).toISOString(), agingDays: 10, status: 'Pending' },
  { id: 'IC-3', patientName: 'Arjun Nair', provider: 'HDFC Ergo', claimAmount: 42000, submittedAt: new Date(Date.now() - 1296000000).toISOString(), agingDays: 15, status: 'Rejected' },
];

const mockRecon: ReconciliationEntry[] = [
  { id: 'RC-1', transactionRef: 'TXN-88012', systemAmount: 15200, bankAmount: 15200, matchStatus: 'Matched', date: new Date().toISOString() },
  { id: 'RC-2', transactionRef: 'TXN-88013', systemAmount: 8500, bankAmount: 8300, matchStatus: 'Discrepancy', date: new Date().toISOString() },
  { id: 'RC-3', transactionRef: 'TXN-88014', systemAmount: 22000, bankAmount: 0, matchStatus: 'Unmatched', date: new Date(Date.now() - 86400000).toISOString() },
];

const mockAudit: AuditLogEntry[] = [
  { id: 'AL-1', action: 'Bill finalized — ₹52,400', user: 'Billing Exec A', module: 'Billing', timestamp: new Date(Date.now() - 1800000).toISOString(), severity: 'Info' },
  { id: 'AL-2', action: 'Discount override (12%) applied', user: 'Billing Mgr', module: 'Billing', timestamp: new Date(Date.now() - 3600000).toISOString(), severity: 'Warning' },
  { id: 'AL-3', action: 'Expense flagged — ₹2.85L ultrasound', user: 'System', module: 'Expenses', timestamp: new Date(Date.now() - 7200000).toISOString(), severity: 'Critical' },
];

export const accountsApi = {
  getDashboardSummary: async (filters: AccountsFilters) => ({
    data: { kpis: mockKpis, revenue: mockRevenue, expenses: mockExpenses, claims: mockClaims, reconciliation: mockRecon, auditLogs: mockAudit } as AccountsDashboardData,
    message: 'Success', status: 200,
  }),
  approveExpense: async (expenseId: string) => ({ data: { success: true }, message: 'Expense approved', status: 200 }),
  resolveDiscrepancy: async (reconId: string) => ({ data: { success: true }, message: 'Discrepancy resolved', status: 200 }),
  appealClaim: async (claimId: string) => ({ data: { success: true }, message: 'Claim appealed', status: 200 }),
};
