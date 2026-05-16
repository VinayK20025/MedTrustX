'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useLegalComplianceDashboard } from '@/modules/legal-compliance/hooks/useLegalComplianceAnalytics';
import { ClipboardCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ChecklistsPage() {
  const { data } = useLegalComplianceDashboard({});
  const checklists = data?.data?.checklists ?? [];
  const completed = checklists.filter(c => c.status === 'Completed').length;
  const inProgress = checklists.filter(c => c.status === 'In Progress').length;
  const pending = checklists.filter(c => c.status === 'Pending').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      <Breadcrumbs items={[{ label: 'Legal Compliance' }, { label: 'Audit Readiness' }]} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Completed" subtitle="Passed audit reviews" icon={<CheckCircle2 className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-success-light">{completed}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="In progress" subtitle="Active audit cycles" icon={<Clock className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-sky-400">{inProgress}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Pending" subtitle="Not yet started" icon={<AlertCircle className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-warning-light">{pending}</CardBody>
        </Card>
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Compliance audit checklists" subtitle="Department-level audit readiness and form completion" icon={<ClipboardCheck className="w-4 h-4" />} />
        <CardBody className="space-y-3">
          {checklists.map(checklist => {
            const completionPct = Math.round((checklist.completedChecks / checklist.totalChecks) * 100);
            const daysUntilDue = Math.ceil((new Date(checklist.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div key={checklist.id} className={cn('rounded-xl border p-4 space-y-3', checklist.status === 'Completed' ? 'border-white/[0.06] bg-black/20' : checklist.status === 'In Progress' ? 'border-sky-500/30 bg-sky-500/[0.05]' : 'border-warning/30 bg-warning/[0.05]')}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold text-white">{checklist.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{checklist.department}</p>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-1 rounded uppercase',
                    checklist.status === 'Completed' ? 'text-success-light bg-success/10' : checklist.status === 'In Progress' ? 'text-sky-300 bg-sky-500/10' : 'text-warning-light bg-warning/10'
                  )}>{checklist.status}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Completion Progress</span>
                    <span className="font-semibold text-gray-300">{completionPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden border border-white/10">
                    <div className={cn('h-full transition-all', checklist.status === 'Completed' ? 'bg-success-light' : checklist.status === 'In Progress' ? 'bg-sky-400' : 'bg-white/20')} style={{ width: `${completionPct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>{checklist.completedChecks} / {checklist.totalChecks} checks</span>
                    <span>Due {daysUntilDue > 0 ? `in ${daysUntilDue} days` : 'overdue'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
