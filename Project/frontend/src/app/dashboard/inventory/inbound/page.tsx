'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useInventoryDashboard } from '@/modules/inventory';

const INVENTORY_ROLES = ['inventory_manager', 'super_admin', 'supply_chain_manager', 'storekeeper'];

export default function InventoryInboundPage() {
  const { data, isLoading } = useInventoryDashboard({});
  const inbound = (data?.data.movements || []).filter((m) => m.type === 'Inbound');

  return (
    <RoleGuard roles={INVENTORY_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Inventory Manager' }, { label: 'Inbound' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Inbound Receipts" subtitle="Received stock entries across stores and departments" />
          <CardBody>
            {isLoading ? (
              <p className="text-gray-500">Loading inbound movements...</p>
            ) : inbound.length === 0 ? (
              <p className="text-gray-500">No inbound records found</p>
            ) : (
              <div className="space-y-2">
                {inbound.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-white font-semibold">{entry.itemId}</p>
                    <p className="text-xs text-gray-400">Quantity: {entry.quantity} | Date: {new Date(entry.date).toLocaleString()}</p>
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
