'use client';
import React, { useMemo } from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { BookText, ShieldCheck, Stethoscope } from 'lucide-react';
import { useTelemedicineDashboard } from '@/modules/telemedicine';

const TELEMEDICINE_ROLES = ['doctor', 'hospital_admin', 'super_admin'];

export default function Page() {
  const { data, isLoading } = useTelemedicineDashboard({});
  const routeName = 'Records';
  const d = data?.data;
  const active = useMemo(() => d?.queue.find((patient) => patient.status === 'In Consult'), [d?.queue]);

  return (
    <RoleGuard roles={TELEMEDICINE_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px] mx-auto">
        <Breadcrumbs items={[{ label: 'Telemedicine' }, { label: routeName }]} />

        {isLoading ? (
          <Skeleton className="h-[700px] rounded-xl" />
        ) : !d ? (
          <div className="text-gray-500 py-20 text-center">No records available</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-260px)] min-h-[660px]">
            <div className="xl:col-span-8 flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Live encounters</p><p className="text-3xl font-black text-sky-400 mt-2">{active ? 1 : 0}</p></CardBody></Card>
                <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Templates</p><p className="text-3xl font-black text-white mt-2">{d.templates.length}</p></CardBody></Card>
                <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Queue entries</p><p className="text-3xl font-black text-warning-light mt-2">{d.queue.length}</p></CardBody></Card>
              </div>

              <Card className="border-white/[0.06] shadow-glass bg-surface-light flex-1">
                <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
                  <BookText className="w-4 h-4 text-sky-400" />
                  <div>
                    <h3 className="text-[16px] font-black text-white">Telemedicine Record Set</h3>
                    <p className="text-[11px] text-gray-500">Capture the operational record for the current remote-care session.</p>
                  </div>
                </CardHeader>
                <CardBody className="p-4 space-y-3 overflow-y-auto">
                  {d.queue.map((patient) => (
                    <div key={patient.id} className="rounded-xl border border-white/[0.06] bg-black/20 p-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{patient.name}</p>
                        <p className="text-sm text-gray-400 mt-1">{patient.complaint}</p>
                        <p className="text-xs text-gray-500 mt-2">Scheduled: {new Date(patient.scheduledTime).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{patient.status}</span>
                        <span className="text-xs text-gray-500">{patient.connectionQuality} connection</span>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>
            <div className="xl:col-span-4 flex flex-col gap-5">
              <Card className="border-white/[0.06] shadow-glass bg-surface-light">
                <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-success-light" />
                  <div>
                    <h3 className="text-[16px] font-black text-white">Audit Trail</h3>
                    <p className="text-[11px] text-gray-500">Link the records view to clinical sign-off and signing status.</p>
                  </div>
                </CardHeader>
                <CardBody className="p-4 space-y-3 text-sm text-gray-300">
                  <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                    Every encounter is captured with queue status, consultation timing, and prescription context.
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-gray-400" />
                    <span>{active ? `${active.name} is the current active consult` : 'No active consult at the moment'}</span>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
