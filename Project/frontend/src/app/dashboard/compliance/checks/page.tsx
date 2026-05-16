'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useComplianceDashboard, useCompleteCheck } from '@/modules/compliance/hooks/useComplianceAnalytics';
import { CheckCircle2, AlertTriangle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ChecksPage() {
  const { data } = useComplianceDashboard({});
  const { mutate: completeCheck, isPending } = useCompleteCheck();
  const checks = data?.data?.checks ?? [];
  const completed = checks.filter(c => c.status === 'Completed').length;
  const dueSoon = checks.filter(c => c.status === 'Due Soon').length;
  const overdue = checks.filter(c => c.status === 'Overdue').length;
  const pending = checks.filter(c => c.status === 'Pending').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      <Breadcrumbs items={[{ label: 'Compliance' }, { label: 'Compliance Checks' }]} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Completed" subtitle="Current schedule" icon={<CheckCircle2 className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-success-light">{completed}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Due Soon" subtitle="Next 7 days" icon={<Clock className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-warning-light">{dueSoon}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Overdue" subtitle="Past due date" icon={<AlertTriangle className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-emergency-light">{overdue}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Pending" subtitle="Not yet started" icon={<AlertCircle className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-white">{pending}</CardBody>
        </Card>
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Compliance Audit Schedule" subtitle="Policy reviews, training certification, access audits, and verification checks" icon={<CheckCircle2 className="w-4 h-4" />} />
        <CardBody className="space-y-3">
          {checks.map(check => {
            const daysUntilDue = Math.ceil((new Date(check.nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div key={check.id} className={cn('rounded-xl border p-4 space-y-3',
                check.status === 'Completed' ? 'border-white/[0.06] bg-black/20' :
                check.status === 'Overdue' ? 'border-emergency/30 bg-emergency/[0.05]' :
                check.status === 'Due Soon' ? 'border-warning/30 bg-warning/[0.05]' :
                'border-white/10 bg-white/[0.02]'
              )}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{check.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{check.description || `Type: ${check.checkType}`}</p>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-1 rounded uppercase shrink-0',
                    check.status === 'Completed' ? 'text-success-light bg-success/10' : 
                    check.status === 'Due Soon' ? 'text-warning-light bg-warning/10 animate-pulse' :
                    check.status === 'Overdue' ? 'text-emergency-light bg-emergency/10 animate-pulse' :
                    'text-gray-400 bg-white/10'
                  )}>{check.status}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-400">
                  <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Category</span><span className="text-gray-200">{check.category}</span></div>
                  <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Frequency</span><span className="text-gray-200 capitalize">{check.frequency}</span></div>
                  <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Department</span><span className="text-gray-200">{check.department}</span></div>
                  <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Owner</span><span className="text-gray-200">{check.owner}</span></div>
                </div>
                {check.lastCompletedDate && (
                  <div className="flex items-center justify-between bg-black/30 rounded-lg p-2 text-xs text-gray-400">
                    <span>Last completed: {new Date(check.lastCompletedDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-2 text-xs text-gray-400">
                  <span>Due: {new Date(check.nextDueDate).toLocaleDateString()}</span>
                  <span className={cn('font-bold', 
                    daysUntilDue > 7 ? 'text-gray-300' : 
                    daysUntilDue > 0 ? 'text-warning-light' : 
                    'text-emergency-light'
                  )}>
                    {daysUntilDue > 0 ? `${daysUntilDue}d away` : 'Overdue'}
                  </span>
                </div>
                {check.result && (
                  <div className="rounded-lg bg-black/30 p-3 border border-white/5 text-xs">
                    <p className="uppercase tracking-widest text-gray-500 mb-1">Result</p>
                    <p className="text-gray-300">{check.result}</p>
                  </div>
                )}
                {check.notes && (
                  <div className="rounded-lg bg-black/30 p-3 border border-white/5 text-xs">
                    <p className="uppercase tracking-widest text-gray-500 mb-1">Notes</p>
                    <p className="text-gray-300">{check.notes}</p>
                  </div>
                )}
                {check.status !== 'Completed' && (
                  <Button size="sm" onClick={() => completeCheck({ checkId: check.id, payload: { status: 'Completed', result: 'Check completed' } })} disabled={isPending}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Completed
                  </Button>
                )}
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
