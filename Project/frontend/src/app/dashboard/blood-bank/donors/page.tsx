'use client';
import React, { useEffect, useMemo } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { CLINICAL_ROLES } from '@/utils/permissions';
import { useBloodBankDashboard } from '@/modules/blood-bank';
import { useUIStore } from '@/store/ui.store';

export default function BloodBankDonorsPage() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useBloodBankDashboard({});

  useEffect(() => {
    setPageMeta('Blood Bank Donors', 'Recent donor activity and unit history');
  }, [setPageMeta]);

  const donors = useMemo(() => {
    const units = data?.data?.units ?? [];
    const map = new Map<string, { name: string; units: number; lastDonation: string; group: string }>();
    units.forEach((unit) => {
      const entry = map.get(unit.donorName);
      const lastDonation = entry ? (new Date(entry.lastDonation).getTime() > new Date(unit.collectedAt).getTime() ? entry.lastDonation : unit.collectedAt) : unit.collectedAt;
      map.set(unit.donorName, {
        name: unit.donorName,
        units: (entry?.units ?? 0) + 1,
        lastDonation,
        group: unit.bloodGroup,
      });
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.lastDonation).getTime() - new Date(a.lastDonation).getTime());
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Blood Bank' }, { label: 'Donors' }]} />
        <Card>
          <CardHeader title="Recent Donors" subtitle="Derived from current unit inventory" />
          <CardBody className="space-y-3">
            {donors.map((donor) => (
              <div key={donor.name} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div>
                  <p className="text-sm text-white font-semibold">{donor.name}</p>
                  <p className="text-2xs text-gray-500">Last donation {new Date(donor.lastDonation).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" size="sm">{donor.group}</Badge>
                  <Badge variant="info" size="sm">{donor.units} units</Badge>
                </div>
              </div>
            ))}
            {donors.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-8">No donor records available.</div>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
