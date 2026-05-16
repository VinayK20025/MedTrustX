'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useLegalComplianceDashboard } from '@/modules/legal-compliance/hooks/useLegalComplianceAnalytics';
import { Scale, CheckCircle2, AlertTriangle, AlertOctagon, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function RegulationsPage() {
  const { data } = useLegalComplianceDashboard({});
  const regulations = data?.data?.regulations ?? [];
  const compliant = regulations.filter(r => r.complianceStatus === 'Compliant').length;
  const atRisk = regulations.filter(r => r.complianceStatus === 'At Risk').length;
  const nonCompliant = regulations.filter(r => r.complianceStatus === 'Non-Compliant').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      <Breadcrumbs items={[{ label: 'Legal Compliance' }, { label: 'Regulatory Laws' }]} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Compliant" subtitle="Fully meeting all requirements" icon={<CheckCircle2 className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-success-light">{compliant}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="At risk" subtitle="Audit findings pending remediation" icon={<AlertTriangle className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-warning-light">{atRisk}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Non-compliant" subtitle="Immediate action required" icon={<AlertOctagon className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-emergency-light">{nonCompliant}</CardBody>
        </Card>
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Statutory law matrix" subtitle="Hospital-wide regulatory scope and compliance status" icon={<Scale className="w-4 h-4" />} />
        <CardBody className="space-y-3">
          {regulations.map(reg => {
            const daysSinceAudit = Math.floor((Date.now() - new Date(reg.lastAuditDate).getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={reg.id} className={cn('rounded-xl border p-4 space-y-3', reg.complianceStatus === 'Compliant' ? 'border-white/[0.06] bg-black/20' : reg.complianceStatus === 'At Risk' ? 'border-warning/30 bg-warning/[0.05]' : 'border-emergency/30 bg-emergency/[0.05]')}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold text-white">{reg.law}</p>
                    <p className="text-xs text-gray-500 mt-1">Scope: {reg.departmentScope}</p>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-1 rounded uppercase',
                    reg.complianceStatus === 'Compliant' ? 'text-success-light bg-success/10' : reg.complianceStatus === 'At Risk' ? 'text-warning-light bg-warning/10 animate-pulse' : 'text-emergency-light bg-emergency/10 animate-pulse'
                  )}>{reg.complianceStatus}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Last audit: {new Date(reg.lastAuditDate).toLocaleDateString()} <span className="text-gray-500">({daysSinceAudit} days ago)</span></span>
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
