'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { Video, Wifi, AlertTriangle } from 'lucide-react';
import { PatientQueuePanel, ConsultationWorkspace, NotesPanel, useTelemedicineDashboard } from '@/modules/telemedicine';

const TELEMEDICINE_ROLES = ['doctor', 'hospital_admin', 'super_admin'];

export default function Page() {
  const { data, isLoading } = useTelemedicineDashboard({});
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();

  useEffect(() => {
    if (!selectedPatientId && data?.data?.queue?.length) {
      const active = data.data.queue.find((patient) => patient.status === 'In Consult') ?? data.data.queue[0];
      setSelectedPatientId(active?.id);
    }
  }, [data, selectedPatientId]);

  const routeName = 'Consult';
  const d = data?.data;
  const selectedPatient = useMemo(() => d?.queue.find((patient) => patient.id === selectedPatientId), [d?.queue, selectedPatientId]);

  return (
    <RoleGuard roles={TELEMEDICINE_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px] mx-auto">
        <Breadcrumbs items={[{ label: 'Telemedicine' }, { label: routeName }]} />

        {isLoading ? (
          <Skeleton className="h-[720px] rounded-xl" />
        ) : !d ? (
          <div className="text-gray-500 py-20 text-center">No consultation data available</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {d.kpis.map((kpi) => (
                <Card key={kpi.id} className="border-white/[0.06] shadow-glass bg-surface-light">
                  <CardBody className="p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
                    <p className="text-3xl font-black text-white mt-2">{kpi.value}</p>
                  </CardBody>
                </Card>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap">
              <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-sky-400" />
                <span className="text-[11px] font-bold text-sky-400">Encrypted consult channel active</span>
              </div>
              {selectedPatient && (
                <div className="bg-warning/10 border border-warning/20 rounded-xl px-4 py-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning-light" />
                  <span className="text-[11px] font-bold text-warning-light">Focused on {selectedPatient.name}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-260px)] min-h-[680px]">
              <div className="xl:col-span-3 h-full">
                <PatientQueuePanel queue={d.queue} selectedId={selectedPatientId} onSelect={setSelectedPatientId} />
              </div>
              <div className="xl:col-span-6 h-full">
                <Card className="border-sky-500/20 shadow-glass bg-[#020408] h-full flex flex-col">
                  <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
                    <Video className="w-4 h-4 text-sky-400" />
                    <div>
                      <h3 className="text-[16px] font-black text-white">Live Consultation</h3>
                      <p className="text-[11px] text-gray-500">Use the consultation workspace to review symptoms, speak with the patient, and close the encounter.</p>
                    </div>
                  </CardHeader>
                  <CardBody className="p-0 flex-1 overflow-hidden">
                    <ConsultationWorkspace patient={selectedPatient} templates={d.templates} initialTab="consult" />
                  </CardBody>
                </Card>
              </div>
              <div className="xl:col-span-3 h-full">
                <NotesPanel />
              </div>
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
