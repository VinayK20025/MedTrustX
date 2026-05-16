'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useSupplyChainDashboard } from '@/modules/supply-chain';

const SUPPLY_CHAIN_ROLES = ['supply_chain_coordinator', 'super_admin', 'procurement_manager', 'inventory_manager'];

export default function SupplyChainOrdersPage() {
  const { data, isLoading } = useSupplyChainDashboard({});
  const orders = data?.data.orders || [];

  return (
    <RoleGuard roles={SUPPLY_CHAIN_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Supply Chain Coordinator' }, { label: 'Orders' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Tracked Orders" subtitle="End-to-end status, ETA, and risk posture for active orders" />
          <CardBody>
            {isLoading ? (
              <p className="text-gray-500">Loading orders...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left px-2 py-2 text-gray-400">Order</th>
                      <th className="text-left px-2 py-2 text-gray-400">Item</th>
                      <th className="text-left px-2 py-2 text-gray-400">Vendor</th>
                      <th className="text-left px-2 py-2 text-gray-400">Stage</th>
                      <th className="text-left px-2 py-2 text-gray-400">ETA</th>
                      <th className="text-left px-2 py-2 text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-white/[0.04]">
                        <td className="px-2 py-2 text-white">{order.id}</td>
                        <td className="px-2 py-2">{order.item}</td>
                        <td className="px-2 py-2">{order.vendor}</td>
                        <td className="px-2 py-2">{order.stage}</td>
                        <td className="px-2 py-2">{new Date(order.eta).toLocaleDateString()}</td>
                        <td className="px-2 py-2">{order.status}</td>
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
