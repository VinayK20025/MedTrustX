'use client';

import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';
import { useMaintenanceRequests } from '@/modules/facility';
import { cn } from '@/utils/cn';

const FACILITY_ROLES = [
  'facilities_manager',
  'admin',
  'super_admin',
  'emergency_coordinator',
];

export default function FacilityIncidentsPage() {
  const { data, isLoading } = useMaintenanceRequests();

  const criticalIncidents = data?.data.filter(
    (r) => r.status === 'open' || r.status === 'in_progress'
  ) || [];

  const incidentStats = {
    totalIncidents: data?.data.length || 0,
    active: criticalIncidents.length,
    resolved: data?.data.filter((r) => r.status === 'resolved').length || 0,
  };

  return (
    <RoleGuard roles={FACILITY_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1400px]">
        <Breadcrumbs items={[{ label: 'Facility' }, { label: 'Incidents' }]} />

        <div className="grid grid-cols-3 gap-4">
          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardBody>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Incidents</p>
              <p className="text-3xl font-black text-white mt-3">{incidentStats.totalIncidents}</p>
            </CardBody>
          </Card>
          <Card className="border-yellow/20 shadow-glass bg-yellow/[0.02]">
            <CardBody>
              <p className="text-xs font-bold text-yellow-light uppercase tracking-widest">Active</p>
              <p className="text-3xl font-black text-yellow-light mt-3">{incidentStats.active}</p>
            </CardBody>
          </Card>
          <Card className="border-success/20 shadow-glass bg-success/[0.02]">
            <CardBody>
              <p className="text-xs font-bold text-success-light uppercase tracking-widest">Resolved</p>
              <p className="text-3xl font-black text-success-light mt-3">{incidentStats.resolved}</p>
            </CardBody>
          </Card>
        </div>

        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardBody>
            <h3 className="text-sm font-bold text-white mb-4">Active Incidents</h3>
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : criticalIncidents.length > 0 ? (
              <div className="space-y-3">
                {criticalIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-3 rounded-lg border border-yellow/20 bg-yellow/[0.02]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">  
                          {incident.issue_description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Reported: {new Date(incident.reported_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-bold bg-yellow/10 text-yellow-light border border-yellow/20">
                        {incident.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No active incidents</p>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
