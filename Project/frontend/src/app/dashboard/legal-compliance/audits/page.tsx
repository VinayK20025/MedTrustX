'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useLegalComplianceDashboard } from '@/modules/legal-compliance/hooks/useLegalComplianceAnalytics';
import { Calendar, CheckCircle2, AlertTriangle, BarChart3 } from 'lucide-react';

export default function AuditsPage() {
  const { data } = useLegalComplianceDashboard({});
  const regulations = data?.data?.regulations ?? [];
  const checklists = data?.data?.checklists ?? [];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      <Breadcrumbs items={[{ label: 'Legal Compliance' }, { label: 'Audit Schedule & Results' }]} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Regulatory audits" subtitle="Laws requiring periodic review" icon={<BarChart3 className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-white">{regulations.length}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Pending checklists" subtitle="Audits due soon" icon={<Calendar className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-warning-light">{checklists.filter(c => c.status !== 'Completed').length}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Audit coverage" subtitle="Departments under review" icon={<CheckCircle2 className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-success-light">{new Set(checklists.map(c => c.department)).size}</CardBody>
        </Card>
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Audit schedule & findings" subtitle="Regulatory law audit history and next review dates" icon={<Calendar className="w-4 h-4" />} />
        <CardBody className="space-y-3">
          {regulations.map(reg => {
            const daysSinceAudit = Math.floor((Date.now() - new Date(reg.lastAuditDate).getTime()) / (1000 * 60 * 60 * 24));
            const nextAuditDue = daysSinceAudit > 365 ? 'OVERDUE' : daysSinceAudit > 330 ? 'DUE SOON' : 'ON SCHEDULE';
            return (
              <div key={reg.id} className="rounded-xl border border-white/[0.06] bg-black/20 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{reg.law}</p>
                    <p className="text-xs text-gray-500 mt-1">Scope: {reg.departmentScope}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/10 text-gray-300 uppercase">{reg.complianceStatus}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-gray-400">
                  <div><span className="block uppercase tracking-widest mb-0.5">Last Audit</span><span className="text-gray-200 font-semibold">{new Date(reg.lastAuditDate).toLocaleDateString()}</span></div>
                  <div><span className="block uppercase tracking-widest mb-0.5">Days Ago</span><span className="text-gray-200 font-semibold">{daysSinceAudit}</span></div>
                  <div><span className="block uppercase tracking-widest mb-0.5">Status</span><span className={nextAuditDue === 'OVERDUE' ? 'text-emergency-light' : nextAuditDue === 'DUE SOON' ? 'text-warning-light' : 'text-success-light'}>{nextAuditDue}</span></div>
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Checklist schedule" subtitle="Audit form completion status and due dates" icon={<Calendar className="w-4 h-4" />} />
        <CardBody className="space-y-3">
          {checklists.map(checklist => {
            const daysUntilDue = Math.ceil((new Date(checklist.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div key={checklist.id} className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{checklist.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{checklist.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Due</p>
                    <p className={`text-sm font-semibold ${daysUntilDue < 0 ? 'text-emergency-light' : daysUntilDue < 7 ? 'text-warning-light' : 'text-gray-300'}`}>{daysUntilDue < 0 ? 'Overdue' : `${daysUntilDue}d`}</p>
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
