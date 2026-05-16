'use client';
import React, { useMemo } from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { FileText, Pill, Send } from 'lucide-react';
import { ConsultationWorkspace, useTelemedicineDashboard } from '@/modules/telemedicine';

const TELEMEDICINE_ROLES = ['doctor', 'hospital_admin', 'super_admin'];

export default function Page() {
  const { data, isLoading } = useTelemedicineDashboard({});
  const routeName = 'Prescriptions';
  const d = data?.data;
  const selectedPatient = useMemo(() => d?.queue.find((patient) => patient.status !== 'Completed') ?? d?.queue[0], [d?.queue]);

  return (
    <RoleGuard roles={TELEMEDICINE_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px] mx-auto">
        <Breadcrumbs items={[{ label: 'Telemedicine' }, { label: routeName }]} />

        {isLoading ? (
          <Skeleton className="h-[720px] rounded-xl" />
        ) : !d ? (
          <div className="text-gray-500 py-20 text-center">No prescription data available</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Templates</p><p className="text-3xl font-black text-white mt-2">{d.templates.length}</p></CardBody></Card>
              <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Active patient</p><p className="text-3xl font-black text-sky-400 mt-2">{selectedPatient ? 1 : 0}</p></CardBody></Card>
              <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Send channels</p><p className="text-3xl font-black text-success-light mt-2">SMS + Pharmacy</p></CardBody></Card>
              <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Audit</p><p className="text-3xl font-black text-white mt-2">Signed</p></CardBody></Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-260px)] min-h-[680px]">
              <div className="xl:col-span-8 h-full">
                <ConsultationWorkspace patient={selectedPatient} templates={d.templates} initialTab="prescribe" />
              </div>
              <div className="xl:col-span-4 h-full flex flex-col gap-5">
                <Card className="border-white/[0.06] shadow-glass bg-surface-light">
                  <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-sky-400" />
                    <div>
                      <h3 className="text-[16px] font-black text-white">Prescription Workflow</h3>
                      <p className="text-[11px] text-gray-500">Compose, sign, and transmit e-prescriptions from the telemedicine encounter.</p>
                    </div>
                  </CardHeader>
                  <CardBody className="p-4 space-y-3 text-sm text-gray-300">
                    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                      <FileText className="w-4 h-4 text-gray-400 mb-2" />
                      <p className="font-semibold text-white">Current patient</p>
                      <p className="text-gray-400 mt-1">{selectedPatient?.name ?? 'No patient selected'}</p>
                      <p className="text-gray-500 mt-2 text-xs">The workspace opens in prescription mode for faster medication capture and review.</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                      <Send className="w-4 h-4 text-gray-400 mb-2" />
                      <p className="font-semibold text-white">Distribution</p>
                      <p className="text-gray-400 mt-1">Digital signature, patient notification, and pharmacy handoff.</p>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
