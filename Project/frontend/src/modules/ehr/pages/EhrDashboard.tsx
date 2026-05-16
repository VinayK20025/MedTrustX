'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { EhrPatientPanel } from '../components/EhrPatientPanel';
import { EhrWorkspace } from '../components/EhrWorkspace';
import { EhrValidationPanel } from '../components/EhrValidationPanel';
import { useEhrDashboard, useEhrPatientData, useValidateEhrRecord } from '../hooks/useEhrAnalytics';
import type { EhrFilters } from '../services/ehr.api';
import type { EhrKPI, EhrRecordData } from '../types/ehr.types';
import { AlertTriangle, ClipboardList, ShieldCheck } from 'lucide-react';

function EhrKPICard({ kpi }: { kpi: EhrKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.02]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm flex flex-col justify-between', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {(kpi.status === 'warning' || kpi.status === 'critical') && <AlertTriangle className="w-3 h-3" />}{kpi.title}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>{kpi.value.toLocaleString()}</p>
    </div>
  );
}

export function EhrDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<EhrFilters>({});
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const { data: dashboardData, isLoading: isDashLoading } = useEhrDashboard(filters);
  const { data: patientData } = useEhrPatientData(selectedId);
  const { mutate: validateRecord, data: validationData } = useValidateEhrRecord();

  useEffect(() => { setPageMeta('EHR System Operator', 'Clinical data integrity, accurate record keeping, and patient audits'); }, [setPageMeta]);

  if (isDashLoading) return (
    <div className="space-y-6 animate-fade-in max-w-[1800px]">
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>
  );

  const d = dashboardData?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const selectedPatient = d.patients.find(p => p.id === selectedId);
  const hasDuplicates = d.patients.some(p => p.hasDuplicates);

  const handleValidate = (data: EhrRecordData) => {
    validateRecord(data);
  };

  const validationErrors = validationData?.data?.errors || [];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1800px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Clinical Admin' }, { label: 'EHR Operator' }]} />
        <div className="flex items-center gap-3">
           {hasDuplicates && <span className="text-[10px] bg-emergency/20 text-emergency-light px-3 py-1.5 rounded-lg border border-emergency/30 font-bold flex items-center gap-1 animate-pulse"><AlertTriangle className="w-3 h-3" /> DUPLICATE RECORDS DETECTED</span>}
           <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/25">
             <ShieldCheck className="w-3.5 h-3.5" /> HIPAA COMPLIANT SESSION
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(kpi => <EhrKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-3 h-[650px]">
          <EhrPatientPanel patients={d.patients} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="xl:col-span-6 h-[650px]">
          <EhrWorkspace patient={selectedPatient} recordData={patientData?.data?.record} onValidate={handleValidate} />
        </div>
        <div className="xl:col-span-3 h-[650px]">
          <EhrValidationPanel errors={validationErrors} logs={patientData?.data?.logs} />
        </div>
      </div>
    </div>
  );
}
