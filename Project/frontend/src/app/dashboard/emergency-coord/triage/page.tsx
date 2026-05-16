'use client';
import React, { useMemo, useState } from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { CoordinatorWorkspace, TriageQueuePanel, useEcDashboard } from '@/modules/emergency-coord';

const EC_ROLES = ['emergency_coordinator', 'er_physician', 'hospital_admin', 'super_admin'];

export default function EcSubPage() {
  const { data } = useEcDashboard({});
  const triagePatients = data?.data?.patients ?? [];
  const ambulances = data?.data?.ambulances ?? [];
  const tasks = data?.data?.tasks ?? [];
  const resources = data?.data?.resources ?? [];
  const [selectedId, setSelectedId] = useState<string | undefined>(triagePatients[0]?.id);

  const selectedPatient = useMemo(
    () => triagePatients.find((patient) => patient.id === selectedId),
    [selectedId, triagePatients]
  );

  return (
    <RoleGuard roles={EC_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Emergency Coord' }, { label: 'Triage' }]} />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-5 h-[720px]">
            <TriageQueuePanel patients={triagePatients} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          <div className="xl:col-span-7 h-[720px]">
            <CoordinatorWorkspace
              patient={selectedPatient}
              ambulances={ambulances}
              tasks={tasks}
              resources={resources}
            />
          </div>
        </div>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader className="border-b border-white/[0.04] px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-white tracking-wide">Triage Review</h3>
              <p className="text-xs text-gray-400 mt-0.5">Active patient counts and routing readiness</p>
            </div>
          </CardHeader>
          <CardBody className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Red</p>
              <p className="text-xl font-bold text-red-300 mt-1">{triagePatients.filter((patient) => patient.priority === 'Red').length}</p>
            </div>
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Yellow</p>
              <p className="text-xl font-bold text-yellow-300 mt-1">{triagePatients.filter((patient) => patient.priority === 'Yellow').length}</p>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Green</p>
              <p className="text-xl font-bold text-emerald-300 mt-1">{triagePatients.filter((patient) => patient.priority === 'Green').length}</p>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Selected</p>
              <p className="text-sm font-semibold text-white mt-1">{selectedPatient?.tag ?? 'None selected'}</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
