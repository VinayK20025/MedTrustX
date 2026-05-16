'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { AdmissionWizardPanel, useAdmissionSchedulerDashboard } from '@/modules/admission-scheduler';

const BED_ROLES = ['hospital_admin', 'super_admin'];

export default function BedManagementPage() {
  const { data, isLoading } = useAdmissionSchedulerDashboard({ mode: 'admission' });
  const beds = data?.data?.beds ?? [];

  return (
    <RoleGuard roles={BED_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1800px]">
        <Breadcrumbs items={[{ label: 'Admissions' }, { label: 'Bed Management' }]} />

        {isLoading ? (
          <Skeleton className="h-[760px] w-full rounded-xl" />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            <div className="xl:col-span-8 h-[760px]">
              <AdmissionWizardPanel beds={beds} />
            </div>
            <div className="xl:col-span-4 flex flex-col gap-5">
              <Card className="border-white/[0.06] shadow-glass bg-surface-light">
                <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white tracking-wide">Bed Snapshot</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Live bed availability used during admission placement</p>
                  </div>
                </CardHeader>
                <CardBody className="p-4 space-y-3 text-sm">
                  {beds.map((bed) => (
                    <div key={bed.id} className="rounded-lg border border-white/[0.08] bg-surface-dark p-3 flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{bed.label}</p>
                        <p className="text-xs text-gray-500">{bed.ward} · {bed.department}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400">{bed.status}</span>
                    </div>
                  ))}
                </CardBody>
              </Card>
              <Card className="border-white/[0.06] shadow-glass bg-surface-light flex-1">
                <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white tracking-wide">Admission Flow</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Use the wizard to place admitted patients into open beds</p>
                  </div>
                </CardHeader>
                <CardBody className="p-4 space-y-2 text-sm text-gray-300">
                  <p>Search patient identity, verify admission details, and assign a compatible bed.</p>
                  <p>Track reserved, cleaning, and occupied beds to prevent placement conflicts.</p>
                  <p>Finalize admission only after the bed and insurance steps are complete.</p>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
