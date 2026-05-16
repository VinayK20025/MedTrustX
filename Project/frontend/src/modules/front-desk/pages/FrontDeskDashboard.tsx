'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { FrontDeskQueuePanel } from '../components/FrontDeskQueuePanel';
import { FrontDeskRegistrationPanel } from '../components/FrontDeskRegistrationPanel';
import { FrontDeskAppointmentPanel } from '../components/FrontDeskAppointmentPanel';
import { useFrontDeskDashboard } from '../hooks/useFrontDeskAnalytics';
import type { FrontDeskFilters } from '../services/frontDesk.api';
import type { FrontDeskKPI } from '../types/frontDesk.types';
import { Headset, UserPlus, CalendarPlus, Ticket, CreditCard, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

function FrontDeskKPICard({ kpi }: { kpi: FrontDeskKPI }) {
  const statusColors: Record<string, string> = {
    success:  'border-success/20',
    normal:   'border-white/[0.06]',
    warning:  'border-warning/20 bg-warning/[0.02]',
    critical: 'border-emergency/20 bg-emergency/[0.02]',
  };
  const valueColors: Record<string, string> = {
    success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light',
  };

  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm', statusColors[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {kpi.status === 'warning' && <AlertTriangle className="w-3 h-3 text-warning-light" />}
        {kpi.title}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>
        {kpi.value.toLocaleString()}
      </p>
    </div>
  );
}

export function FrontDeskDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<FrontDeskFilters>({});
  const { data, isLoading } = useFrontDeskDashboard(filters);
  const router = useRouter();

  useEffect(() => {
    setPageMeta('Front Desk Executive', 'High-speed patient intake, queue management, and appointment booking');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1800px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1800px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Front Office' }, { label: 'Reception Desk' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-amber-300 bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/25">
          <Headset className="w-3.5 h-3.5" />
          RECEPTION TERMINAL
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => router.push('/dashboard/front-desk/register')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-5" leftIcon={<UserPlus className="w-4 h-4"/>}>
          + New Patient
        </Button>
        <Button onClick={() => router.push('/dashboard/front-desk/appointments')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-11 px-5" leftIcon={<CalendarPlus className="w-4 h-4"/>}>
          Book Appointment
        </Button>
        <Button onClick={() => router.push('/dashboard/front-desk/queue')} className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-11 px-5" leftIcon={<Ticket className="w-4 h-4"/>}>
          Generate Token
        </Button>
        <Button onClick={() => router.push('/dashboard/front-desk/billing')} className="bg-violet-600 hover:bg-violet-500 text-white font-bold h-11 px-5" leftIcon={<CreditCard className="w-4 h-4"/>}>
          Quick Bill
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <FrontDeskKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Main Orchestration Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left: Queue Management */}
        <div className="xl:col-span-5 h-[600px]">
          <FrontDeskQueuePanel queue={d.activeQueue} />
        </div>

        {/* Center: Registration */}
        <div className="xl:col-span-4 h-[600px]">
          <FrontDeskRegistrationPanel />
        </div>

        {/* Right: Today's Appointments */}
        <div className="xl:col-span-3 h-[600px]">
          <FrontDeskAppointmentPanel appointments={d.todayAppointments} />
        </div>
      </div>
    </div>
  );
}
