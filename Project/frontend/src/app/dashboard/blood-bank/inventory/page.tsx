'use client';
import React, { useEffect } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { CLINICAL_ROLES } from '@/utils/permissions';
import { useBloodBankDashboard } from '@/modules/blood-bank';
import { InventoryPanel } from '@/modules/blood-bank';
import { useUIStore } from '@/store/ui.store';

export default function BloodBankInventoryPage() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useBloodBankDashboard({});

  useEffect(() => {
    setPageMeta('Blood Bank Inventory', 'Group stock and critical thresholds');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  const stock = data?.data?.stock ?? [];
  const critical = stock.filter((s) => s.status === 'Critical');

  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Blood Bank' }, { label: 'Inventory' }]} />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-7">
            <InventoryPanel stock={stock} />
          </div>
          <div className="xl:col-span-5">
            <Card>
              <CardHeader title="Critical Stock" subtitle="Immediate replenishment required" />
              <CardBody className="space-y-3">
                {critical.map((item) => (
                  <div key={item.group} className="flex items-center justify-between p-3 rounded-lg bg-emergency/10 border border-emergency/30">
                    <div>
                      <p className="text-sm text-white font-semibold">{item.group}</p>
                      <p className="text-2xs text-gray-500">Threshold {item.threshold}</p>
                    </div>
                    <span className="text-lg font-bold text-emergency-light">{item.units}</span>
                  </div>
                ))}
                {critical.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-6">No critical stock groups.</div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
