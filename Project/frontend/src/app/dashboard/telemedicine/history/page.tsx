'use client';
import React, { useMemo } from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { History, Clock3, CheckCircle2 } from 'lucide-react';
import { NotesPanel, useTelemedicineDashboard } from '@/modules/telemedicine';

const TELEMEDICINE_ROLES = ['doctor', 'hospital_admin', 'super_admin'];

export default function Page() {
  const { data, isLoading } = useTelemedicineDashboard({});
  const routeName = 'History';
  const d = data?.data;
  const completed = d?.queue.filter((patient) => patient.status === 'Completed') ?? [];
  const active = useMemo(() => d?.queue.find((patient) => patient.status === 'In Consult'), [d?.queue]);

  return (
    <RoleGuard roles={TELEMEDICINE_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px] mx-auto">
        <Breadcrumbs items={[{ label: 'Telemedicine' }, { label: routeName }]} />

        {isLoading ? (
          <Skeleton className="h-[720px] rounded-xl" />
        ) : !d ? (
          <div className="text-gray-500 py-20 text-center">No history available</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-260px)] min-h-[680px]">
            <div className="xl:col-span-8 flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Completed</p><p className="text-3xl font-black text-success-light mt-2">{completed.length}</p></CardBody></Card>
                <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Active</p><p className="text-3xl font-black text-sky-400 mt-2">{active ? 1 : 0}</p></CardBody></Card>
                <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Templates</p><p className="text-3xl font-black text-white mt-2">{d.templates.length}</p></CardBody></Card>
              </div>

              <Card className="border-white/[0.06] shadow-glass bg-surface-light flex-1">
                <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
                  <History className="w-4 h-4 text-sky-400" />
                  <div>
                    <h3 className="text-[16px] font-black text-white">Consultation History</h3>
                    <p className="text-[11px] text-gray-500">Use live queue status as the operational history of current and prior telemedicine encounters.</p>
                  </div>
                </CardHeader>
                <CardBody className="p-4 space-y-3 overflow-y-auto">
                  {d.queue.map((patient) => (
                    <div key={patient.id} className="rounded-xl border border-white/[0.06] bg-black/20 p-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{patient.name}</p>
                        <p className="text-sm text-gray-400 mt-1">{patient.complaint}</p>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Clock3 className="w-3 h-3" /> {new Date(patient.scheduledTime).toLocaleString()}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{patient.status}</span>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>
            <div className="xl:col-span-4 flex flex-col gap-5">
              <Card className="border-white/[0.06] shadow-glass bg-surface-light">
                <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success-light" />
                  <div>
                    <h3 className="text-[16px] font-black text-white">Archived Notes</h3>
                    <p className="text-[11px] text-gray-500">Document the encounter and capture follow-up instructions.</p>
                  </div>
                </CardHeader>
                <CardBody className="p-0"><NotesPanel /></CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
