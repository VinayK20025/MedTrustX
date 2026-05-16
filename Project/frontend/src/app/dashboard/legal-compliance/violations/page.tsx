'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLegalComplianceDashboard, useResolveViolation } from '@/modules/legal-compliance/hooks/useLegalComplianceAnalytics';
import { AlertOctagon, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ViolationsPage() {
  const { data } = useLegalComplianceDashboard({});
  const { mutate: resolve, isPending } = useResolveViolation();
  const violations = data?.data?.violations ?? [];
  const critical = violations.filter(v => v.severity === 'Critical').length;
  const high = violations.filter(v => v.severity === 'High').length;
  const open = violations.filter(v => v.status === 'Open').length;

  const severityColor = { Critical: 'border-emergency/30 bg-emergency/[0.05]', High: 'border-orange-500/30 bg-orange-500/[0.05]', Medium: 'border-warning/30 bg-warning/[0.05]' };
  const severityIcon = { Critical: AlertOctagon, High: AlertTriangle, Medium: AlertTriangle };

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      <Breadcrumbs items={[{ label: 'Legal Compliance' }, { label: 'Violations & Issues' }]} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Critical" subtitle="Immediate legal/financial risk" icon={<AlertOctagon className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-emergency-light">{critical}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="High severity" subtitle="Escalation-level findings" icon={<AlertTriangle className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-orange-400">{high}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Open items" subtitle="Awaiting resolution" icon={<Clock className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-warning-light">{open}</CardBody>
        </Card>
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Regulatory violation log" subtitle="Detected issues, penalty risks, and resolution tracking" icon={<AlertOctagon className="w-4 h-4" />} />
        <CardBody className="space-y-3">
          {violations.map(violation => {
            const Icon = severityIcon[violation.severity as keyof typeof severityIcon];
            return (
              <div key={violation.id} className={cn('rounded-xl border p-4 space-y-3', severityColor[violation.severity as keyof typeof severityColor])}>
                <div className="flex items-start gap-3 justify-between flex-wrap">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className={cn('w-5 h-5 shrink-0 mt-0.5',
                      violation.severity === 'Critical' ? 'text-emergency-light' : violation.severity === 'High' ? 'text-orange-400' : 'text-warning-light'
                    )} />
                    <div>
                      <p className="font-semibold text-white">{violation.issue}</p>
                      <p className="text-xs text-gray-500 mt-1">{violation.department} • Detected {new Date(violation.detectedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-1 rounded uppercase shrink-0',
                    violation.severity === 'Critical' ? 'text-emergency-light bg-emergency/10' : violation.severity === 'High' ? 'text-orange-400 bg-orange-500/10' : 'text-warning-light bg-warning/10'
                  )}>{violation.severity}</span>
                </div>
                <div className="rounded-lg border border-current/20 bg-black/30 p-3">
                  <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Penalty Risk</p>
                  <p className="text-sm font-semibold">{violation.penaltyRisk}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn('text-[10px] font-bold uppercase', violation.status === 'Resolved' ? 'text-success-light' : 'text-current')}>{violation.status}</span>
                  {violation.status !== 'Resolved' && (
                    <Button size="sm" variant="outline" onClick={() => resolve({ id: violation.id, notes: 'Resolved' })} disabled={isPending}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
