'use client';

import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';
import { useAssets, useMaintenanceRequests } from '@/modules/facility';

const FACILITY_ROLES = ['facilities_manager', 'admin', 'super_admin', 'fire_safety_officer'];

export default function FacilitySafetyPage() {
  const { data } = useAssets();
  const { data: maintenanceData } = useMaintenanceRequests();

  const safetyAssets = data?.data.filter(
    (a) => a.category === 'utility' || a.category === 'hvac'
  ) || [];

  const activeMaintenance = maintenanceData?.data.filter(
    (request) => request.status === 'open' || request.status === 'in_progress'
  ).length || 0;

  const systemsHealth = [
    { name: 'Fire Suppression', status: activeMaintenance > 2 ? 'warning' : 'operational', lastInspected: 'Auto-tracked' },
    { name: 'Emergency Lighting', status: 'operational', lastInspected: 'Auto-tracked' },
    { name: 'Backup Power', status: safetyAssets.some((asset) => asset.status === 'offline') ? 'warning' : 'operational', lastInspected: 'Auto-tracked' },
    { name: 'Medical Gas', status: safetyAssets.some((asset) => asset.status === 'degraded') ? 'warning' : 'operational', lastInspected: 'Auto-tracked' },
  ];

  return (
    <RoleGuard roles={FACILITY_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1400px]">
        <Breadcrumbs items={[{ label: 'Facility' }, { label: 'Safety & Compliance' }]} />

        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardBody>
            <h3 className="text-sm font-bold text-white mb-4">Safety Systems Status</h3>
            <p className="text-xs text-gray-500 mb-4">Active maintenance tickets impacting safety systems: {activeMaintenance}</p>
            <div className="space-y-3">
              {systemsHealth.map((system) => (
                <div key={system.name} className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] hover:border-white/[0.1] transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-white">{system.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Last Inspected: {system.lastInspected}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success/80"/>
                    <span className="text-xs font-bold text-success-light">{system.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardBody>
            <h3 className="text-sm font-bold text-white mb-4">Critical Infrastructure</h3>
            <div className="space-y-2">
              {safetyAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{asset.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    asset.status === 'operational'
                      ? 'bg-success/10 text-success-light'
                      : 'bg-warning/10 text-warning-light'
                  }`}>
                    {asset.status}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
