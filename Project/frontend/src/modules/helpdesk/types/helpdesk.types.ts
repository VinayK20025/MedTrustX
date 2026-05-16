/**
 * MedTrustX — Helpdesk Support Administrator (Role 96) Types
 */

export interface HelpdeskKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'text' | 'percentage' | 'time';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export type TicketCategory = 'IT Issue' | 'Network' | 'Facility' | 'Admin' | 'Clinical System';
export type TicketStatus = 'New' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TicketLog {
  id: string;
  timestamp: string;
  user: string;
  message: string;
  isInternal: boolean; // true = IT notes, false = visible to reporter
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  reporter: string;
  department: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo?: string; // department or user
  createdAt: string;
  slaBreachAt: string; // ISO string when SLA breaches
  logs: TicketLog[];
}

export interface HelpdeskDashboardData {
  kpis: HelpdeskKPI[];
  tickets: SupportTicket[];
}
