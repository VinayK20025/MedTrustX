'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useInventoryDashboard } from '@/modules/inventory';

const INVENTORY_ROLES = ['inventory_manager', 'super_admin', 'supply_chain_manager', 'storekeeper'];

export default function InventoryReportsPage() {
  const { data, isLoading } = useInventoryDashboard({});
  const d = data?.data;

  return (
    <RoleGuard roles={INVENTORY_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Inventory Manager' }, { label: 'Reports' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Inventory Reports" subtitle="Operational KPIs and compliance indicators" />
          <CardBody>
            {isLoading || !d ? (
              <p className="text-gray-500">Loading reports...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {d.kpis.map((kpi) => (
                  <div key={kpi.id} className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">{kpi.label}</p>
                    <p className="text-lg font-bold text-white mt-1">{kpi.value}</p>
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
