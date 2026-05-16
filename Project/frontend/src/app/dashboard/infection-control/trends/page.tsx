'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { useInfectionControlDashboard } from '@/modules/infection-control';

export default function InfectionTrendsPage() {
  const { data, isLoading } = useInfectionControlDashboard({});

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-xl" />;
  }

  const wards = data?.data?.wardSummaries ?? [];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infection Control' }, { label: 'Trends' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Ward Infection Trends" subtitle="Infection rate per ward" />
        <CardBody className="space-y-3">
          {wards.map((ward) => (
            <div key={ward.wardId} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white font-semibold">{ward.wardName}</p>
                  <p className="text-xs text-gray-500">{ward.activeCases} active cases</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white font-semibold">{ward.infectionRate}/1000 pt-days</p>
                  <p className="text-2xs text-gray-500">{ward.status}</p>
                </div>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className={ward.status === 'Outbreak' ? 'bg-emergency-500 h-full' : ward.status === 'Elevated' ? 'bg-yellow-500 h-full' : 'bg-emerald-500 h-full'}
                  style={{ width: `${Math.min((ward.infectionRate / 10) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
          {wards.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">No ward trends available.</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
