'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useDiscardExpired, useInventoryDashboard } from '@/modules/inventory';

const INVENTORY_ROLES = ['inventory_manager', 'super_admin', 'supply_chain_manager', 'storekeeper'];

export default function InventoryExpiryPage() {
  const { data, isLoading } = useInventoryDashboard({});
  const discardExpired = useDiscardExpired();
  const expiryItems = data?.data.expiryItems || [];

  return (
    <RoleGuard roles={INVENTORY_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Inventory Manager' }, { label: 'Expiry' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Expiry Monitoring" subtitle="Track expiring and expired batches" />
          <CardBody>
            {isLoading ? (
              <p className="text-gray-500">Loading expiry records...</p>
            ) : (
              <div className="space-y-2">
                {expiryItems.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-semibold">{entry.itemName}</p>
                      <p className="text-xs text-gray-400">Batch: {entry.batchNumber} | Qty: {entry.quantity} | Status: {entry.status} | Expires: {new Date(entry.expiryDate).toLocaleDateString()}</p>
                    </div>
                    <button
                      className="px-2 py-1 rounded bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50"
                      disabled={entry.status !== 'Expired' || discardExpired.isPending}
                      onClick={() => discardExpired.mutate(entry.id)}
                    >
                      Discard
                    </button>
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
