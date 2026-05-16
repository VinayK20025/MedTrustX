'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useSupplyChainDashboard } from '@/modules/supply-chain';

const SUPPLY_CHAIN_ROLES = ['supply_chain_coordinator', 'super_admin', 'procurement_manager', 'inventory_manager'];

export default function SupplyChainReportsPage() {
  const { data, isLoading } = useSupplyChainDashboard({});
  const d = data?.data;

  return (
    <RoleGuard roles={SUPPLY_CHAIN_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Supply Chain Coordinator' }, { label: 'Reports' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Supply Chain Analytics" subtitle="KPI rollups for order flow, vendor reliability, and bottlenecks" />
          <CardBody>
            {isLoading || !d ? (
              <p className="text-gray-500">Loading analytics...</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {d.kpis.map((kpi) => (
                    <div key={kpi.id} className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">{kpi.label}</p>
                      <p className="text-lg font-bold text-white mt-1">{kpi.value}</p>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.08]">
                        <th className="text-left px-2 py-2 text-gray-400">Stage</th>
                        <th className="text-left px-2 py-2 text-gray-400">Status</th>
                        <th className="text-left px-2 py-2 text-gray-400">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.pipeline.map((stage) => (
                        <tr key={stage.id} className="border-b border-white/[0.04]">
                          <td className="px-2 py-2 text-white">{stage.name}</td>
                          <td className="px-2 py-2">{stage.status}</td>
                          <td className="px-2 py-2">{stage.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
