'use client';
import { TriageDashboard } from '@/modules/triage-nurse';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function TriageNurseRoute() { 
  return (
    <RoleGuard roles={['triage-nurse', 'triage_nurse', 'er-nurse', 'emergency-care', 'super_admin']} requireAll={false}>
      <TriageDashboard />
    </RoleGuard>
  ); 
}
