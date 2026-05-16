'use client';
import { LegalAdvisorDashboard } from '@/modules/legal';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function LegalRoute() { 
  return (
    <RoleGuard roles={['legal', 'legal-compliance', 'legal-risk', 'super_admin']} requireAll={false}>
      <LegalAdvisorDashboard />
    </RoleGuard>
  ); 
}
