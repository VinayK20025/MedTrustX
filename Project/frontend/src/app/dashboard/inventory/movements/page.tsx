'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useInventoryDashboard } from '@/modules/inventory';

const INVENTORY_ROLES = ['inventory_manager', 'super_admin', 'supply_chain_manager', 'storekeeper'];

export default function InventoryMovementsPage() {
  const { data, isLoading } = useInventoryDashboard({});
  const movements = data?.data.movements || [];

  return (
    <RoleGuard roles={INVENTORY_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Inventory Manager' }, { label: 'Movements' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Stock Movements" subtitle="Inbound, outbound, and adjustment transaction timeline" />
          <CardBody>
            {isLoading ? (
              <p className="text-gray-500">Loading movement history...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left px-2 py-2 text-gray-400">Movement</th>
                      <th className="text-left px-2 py-2 text-gray-400">Item ID</th>
                      <th className="text-left px-2 py-2 text-gray-400">Quantity</th>
                      <th className="text-left px-2 py-2 text-gray-400">Department</th>
                      <th className="text-left px-2 py-2 text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((entry) => (
                      <tr key={entry.id} className="border-b border-white/[0.04]">
                        <td className="px-2 py-2">{entry.type}</td>
                        <td className="px-2 py-2 text-white">{entry.itemId}</td>
                        <td className="px-2 py-2">{entry.quantity}</td>
                        <td className="px-2 py-2">{entry.department || 'N/A'}</td>
                        <td className="px-2 py-2">{new Date(entry.date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
