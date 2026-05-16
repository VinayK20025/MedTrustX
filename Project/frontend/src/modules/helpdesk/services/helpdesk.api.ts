import type {
  HelpdeskDashboardData, HelpdeskKPI, SupportTicket
} from '../types/helpdesk.types';

export interface HelpdeskFilters { category?: string; status?: string; priority?: string; }

const mockKpis: HelpdeskKPI[] = [
  { id: '1', title: 'Pending Tickets', value: 12, format: 'number', status: 'warning' },
  { id: '2', title: 'SLA Compliance', value: '94%', format: 'text', status: 'success' },
  { id: '3', title: 'Avg Resolution', value: '25m', format: 'time', status: 'normal' },
  { id: '4', title: 'SLA Breaches', value: 1, format: 'number', status: 'critical' },
];

const mockTickets: SupportTicket[] = [
  { 
    id: 'TKT-9912', 
    title: 'EMR Login Failing', 
    description: 'Nurses in ICU unable to login to EMR system. Receiving 500 error.', 
    reporter: 'Nurse Sarah', 
    department: 'ICU', 
    category: 'Clinical System', 
    status: 'In Progress', 
    priority: 'Critical', 
    assignedTo: 'IT Admins', 
    createdAt: new Date(Date.now() - 1800000).toISOString(), 
    slaBreachAt: new Date(Date.now() - 300000).toISOString(), // Breached 5 mins ago
    logs: [
      { id: 'L1', timestamp: new Date(Date.now() - 1700000).toISOString(), user: 'System', message: 'Ticket automatically assigned to IT Admins.', isInternal: true },
      { id: 'L2', timestamp: new Date(Date.now() - 1500000).toISOString(), user: 'IT Admin John', message: 'Investigating auth server logs. Looks like a load balancer issue.', isInternal: true },
    ]
  },
  { 
    id: 'TKT-9913', 
    title: 'AC Leaking in Ward 4', 
    description: 'Water dripping from AC vent near bed 4A.', 
    reporter: 'Ward Manager Mike', 
    department: 'Ward 4', 
    category: 'Facility', 
    status: 'New', 
    priority: 'Medium', 
    createdAt: new Date(Date.now() - 900000).toISOString(), 
    slaBreachAt: new Date(Date.now() + 2700000).toISOString(), 
    logs: []
  },
  { 
    id: 'TKT-9914', 
    title: 'Printer Toner Empty', 
    description: 'Billing desk printer requires new black toner.', 
    reporter: 'Billing Exec Anna', 
    department: 'Billing', 
    category: 'IT Issue', 
    status: 'New', 
    priority: 'Low', 
    createdAt: new Date(Date.now() - 3600000).toISOString(), 
    slaBreachAt: new Date(Date.now() + 18000000).toISOString(), 
    logs: []
  },
];

export const helpdeskApi = {
  getDashboardSummary: async (filters: HelpdeskFilters) => ({
    data: { kpis: mockKpis, tickets: mockTickets } as HelpdeskDashboardData,
    message: 'Success', status: 200,
  }),
  updateTicketStatus: async (ticketId: string, payload: Partial<SupportTicket>) => ({ data: { success: true }, message: `Ticket updated`, status: 200 }),
  assignTicket: async (ticketId: string, team: string) => ({ data: { success: true }, message: `Ticket routed to ${team}`, status: 200 }),
  addTicketLog: async (ticketId: string, message: string, isInternal: boolean) => ({ data: { success: true }, message: 'Note added', status: 200 }),
};
