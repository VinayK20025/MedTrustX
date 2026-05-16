'use client';

import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { GitMerge, ArrowRight, ShieldCheck } from 'lucide-react';
import { useManagementDashboard } from '../hooks/useManagementAnalytics';

const ACCESS_ROLES = ['super_admin', 'hospital_admin', 'tenant_admin', 'chief_medical_officer', 'department_head'];

export function ManagementRoutingPage() {
  const { data } = useManagementDashboard({});
  const d = data?.data;

  return (
    <RoleGuard roles={ACCESS_ROLES}>
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Breadcrumbs items={[{ label: 'Administration' }, { label: 'Management Routing' }]} />
          <div className="flex items-center gap-2 text-[11px] font-bold text-sky-300 bg-sky-500/10 px-4 py-2 rounded-lg border border-sky-500/25 whitespace-nowrap">
            <GitMerge className="w-3.5 h-3.5" /> ROUTING CONTROL
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="border-white/[0.06] shadow-glass bg-surface-light lg:col-span-2">
            <CardHeader title="Route Map" subtitle="Management-level routing into existing hospital modules" icon={<GitMerge className="w-4 h-4" />} />
            <CardBody className="space-y-3">
              {(d?.routes ?? []).map((route) => (
                <div key={route.id} className="rounded-xl border border-white/[0.06] bg-black/20 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{route.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{route.condition}</p>
                    </div>
                    <span className={route.active ? 'text-success-light text-[10px] font-bold uppercase tracking-widest' : 'text-gray-500 text-[10px] font-bold uppercase tracking-widest'}>{route.status}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
                    <span className="bg-white/5 border border-white/10 px-2 py-1 rounded">{route.source}</span>
                    <ArrowRight className="w-3 h-3 text-gray-500" />
                    <span className="bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2 py-1 rounded">{route.destination}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2"><p className="text-gray-500">Throughput</p><p className="text-white font-semibold mt-0.5">{route.throughputPerHour}/h</p></div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2"><p className="text-gray-500">Latency</p><p className="text-white font-semibold mt-0.5">{route.latencyMs}ms</p></div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader title="Routing Controls" subtitle="Service-wide governance and status" icon={<ShieldCheck className="w-4 h-4" />} />
            <CardBody className="space-y-3 text-sm text-gray-300">
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                Management routes fan out into case, evidence, visitor, and network control surfaces. Keep route activation aligned with operational ownership.
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                Use the main dashboard to triage work items, then open the linked modules for detailed resolution.
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                Production access is limited to executive and department-head roles with enterprise governance responsibilities.
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
