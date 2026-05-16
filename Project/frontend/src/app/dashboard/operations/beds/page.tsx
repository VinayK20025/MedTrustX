'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { BedManagementPanel, useOperationsDashboard } from '@/modules/operations';

const BED_ROLES = ['hospital_admin', 'super_admin'];

export default function OperationsBedsPage() {
  const { data, isLoading } = useOperationsDashboard({});
  const beds = data?.data?.beds ?? [];

  return (
    <RoleGuard roles={BED_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1800px]">
        <Breadcrumbs items={[{ label: 'Operations' }, { label: 'Bed Management' }]} />

        {isLoading ? (
          <Skeleton className="h-[680px] w-full rounded-xl" />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            <div className="xl:col-span-8 h-[680px]">
              <BedManagementPanel beds={beds} />
            </div>
            <div className="xl:col-span-4 flex flex-col gap-5">
              <Card className="border-white/[0.06] shadow-glass bg-surface-light">
                <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white tracking-wide">Occupancy Summary</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Current bed pressure across the hospital</p>
                  </div>
                </CardHeader>
                <CardBody className="p-4 space-y-3 text-sm">
                  <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3 flex items-center justify-between">
                    <span className="text-gray-300">Total beds</span>
                    <span className="font-bold text-white">{beds.reduce((sum, bed) => sum + bed.total, 0)}</span>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3 flex items-center justify-between">
                    <span className="text-gray-300">Occupied</span>
                    <span className="font-bold text-white">{beds.reduce((sum, bed) => sum + bed.occupied, 0)}</span>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3 flex items-center justify-between">
                    <span className="text-gray-300">Cleaning</span>
                    <span className="font-bold text-white">{beds.reduce((sum, bed) => sum + bed.cleaning, 0)}</span>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3 flex items-center justify-between">
                    <span className="text-gray-300">Available</span>
                    <span className="font-bold text-white">{beds.reduce((sum, bed) => sum + bed.available, 0)}</span>
                  </div>
                </CardBody>
              </Card>
              <Card className="border-white/[0.06] shadow-glass bg-surface-light flex-1">
                <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white tracking-wide">Operational Notes</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Bed-management workflow guidance</p>
                  </div>
                </CardHeader>
                <CardBody className="p-4 space-y-2 text-sm text-gray-300">
                  <p>Track ward-level pressure from a single operations panel.</p>
                  <p>Highlight critical departments when occupancy approaches capacity thresholds.</p>
                  <p>Use cleaning cycles and occupied beds to plan discharge and transfer timing.</p>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
