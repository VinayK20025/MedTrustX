'use client';
import React, { useMemo } from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { CalendarCheck2, ArrowRight, BellRing } from 'lucide-react';
import { useTelemedicineDashboard } from '@/modules/telemedicine';

const TELEMEDICINE_ROLES = ['doctor', 'hospital_admin', 'super_admin'];

export default function Page() {
  const { data, isLoading } = useTelemedicineDashboard({});
  const routeName = 'Follow-up';
  const d = data?.data;
  const waitingPatients = useMemo(() => d?.queue.filter((patient) => patient.status === 'Waiting') ?? [], [d?.queue]);

  return (
    <RoleGuard roles={TELEMEDICINE_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px] mx-auto">
        <Breadcrumbs items={[{ label: 'Telemedicine' }, { label: routeName }]} />

        {isLoading ? (
          <Skeleton className="h-[680px] rounded-xl" />
        ) : !d ? (
          <div className="text-gray-500 py-20 text-center">No follow-up data available</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-260px)] min-h-[660px]">
            <div className="xl:col-span-8 flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Needs follow-up</p><p className="text-3xl font-black text-warning-light mt-2">{waitingPatients.length}</p></CardBody></Card>
                <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Templates</p><p className="text-3xl font-black text-white mt-2">{d.templates.length}</p></CardBody></Card>
                <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Current consult</p><p className="text-3xl font-black text-sky-400 mt-2">{d.queue.some((patient) => patient.status === 'In Consult') ? 'Live' : 'Idle'}</p></CardBody></Card>
              </div>

              <Card className="border-white/[0.06] shadow-glass bg-surface-light flex-1">
                <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
                  <CalendarCheck2 className="w-4 h-4 text-sky-400" />
                  <div>
                    <h3 className="text-[16px] font-black text-white">Follow-up Plan</h3>
                    <p className="text-[11px] text-gray-500">Surface the next-touch list directly from the telemedicine queue.</p>
                  </div>
                </CardHeader>
                <CardBody className="p-4 space-y-3 overflow-y-auto">
                  {waitingPatients.map((patient) => (
                    <div key={patient.id} className="rounded-xl border border-white/[0.06] bg-black/20 p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{patient.name}</p>
                        <p className="text-sm text-gray-400 mt-1">{patient.complaint}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{new Date(patient.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>
            <div className="xl:col-span-4">
              <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full">
                <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-warning-light" />
                  <div>
                    <h3 className="text-[16px] font-black text-white">Follow-up Rules</h3>
                    <p className="text-[11px] text-gray-500">Suggested escalation and next-contact guidance.</p>
                  </div>
                </CardHeader>
                <CardBody className="p-4 space-y-3 text-sm text-gray-300">
                  <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                    If a patient is marked <span className="text-warning-light font-semibold">Poor</span> connection quality, prefer an audio-only follow-up.
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                    If allergies are present, keep the prescription workspace open before scheduling the next telemedicine slot.
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                    Escalate any patient currently in consult to the history and records routes for documentation and audit trail.
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
