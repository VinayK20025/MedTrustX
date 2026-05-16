'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useInventoryDashboard, useTriggerReorder } from '@/modules/inventory';

const INVENTORY_ROLES = ['inventory_manager', 'super_admin', 'supply_chain_manager', 'storekeeper'];

export default function InventoryReorderPage() {
  const { data, isLoading } = useInventoryDashboard({});
  const reorder = useTriggerReorder();
  const reorders = data?.data.reorders || [];

  return (
    <RoleGuard roles={INVENTORY_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Inventory Manager' }, { label: 'Reorder' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Reorder Queue" subtitle="Automated replenishment recommendations and PR status" />
          <CardBody>
            {isLoading ? (
              <p className="text-gray-500">Loading reorder alerts...</p>
            ) : (
              <div className="space-y-2">
                {reorders.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-semibold">{entry.itemName}</p>
                      <p className="text-xs text-gray-400">Current: {entry.currentStock} | Suggested: {entry.suggestedOrder} | Status: {entry.status}</p>
                    </div>
                    <button
                      className="px-2 py-1 rounded bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 disabled:opacity-50"
                      disabled={entry.status === 'PR Generated' || reorder.isPending}
                      onClick={() => reorder.mutate({ id: entry.itemId, qty: entry.suggestedOrder })}
                    >
                      Generate PR
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
