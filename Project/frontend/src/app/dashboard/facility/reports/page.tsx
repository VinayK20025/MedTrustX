'use client';

import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';
import { useAssets, useMaintenanceRequests } from '@/modules/facility';

const FACILITY_ROLES = ['facilities_manager', 'admin', 'super_admin'];

export default function FacilityReportsPage() {
  const { data: assetsData } = useAssets();
  const { data: maintenanceData } = useMaintenanceRequests();

  const assets = assetsData?.data || [];
  const requests = maintenanceData?.data || [];

  const avgResolutionTime = requests.filter((r) => r.resolved_at).length > 0
    ? requests
        .filter((r) => r.resolved_at)
        .reduce((sum, r) => {
          const reported = new Date(r.reported_at).getTime();
          const resolved = new Date(r.resolved_at!).getTime();
          return sum + (resolved - reported);
        }, 0) / requests.filter((r) => r.resolved_at).length / 3600000
    : 0;

  const operationalAssets = assets.filter((a) => a.status === 'operational').length;
  const operationalPercentage = assets.length > 0
    ? Math.round((operationalAssets / assets.length) * 100)
    : 0;

  return (
    <RoleGuard roles={FACILITY_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1400px]">
        <Breadcrumbs items={[{ label: 'Facility' }, { label: 'Reports' }]} />

        <div className="grid grid-cols-4 gap-4">
          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardBody>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Assets</p>
              <p className="text-3xl font-black text-white mt-3">{assets.length}</p>
            </CardBody>
          </Card>
          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardBody>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Operational</p>
              <p className="text-3xl font-black text-success-light mt-3">{operationalPercentage}%</p>
            </CardBody>
          </Card>
          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardBody>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg MTTR (hrs)</p>
              <p className="text-3xl font-black text-white mt-3">{avgResolutionTime.toFixed(1)}</p>
            </CardBody>
          </Card>
          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardBody>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Requests</p>
              <p className="text-3xl font-black text-white mt-3">{requests.length}</p>
            </CardBody>
          </Card>
        </div>

        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardBody>
            <h3 className="text-sm font-bold text-white mb-4">Asset Distribution by Status</h3>
            <div className="space-y-2">
              {['operational', 'degraded', 'offline', 'maintenance'].map((status) => {
                const count = assets.filter((a) => a.status === status).length;
                const percentage = assets.length > 0 ? Math.round((count / assets.length) * 100) : 0;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 capitalize">{status}</span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 bg-white/[0.06] rounded-full w-32">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-white min-w-[40px]">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
