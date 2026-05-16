'use client';
import { InventoryDashboard } from '@/modules/inventory';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function InventoryRoute() { 
  return (
    <RoleGuard roles={['inventory', 'storekeeper', 'supply-chain', 'super_admin']} requireAll={false}>
      <InventoryDashboard />
    </RoleGuard>
  ); 
}
