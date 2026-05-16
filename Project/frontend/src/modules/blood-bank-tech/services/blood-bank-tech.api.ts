import type { TechnicianData } from '../types/blood-bank-tech.types';

export interface TechFilters { status?: string; }

const mockData: TechnicianData = {
  metrics: {
    unitsProcessed: 32,
    testsCompleted: 28,
    mismatchesPrevented: 1,
  },
  tasks: [
    { id: 'TSK-101', type: 'Screening', unitId: 'U-7721', priority: 'STAT', status: 'Pending', assignedAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'TSK-102', type: 'Crossmatch', patientId: 'P-9921', priority: 'Urgent', status: 'In Progress', assignedAt: new Date(Date.now() - 5400000).toISOString() },
    { id: 'TSK-103', type: 'Collection', donorId: 'D-4412', priority: 'Routine', status: 'Pending', assignedAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'TSK-104', type: 'Storage', unitId: 'U-7722', priority: 'Routine', status: 'Completed', assignedAt: new Date(Date.now() - 10800000).toISOString() },
  ],
  units: [
    { id: 'U-7721', barcode: '||| |||| || |||', bloodGroup: 'O+', componentType: 'PRBC', collectionDate: new Date(Date.now() - 86400000).toISOString(), expiryDate: new Date(Date.now() + 35 * 86400000).toISOString(), volumeML: 350, status: 'Quarantined', location: 'Lab Bench 2' },
    { id: 'U-7722', barcode: '||| | ||| ||| |', bloodGroup: 'A-', componentType: 'Platelets', collectionDate: new Date(Date.now() - 43200000).toISOString(), expiryDate: new Date(Date.now() + 4 * 86400000).toISOString(), volumeML: 50, status: 'Available', location: 'Agitator S-1' },
    { id: 'U-7723', barcode: '||| || ||| || |', bloodGroup: 'B+', componentType: 'FFP', collectionDate: new Date(Date.now() - 172800000).toISOString(), expiryDate: new Date(Date.now() + 360 * 86400000).toISOString(), volumeML: 200, status: 'Reserved', location: 'Freezer F-4' },
  ],
  screenings: [
    { id: 'SCR-001', unitId: 'U-7721', testType: 'HIV', result: 'Pending' },
    { id: 'SCR-002', unitId: 'U-7721', testType: 'HBV', result: 'Pending' },
    { id: 'SCR-003', unitId: 'U-7722', testType: 'HCV', result: 'Negative', performedAt: new Date(Date.now() - 3600000).toISOString(), technicianId: 'TECH-12' },
  ],
  crossmatches: [
    { id: 'XM-401', patientId: 'P-9921', patientName: 'Suresh Kumar', patientBloodGroup: 'B+', requestedComponent: 'PRBC', unitsRequired: 2, status: 'Processing', requestDate: new Date(Date.now() - 7200000).toISOString(), matchedUnits: [] },
    { id: 'XM-402', patientId: 'P-9925', patientName: 'Anita Sharma', patientBloodGroup: 'O-', requestedComponent: 'Whole Blood', unitsRequired: 1, status: 'Matched', requestDate: new Date(Date.now() - 14400000).toISOString(), matchedUnits: ['U-7719'] },
  ]
};

export const bloodBankTechApi = {
  getDashboardData: async (f: TechFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  recordScreeningResult: async (screeningId: string, result: 'Negative' | 'Positive' | 'Invalid') => ({ data: { success: true }, message: 'Result recorded', status: 200 }),
  performCrossmatch: async (requestId: string, unitIds: string[]) => ({ data: { success: true, matched: true }, message: 'Crossmatch successful', status: 200 }),
  updateUnitStatus: async (unitId: string, status: string, location: string) => ({ data: { success: true }, message: 'Unit status updated', status: 200 }),
};
