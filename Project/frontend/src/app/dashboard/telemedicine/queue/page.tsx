'use client';
import React, { useMemo } from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { Users, Video, Clock3 } from 'lucide-react';
import { PatientQueuePanel, ConsultationWorkspace, useTelemedicineDashboard } from '@/modules/telemedicine';

const TELEMEDICINE_ROLES = ['doctor', 'hospital_admin', 'super_admin'];

export default function Page() {
  const { data, isLoading } = useTelemedicineDashboard({});
  const routeName = 'Queue';
  const d = data?.data;
  const selectedPatient = useMemo(() => d?.queue.find((patient) => patient.status === 'In Consult') ?? d?.queue[0], [d?.queue]);
  const waitingCount = d?.queue.filter((patient) => patient.status === 'Waiting').length ?? 0;

  return (
    <RoleGuard roles={TELEMEDICINE_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px] mx-auto">
        <Breadcrumbs items={[{ label: 'Telemedicine' }, { label: routeName }]} />

        {isLoading ? (
          <Skeleton className="h-[680px] rounded-xl" />
        ) : !d ? (
          <div className="text-gray-500 py-20 text-center">No queue data available</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Waiting</p><p className="text-3xl font-black text-warning-light mt-2">{waitingCount}</p></CardBody></Card>
              <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">In Consult</p><p className="text-3xl font-black text-success-light mt-2">{d.queue.filter((patient) => patient.status === 'In Consult').length}</p></CardBody></Card>
              <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Templates</p><p className="text-3xl font-black text-white mt-2">{d.templates.length}</p></CardBody></Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-260px)] min-h-[660px]">
              <div className="xl:col-span-4 h-full">
                <PatientQueuePanel queue={d.queue} selectedId={selectedPatient?.id} onSelect={() => undefined} />
              </div>
              <div className="xl:col-span-8 h-full flex flex-col gap-5">
                <Card className="border-white/[0.06] shadow-glass bg-surface-light">
                  <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    <div>
                      <h3 className="text-[16px] font-black text-white">Queue Operations</h3>
                      <p className="text-[11px] text-gray-500">Triaging, starting calls, and managing the next patient in line.</p>
                    </div>
                  </CardHeader>
                  <CardBody className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-300">
                    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                      <Clock3 className="w-4 h-4 text-gray-400 mb-2" />
                      <p className="font-semibold text-white">Active patient</p>
                      <p className="text-gray-400 mt-1">{selectedPatient?.name ?? 'None selected'}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                      <Video className="w-4 h-4 text-gray-400 mb-2" />
                      <p className="font-semibold text-white">Connection quality</p>
                      <p className="text-gray-400 mt-1">{selectedPatient?.connectionQuality ?? 'N/A'}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                      <p className="font-semibold text-white">Next appointment</p>
                      <p className="text-gray-400 mt-1">{d.queue.find((patient) => patient.status === 'Waiting')?.scheduledTime ? new Date(d.queue.find((patient) => patient.status === 'Waiting')!.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No queued patient'}</p>
                    </div>
                  </CardBody>
                </Card>
                <ConsultationWorkspace patient={selectedPatient} templates={d.templates} initialTab="consult" />
              </div>
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
