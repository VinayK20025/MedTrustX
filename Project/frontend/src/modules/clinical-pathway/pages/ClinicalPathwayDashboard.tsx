'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { ClinicalPathwaysPanel } from '../components/ClinicalPathwaysPanel';
import { PathwayStepsPanel } from '../components/PathwayStepsPanel';
import { PatientJourneysPanel } from '../components/PatientJourneysPanel';
import { PathwayVariancesPanel } from '../components/PathwayVariancesPanel';
import { useClinicalPathway } from '../hooks/useClinicalPathway';
import { Workflow, HeartPulse, Stethoscope, AlertTriangle, Activity, Users } from 'lucide-react';

interface PathwayKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function PathwayKPICard({ kpi }: { kpi: PathwayKPI }) {
  const statusColors: Record<string, string> = {
    success: 'border-success/20 hover:border-success/40', normal: 'border-white/[0.06] hover:border-white/[0.12]',
    warning: 'border-warning/20 hover:border-warning/40', critical: 'border-emergency/20 hover:border-emergency/40 bg-emergency/[0.02]',
  };
  const valueColors: Record<string, string> = {
    success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light',
  };
  const Icon = kpi.icon;
  return (
    <div className={cn('group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-card-hover', statusColors[kpi.status])}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
        <div className="p-2 rounded-lg bg-pink-500/15"><Icon className="w-4 h-4 text-pink-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const ClinicalPathwayDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { usePathways } = useClinicalPathway();
  const pathQuery = usePathways();

  useEffect(() => {
    setPageMeta('Clinical Pathways', 'Evidence-based care standardization, protocol adherence, and variance tracking');
  }, [setPageMeta]);

  if (pathQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: PathwayKPI[] = [
    { id: 'pathways', title: 'Active Protocols', value: 84, status: 'normal', icon: Workflow, subtitle: 'Standardized care plans' },
    { id: 'patients', title: 'Patients Enrolled', value: 1245, status: 'success', icon: Users, subtitle: 'Currently on pathway' },
    { id: 'adherence', title: 'Protocol Adherence', value: '92.4%', status: 'success', icon: HeartPulse, subtitle: 'Target: >90%' },
    { id: 'variances', title: 'Care Variances', value: 18, status: 'warning', icon: AlertTriangle, subtitle: 'Deviations from standard' },
    { id: 'los', title: 'Avg LOS Reduction', value: '1.2d', status: 'success', icon: Activity, subtitle: 'Length of stay impact' },
    { id: 'outcomes', title: 'Improved Outcomes', value: '8.4%', status: 'success', icon: Stethoscope, subtitle: 'Quality metric lift' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Clinical' }, { label: 'Pathways & Protocols' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-pink-300 bg-pink-500/10 px-4 py-2 rounded-lg border border-pink-500/25">
          <Workflow className="w-3.5 h-3.5" />
          CARE STANDARDIZATION
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <PathwayKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 h-[450px]">
          <PatientJourneysPanel />
        </div>
        <div className="xl:col-span-5 h-[450px]">
          <PathwayVariancesPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-6 h-[400px]">
          <ClinicalPathwaysPanel />
        </div>
        <div className="xl:col-span-6 h-[400px]">
          <PathwayStepsPanel />
        </div>
      </div>
    </div>
  );
};
