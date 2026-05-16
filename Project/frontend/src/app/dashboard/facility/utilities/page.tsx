'use client';

import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';
import { useAssets, useMaintenanceRequests } from '@/modules/facility';

const FACILITY_ROLES = ['facilities_manager', 'facilities_tech', 'admin', 'super_admin'];

export default function FacilityUtilitiesPage() {
  const { data: assetsData } = useAssets();
  const { data: maintenanceData } = useMaintenanceRequests();

  const assets = assetsData?.data || [];
  const maintenanceRequests = maintenanceData?.data || [];

  const utilityAssets = assets.filter((asset) => asset.category === 'utility' || asset.category === 'hvac');

  const utilities = utilityAssets.map((asset) => {
    const openTickets = maintenanceRequests.filter((request) => request.asset_id === asset.id && (request.status === 'open' || request.status === 'in_progress')).length;
    const status: 'normal' | 'warning' | 'critical' = asset.status === 'offline' || openTickets > 1
      ? 'critical'
      : asset.status === 'degraded' || openTickets === 1
        ? 'warning'
        : 'normal';

    return {
      name: asset.name,
      status,
      reading: asset.status === 'operational' ? '100' : asset.status === 'degraded' ? '78' : '45',
      unit: '%',
      lastCheck: new Date(asset.created_at).toLocaleTimeString(),
      openTickets,
      location: asset.location,
    };
  });

  const statusColor: Record<string, string> = {
    normal: 'border-success/20 bg-success/[0.02]',
    warning: 'border-warning/20 bg-warning/[0.02]',
    critical: 'border-emergency/20 bg-emergency/[0.02]',
  };

  const statusLight: Record<string, string> = {
    normal: 'bg-success/80',
    warning: 'bg-warning/80',
    critical: 'bg-emergency/80',
  };

  return (
    <RoleGuard roles={FACILITY_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1400px]">
        <Breadcrumbs items={[{ label: 'Facility' }, { label: 'Utilities' }]} />

        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardBody>
            <h3 className="text-sm font-bold text-white mb-6">Real-Time Utilities Monitoring</h3>
            <div className="space-y-3">
              {utilities.map((utility, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border transition-colors ${
                    statusColor[utility.status]
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${statusLight[utility.status]}`} />
                        <p className="font-medium text-white">{utility.name}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{utility.location}</p>
                      <p className="text-xs text-gray-500 mt-2">Last checked: {utility.lastCheck}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Open work orders: {utility.openTickets}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        {utility.reading}
                        <span className="text-lg ml-1">{utility.unit}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">{utility.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
