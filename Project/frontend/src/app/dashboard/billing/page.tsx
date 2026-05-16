'use client';
import { BillingDashboard } from '@/modules/billing';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function BillingRoute() { 
  return (
    <RoleGuard roles={['billing', 'claims', 'insurance', 'super_admin']} requireAll={false}>
      <BillingDashboard />
    </RoleGuard>
  ); 
}
