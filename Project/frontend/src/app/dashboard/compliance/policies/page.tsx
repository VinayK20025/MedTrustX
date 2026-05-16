'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useComplianceDashboard, useUpdatePolicy } from '@/modules/compliance/hooks/useComplianceAnalytics';
import { ClipboardList, CheckCircle2, AlertTriangle, Users, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function PoliciesPage() {
  const { data } = useComplianceDashboard({});
  const { mutate: updatePolicy } = useUpdatePolicy();
  const policies = data?.data?.policies ?? [];
  const active = policies.filter(p => p.status === 'Active').length;
  const underReview = policies.filter(p => p.status === 'Under Review').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      <Breadcrumbs items={[{ label: 'Compliance' }, { label: 'Policies & Standards' }]} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Active Policies" subtitle="Currently effective" icon={<CheckCircle2 className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-success-light">{active}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Under Review" subtitle="Pending updates" icon={<AlertTriangle className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-warning-light">{underReview}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Total Coverage" subtitle="Policy portfolio" icon={<ClipboardList className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-white">{policies.length}</CardBody>
        </Card>
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Hospital Policies & Standards" subtitle="Compliance policies, procedures, and guidelines" icon={<ClipboardList className="w-4 h-4" />} />
        <CardBody className="space-y-3">
          {policies.map(policy => {
            const daysUntilReview = Math.ceil((new Date(policy.nextReviewDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const ackPercent = policy.acknowledgments ? Math.round((policy.acknowledgments.completed / policy.acknowledgments.total) * 100) : 0;
            return (
              <div key={policy.id} className={cn('rounded-xl border p-4 space-y-3', policy.status === 'Active' ? 'border-white/[0.06] bg-black/20' : 'border-warning/30 bg-warning/[0.05]')}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{policy.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{policy.description}</p>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-1 rounded uppercase shrink-0',
                    policy.status === 'Active' ? 'text-success-light bg-success/10' : policy.status === 'Under Review' ? 'text-warning-light bg-warning/10 animate-pulse' : 'text-gray-400 bg-white/10'
                  )}>{policy.status}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-400">
                  <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Department</span><span className="text-gray-200">{policy.department}</span></div>
                  <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Owner</span><span className="text-gray-200">{policy.owner}</span></div>
                  <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Last Review</span><span className="text-gray-200">{new Date(policy.lastReviewDate).toLocaleDateString()}</span></div>
                  <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Next Due</span><span className={cn('text-gray-200', daysUntilReview < 30 ? 'text-warning-light' : daysUntilReview < 0 ? 'text-emergency-light' : '')}>{daysUntilReview > 0 ? `${daysUntilReview}d` : 'Overdue'}</span></div>
                </div>
                <div className="space-y-2 bg-black/30 rounded-lg p-3">
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Staff Acknowledgments</span>
                    </div>
                    <span className="font-bold text-gray-300">{ackPercent}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-500 to-sky-400" style={{ width: `${ackPercent}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-500">{policy.acknowledgments?.completed} of {policy.acknowledgments?.total} staff acknowledged</p>
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
