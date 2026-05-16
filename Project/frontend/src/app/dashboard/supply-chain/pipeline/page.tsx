'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useSupplyChainDashboard } from '@/modules/supply-chain';

const SUPPLY_CHAIN_ROLES = ['supply_chain_coordinator', 'super_admin', 'procurement_manager', 'inventory_manager'];

export default function SupplyChainPipelinePage() {
  const { data, isLoading } = useSupplyChainDashboard({});
  const pipeline = data?.data.pipeline || [];

  return (
    <RoleGuard roles={SUPPLY_CHAIN_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Supply Chain Coordinator' }, { label: 'Pipeline' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Pipeline Status" subtitle="Live workload and bottleneck status across procurement stages" />
          <CardBody>
            {isLoading ? (
              <p className="text-gray-500">Loading pipeline...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pipeline.map((stage) => (
                  <div key={stage.id} className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                    <p className="text-white font-semibold">{stage.name}</p>
                    <p className="text-xs text-gray-400 mt-1">Status: {stage.status}</p>
                    <p className="text-lg font-bold text-white mt-2">{stage.count}</p>
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
