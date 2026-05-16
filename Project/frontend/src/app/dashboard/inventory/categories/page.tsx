'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useInventoryDashboard } from '@/modules/inventory';

const INVENTORY_ROLES = ['inventory_manager', 'super_admin', 'supply_chain_manager', 'storekeeper'];

export default function InventoryCategoriesPage() {
  const { data, isLoading } = useInventoryDashboard({});
  const items = data?.data.items || [];
  const summary = items.reduce<Record<string, { total: number; low: number; critical: number }>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = { total: 0, low: 0, critical: 0 };
    acc[item.category].total += 1;
    if (item.status === 'Low') acc[item.category].low += 1;
    if (item.status === 'Critical') acc[item.category].critical += 1;
    return acc;
  }, {});

  return (
    <RoleGuard roles={INVENTORY_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Inventory Manager' }, { label: 'Categories' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Category Overview" subtitle="Distribution and risk posture by stock category" />
          <CardBody>
            {isLoading ? (
              <p className="text-gray-500">Loading categories...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(summary).map(([category, stats]) => (
                  <div key={category} className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                    <p className="text-white font-semibold">{category}</p>
                    <p className="text-xs text-gray-400 mt-1">Items: {stats.total}</p>
                    <p className="text-xs text-amber-400">Low: {stats.low}</p>
                    <p className="text-xs text-rose-400">Critical: {stats.critical}</p>
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
