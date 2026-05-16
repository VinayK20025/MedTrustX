'use client';

import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { useMaintenanceRequests } from '@/modules/facility';
import { cn } from '@/utils/cn';

const FACILITY_ROLES = [
  'facilities_manager',
  'maintenance_supervisor',
  'admin',
  'super_admin',
];

function MaintenanceRequestRow({ request }: { request: any }) {
  const statusColor: Record<string, string> = {
    open: 'bg-yellow/10 text-yellow-light border-yellow/20',
    in_progress: 'bg-blue/10 text-blue-light border-blue/20',
    resolved: 'bg-success/10 text-success-light border-success/20',
    cancelled: 'bg-gray/10 text-gray-light border-gray/20',
  };

  return (
    <tr className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-sm font-mono text-blue-light">{request.id}</td>
      <td className="px-4 py-3 text-sm text-white">{request.issue_description}</td>
      <td className="px-4 py-3">
        <span
          className={cn('px-2 py-1 rounded text-xs font-bold border', statusColor[request.status])}
        >
          {request.status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {new Date(request.reported_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {request.resolved_at ? new Date(request.resolved_at).toLocaleDateString() : '—'}
      </td>
    </tr>
  );
}

export default function FacilityMaintenancePage() {
  const { data, isLoading } = useMaintenanceRequests();

  return (
    <RoleGuard roles={FACILITY_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1400px]">
        <Breadcrumbs items={[{ label: 'Facility' }, { label: 'Maintenance' }]} />

        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardBody>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded" />
                ))}
              </div>
            ) : data?.data && data.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Ticket ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Issue
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Reported
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Resolved
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((request) => (
                      <MaintenanceRequestRow key={request.id} request={request} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No maintenance requests found</p>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
