'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useInventoryDashboard } from '@/modules/inventory';

const INVENTORY_ROLES = ['inventory_manager', 'super_admin', 'supply_chain_manager', 'storekeeper'];

export default function InventoryOutboundPage() {
  const { data, isLoading } = useInventoryDashboard({});
  const outbound = (data?.data.movements || []).filter((m) => m.type === 'Outbound');

  return (
    <RoleGuard roles={INVENTORY_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Inventory Manager' }, { label: 'Outbound' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Outbound Dispatch" subtitle="Stock issued to operational units" />
          <CardBody>
            {isLoading ? (
              <p className="text-gray-500">Loading outbound movements...</p>
            ) : outbound.length === 0 ? (
              <p className="text-gray-500">No outbound records found</p>
            ) : (
              <div className="space-y-2">
                {outbound.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                    <p className="text-white font-semibold">{entry.itemId}</p>
                    <p className="text-xs text-gray-400">Quantity: {entry.quantity} | Department: {entry.department || 'N/A'} | Date: {new Date(entry.date).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
