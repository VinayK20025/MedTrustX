'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useComplianceDashboard, useUpdateViolation } from '@/modules/compliance/hooks/useComplianceAnalytics';
import { AlertOctagon, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ViolationsPage() {
  const { data } = useComplianceDashboard({});
  const { mutate: updateViolation, isPending } = useUpdateViolation();
  const violations = data?.data?.violations ?? [];
  const critical = violations.filter(v => v.severity === 'Critical').length;
  const high = violations.filter(v => v.severity === 'High').length;
  const open = violations.filter(v => v.status === 'Open' || v.status === 'Under Investigation').length;

  const severityColor = {
    Critical: 'border-emergency/30 bg-emergency/[0.05]',
    High: 'border-orange-500/30 bg-orange-500/[0.05]',
    Medium: 'border-warning/30 bg-warning/[0.05]',
    Low: 'border-white/10 bg-black/20',
  };

  const severityIcon = {
    Critical: AlertOctagon,
    High: AlertTriangle,
    Medium: AlertTriangle,
    Low: AlertTriangle,
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      <Breadcrumbs items={[{ label: 'Compliance' }, { label: 'Violations & Issues' }]} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Critical" subtitle="Immediate action required" icon={<AlertOctagon className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-emergency-light">{critical}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="High Severity" subtitle="Urgent review needed" icon={<AlertTriangle className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-orange-400">{high}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Open Issues" subtitle="Under investigation" icon={<Calendar className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-warning-light">{open}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Total Violations" subtitle="All statuses" icon={<AlertTriangle className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-white">{violations.length}</CardBody>
        </Card>
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Compliance Violations Tracker" subtitle="Issues, root causes, and corrective actions" icon={<AlertOctagon className="w-4 h-4" />} />
        <CardBody className="space-y-3">
          {violations.map(violation => {
            const Icon = severityIcon[violation.severity as keyof typeof severityIcon];
            return (
              <div key={violation.id} className={cn('rounded-xl border p-4 space-y-3', severityColor[violation.severity as keyof typeof severityColor])}>
                <div className="flex items-start gap-3 justify-between flex-wrap">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className={cn('w-5 h-5 shrink-0 mt-0.5',
                      violation.severity === 'Critical' ? 'text-emergency-light' : violation.severity === 'High' ? 'text-orange-400' : violation.severity === 'Medium' ? 'text-warning-light' : 'text-gray-400'
                    )} />
                    <div>
                      <p className="font-semibold text-white">{violation.issue}</p>
                      <p className="text-xs text-gray-500 mt-1">{violation.department} • {new Date(violation.reportedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-1 rounded uppercase shrink-0',
                    violation.severity === 'Critical' ? 'text-emergency-light bg-emergency/10' : violation.severity === 'High' ? 'text-orange-400 bg-orange-500/10' : violation.severity === 'Medium' ? 'text-warning-light bg-warning/10' : 'text-gray-400 bg-white/10'
                  )}>{violation.severity}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                  <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Category</span><span className="text-gray-200 capitalize">{violation.category.replace('-', ' ')}</span></div>
                  <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Status</span><span className={cn('text-gray-200', violation.status === 'Closed' ? 'text-success-light' : violation.status === 'Corrected' ? 'text-success-light' : 'text-current')}>{violation.status}</span></div>
                </div>
                {(violation.rootCause || violation.correctiveAction) && (
                  <div className="rounded-lg bg-black/30 p-3 border border-white/5 space-y-2">
                    {violation.rootCause && (
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Root Cause</p>
                        <p className="text-xs text-gray-300">{violation.rootCause}</p>
                      </div>
                    )}
                    {violation.correctiveAction && (
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Corrective Action</p>
                        <p className="text-xs text-gray-300">{violation.correctiveAction}</p>
                      </div>
                    )}
                  </div>
                )}
                {violation.status !== 'Closed' && violation.status !== 'Corrected' && (
                  <Button size="sm" variant="outline" onClick={() => updateViolation({ violationId: violation.id, payload: { status: 'Corrected', notes: 'Issue resolved' } })} disabled={isPending}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Resolved
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
