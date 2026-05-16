'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { StudentCasePanel } from '../components/StudentCasePanel';
import { StudentAcademicPanel } from '../components/StudentAcademicPanel';
import { StudentDiscussionPanel } from '../components/StudentDiscussionPanel';
import { StudentAssessmentPanel } from '../components/StudentAssessmentPanel';
import { useStudentDashboard } from '../hooks/useStudentAnalytics';
import { ShieldAlert } from 'lucide-react';

function KPIChip({ kpi }: { kpi: { title: string; value: string | number; status: string; delta?: string } }) {
  const colors: Record<string, string> = { normal: 'border-white/[0.04] bg-white/[0.02]', success: 'border-success/20 bg-success/5', warning: 'border-warning/20 bg-warning/5', critical: 'border-emergency/20 bg-emergency/5' };
  const textColors: Record<string, string> = { normal: 'text-white', success: 'text-success-light', warning: 'text-warning-light', critical: 'text-emergency-light' };
  return (
    <div className={cn('rounded-xl border p-4 bg-surface-light flex flex-col justify-between shadow-glass', colors[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
      <p className={cn('text-2xl font-black mt-1', textColors[kpi.status])}>{kpi.value}</p>
      {kpi.delta && <p className="text-[10px] text-gray-500 mt-1">{kpi.delta}</p>}
    </div>
  );
}

export function StudentDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useStudentDashboard({});

  useEffect(() => { setPageMeta('Academic Workspace', 'Anonymized case observations and learning'); }, [setPageMeta]);

  if (isLoading) {
    return (<div className="space-y-6 animate-fade-in max-w-[1600px]">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
    </div>);
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Medical Student' }, { label: 'Learning Dashboard' }]} />
        <div className="flex items-center gap-2 text-sm font-mono text-gray-400 bg-surface-dark px-3 py-1.5 rounded-lg border border-white/10">
          <ShieldAlert className="w-4 h-4" /> STRICT ANONYMIZATION APPLIED
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {d.kpis.map(kpi => <KPIChip key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-auto xl:h-[750px]">
        {/* Left: Academic & Cases */}
        <div className="xl:col-span-8 h-[600px] xl:h-full flex flex-col gap-5">
           <div className="flex-1">
             <StudentAcademicPanel modules={d.academicModules} />
           </div>
           <div className="h-[350px]">
             <StudentCasePanel cases={d.cases} />
           </div>
        </div>
        
        {/* Right: Discussions & Assessments */}
        <div className="xl:col-span-4 h-[600px] xl:h-full flex flex-col gap-5">
           <div className="flex-1">
             <StudentDiscussionPanel discussions={d.discussions} />
           </div>
           <div className="flex-1">
             <StudentAssessmentPanel assessments={d.assessments} />
           </div>
        </div>
      </div>
    </div>
  );
}
