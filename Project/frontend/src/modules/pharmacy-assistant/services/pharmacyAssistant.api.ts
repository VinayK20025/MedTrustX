import type {
  PharmacyAssistantDashboardData, PharmacyAssistantKPI, PatientQueueItem,
  AssistanceTask, RetailInventoryItem, AssistantAlert
} from '../types/pharmacyAssistant.types';

export interface AssistantFilters {
  status?: string;
  type?: string;
}

const mockKpis: PharmacyAssistantKPI[] = [
  { id: '1', title: 'Patients Waiting', value: 5, format: 'number', status: 'warning', actionLabel: 'View Queue', actionUrl: '/dashboard/pharmacy-assistant/queue' },
  { id: '2', title: 'Patients Served', value: 84, format: 'number', status: 'success' },
  { id: '3', title: 'Avg Wait Time', value: '12 min', format: 'text', status: 'normal' },
  { id: '4', title: 'OTC Sales', value: 24, format: 'number', status: 'normal' },
];

const mockQueue: PatientQueueItem[] = [
  { id: 'Q-1', patientName: 'Walk-in Patient', ticketNumber: 'A-102', requestType: 'OTC Sales', waitTimeMinutes: 4, status: 'Being Served' },
  { id: 'Q-2', patientName: 'Sarah Jenkins', ticketNumber: 'P-045', requestType: 'Prescription Pickup', waitTimeMinutes: 12, status: 'Waiting' },
  { id: 'Q-3', patientName: 'Walk-in Patient', ticketNumber: 'A-103', requestType: 'Query', waitTimeMinutes: 2, status: 'Waiting' },
];

const mockTask: AssistanceTask = {
  id: 'TSK-A102',
  ticketNumber: 'A-102',
  patientName: 'Walk-in Patient',
  requestType: 'OTC Sales',
  itemsToFetch: [
    { id: 'ITEM-1', drugName: 'Paracetamol 500mg', location: 'OTC Shelf 1', quantity: 2, fetched: true },
    { id: 'ITEM-2', drugName: 'Cough Syrup (Guaifenesin)', location: 'OTC Shelf 3', quantity: 1, fetched: false },
  ],
  requiresPharmacist: false,
};

const mockInventory: RetailInventoryItem[] = [
  { id: 'RET-1', itemName: 'Paracetamol 500mg', category: 'OTC', location: 'OTC Shelf 1', price: 4.50, inStock: true },
  { id: 'RET-2', itemName: 'Cough Syrup (Guaifenesin)', category: 'OTC', location: 'OTC Shelf 3', price: 8.00, inStock: true },
];

const mockAlerts: AssistantAlert[] = [
  { id: 'ALT-AST-1', type: 'Long Wait Time', severity: 'warning', timestamp: new Date(Date.now() - 900000).toISOString(), status: 'Active', message: 'Ticket P-045 has been waiting over 10 minutes.' },
];

export const pharmacyAssistantApi = {
  getDashboardSummary: async (filters: AssistantFilters) => ({
    data: {
      kpis: mockKpis,
      queue: mockQueue,
      activeTask: mockTask,
      inventorySearch: mockInventory,
      alerts: mockAlerts,
    } as PharmacyAssistantDashboardData,
    message: 'Success', status: 200,
  }),

  callNextPatient: async () => ({ data: { success: true }, message: `Calling next ticket`, status: 200 }),
  markItemFetched: async (taskId: string, itemId: string) => ({ data: { success: true }, message: `Item marked as fetched`, status: 200 }),
  handoverToPharmacist: async (taskId: string) => ({ data: { success: true }, message: `Handed over to Pharmacist for consultation`, status: 200 }),
  completeTransaction: async (taskId: string) => ({ data: { success: true }, message: `Transaction completed`, status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
