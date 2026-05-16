export const ROLES_SEED = [
  {
    name: 'Chief Executive Officer',
    slug: 'ceo',
    category: 'executive',
    permissions: [
      { resource: 'analytics', actions: ['read', 'export'], scope: 'tenant' },
      { resource: 'operations', actions: ['read', 'update', 'approve'], scope: 'tenant' },
      { resource: 'staff', actions: ['read', 'update'], scope: 'tenant' }
    ]
  },
  {
    name: 'General Physician',
    slug: 'general-physician',
    category: 'physician',
    permissions: [
      { resource: 'patient', actions: ['read', 'update'], scope: 'department' },
      { resource: 'clinical_note', actions: ['create', 'read', 'update'], scope: 'own' },
      { resource: 'prescription', actions: ['create', 'read', 'update', 'cancel'], scope: 'own' },
      { resource: 'order', actions: ['create', 'read', 'update', 'cancel'], scope: 'own' }
    ]
  },
  {
    name: 'Staff Nurse',
    slug: 'staff-nurse',
    category: 'nursing',
    permissions: [
      { resource: 'patient', actions: ['read'], scope: 'assigned' },
      { resource: 'nursing_task', actions: ['read', 'update', 'complete'], scope: 'assigned' },
      { resource: 'vitals', actions: ['create', 'read'], scope: 'assigned' },
      { resource: 'clinical_note', actions: ['create', 'read'], scope: 'assigned' }
    ]
  },
  {
    name: 'Super Admin',
    slug: 'super-admin',
    category: 'admin',
    permissions: [
      { resource: '*', actions: ['*'], scope: 'global' }
    ]
  },
  {
    name: 'Network Engineer',
    slug: 'network-engineer',
    category: 'it',
    permissions: [
      { resource: 'infrastructure', actions: ['read', 'update'], scope: 'tenant' },
      { resource: 'alerts', actions: ['read', 'update'], scope: 'tenant' }
    ]
  },
  {
    name: 'Phlebotomy Assistant',
    slug: 'phlebotomy-assistant',
    category: 'allied-health',
    permissions: [
      { resource: 'lab_order', actions: ['read', 'update'], scope: 'department' },
      { resource: 'patient', actions: ['read'], scope: 'department' }
    ]
  },
  {
    name: 'OT Assistant',
    slug: 'ot-assistant',
    category: 'allied-health',
    permissions: [
      { resource: 'surgery_schedule', actions: ['read', 'update'], scope: 'department' },
      { resource: 'inventory', actions: ['read', 'update'], scope: 'department' }
    ]
  },
  {
    name: 'CT Tech',
    slug: 'ct-tech',
    category: 'radiology',
    permissions: [
      { resource: 'imaging_order', actions: ['read', 'update', 'complete'], scope: 'department' },
      { resource: 'patient', actions: ['read'], scope: 'department' }
    ]
  },
  {
    name: 'Clinical Pharmacy',
    slug: 'clinical-pharmacy',
    category: 'pharmacy',
    permissions: [
      { resource: 'prescription', actions: ['read', 'update', 'dispense'], scope: 'tenant' },
      { resource: 'inventory', actions: ['read', 'update'], scope: 'department' }
    ]
  },
  {
    name: 'Biochemistry',
    slug: 'biochemistry',
    category: 'laboratory',
    permissions: [
      { resource: 'lab_result', actions: ['create', 'read', 'update', 'approve'], scope: 'department' },
      { resource: 'patient', actions: ['read'], scope: 'department' }
    ]
  }
];
