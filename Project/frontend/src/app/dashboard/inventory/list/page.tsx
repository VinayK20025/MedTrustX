'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useInventoryDashboard } from '@/modules/inventory';

const INVENTORY_ROLES = ['inventory_manager', 'super_admin', 'supply_chain_manager', 'storekeeper'];

export default function InventoryListPage() {
  const { data, isLoading } = useInventoryDashboard({});
  const items = data?.data.items || [];

  return (
    <RoleGuard roles={INVENTORY_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Inventory Manager' }, { label: 'List' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Inventory Master List" subtitle="Current stock, thresholds, and storage locations" />
          <CardBody>
            {isLoading ? (
              <p className="text-gray-500">Loading inventory...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left px-2 py-2 text-gray-400">Item</th>
                      <th className="text-left px-2 py-2 text-gray-400">Category</th>
                      <th className="text-left px-2 py-2 text-gray-400">Stock</th>
                      <th className="text-left px-2 py-2 text-gray-400">Minimum</th>
                      <th className="text-left px-2 py-2 text-gray-400">Unit</th>
                      <th className="text-left px-2 py-2 text-gray-400">Location</th>
                      <th className="text-left px-2 py-2 text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-white/[0.04]">
                        <td className="px-2 py-2 text-white">{item.name}</td>
                        <td className="px-2 py-2">{item.category}</td>
                        <td className="px-2 py-2">{item.currentStock}</td>
                        <td className="px-2 py-2">{item.minimumStock}</td>
                        <td className="px-2 py-2">{item.unit}</td>
                        <td className="px-2 py-2">{item.location}</td>
                        <td className="px-2 py-2">{item.status}</td>
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
