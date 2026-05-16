'use client';
import React, { useMemo, useState } from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useAssignTriage, useEcDashboard } from '@/modules/emergency-coord';

const EC_ROLES = ['emergency_coordinator', 'er_physician', 'hospital_admin', 'super_admin'];

export default function EcSubPage() {
  const { data } = useEcDashboard({});
  const patients = data?.data?.patients ?? [];
  const { mutate: assignTriage, isPending } = useAssignTriage();
  const [selectedId, setSelectedId] = useState<string | undefined>(patients[0]?.id);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedId),
    [patients, selectedId]
  );

  return (
    <RoleGuard roles={EC_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Emergency Coord' }, { label: 'Routing' }]} />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <Card className="xl:col-span-5 border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white tracking-wide">Routing Candidates</h3>
                <p className="text-xs text-gray-400 mt-0.5">Select a patient and send them to the right destination</p>
              </div>
            </CardHeader>
            <CardBody className="p-4 space-y-3">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => setSelectedId(patient.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${selectedId === patient.id ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/[0.08] bg-surface-dark hover:bg-white/[0.03]'}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-white font-semibold">{patient.tag}</p>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400">{patient.priority}</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{patient.chiefComplaint}</p>
                  <p className="text-xs text-gray-500 mt-1">From {patient.from} · {patient.status}</p>
                </button>
              ))}
            </CardBody>
          </Card>

          <Card className="xl:col-span-7 border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white tracking-wide">Routing Decision</h3>
                <p className="text-xs text-gray-400 mt-0.5">Assign destination based on capacity and acuity</p>
              </div>
            </CardHeader>
            <CardBody className="p-4 space-y-4">
              {selectedPatient ? (
                <>
                  <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Selected patient</p>
                    <p className="text-white font-semibold mt-1">{selectedPatient.tag} · {selectedPatient.chiefComplaint}</p>
                    <p className="text-xs text-gray-500 mt-1">{selectedPatient.from} · {selectedPatient.priority}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['ICU', 'ER Bay', 'OT', 'Ward A', 'Ward B', 'OPD Fast Track'].map((destination) => (
                      <Button
                        key={destination}
                        disabled={isPending}
                        onClick={() => assignTriage({ id: selectedPatient.id, priority: selectedPatient.priority, dest: destination })}
                        className="h-11 border border-white/10 bg-white/5 hover:bg-white/10 text-white"
                      >
                        {destination}
                      </Button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">Select a patient from the queue to start routing.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
