'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLegalComplianceDashboard, useExportStatutoryReport } from '@/modules/legal-compliance/hooks/useLegalComplianceAnalytics';
import { FileText, Download, BarChart3, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ReportsPage() {
  const { data } = useLegalComplianceDashboard({});
  const { mutate: exportReport, isPending } = useExportStatutoryReport();
  const d = data?.data;

  const overall = d?.kpis?.[0]?.value ?? '0%';
  const violations = d?.violations?.length ?? 0;
  const licenses = d?.licenses?.length ?? 0;
  const regulations = d?.regulations?.length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      <Breadcrumbs items={[{ label: 'Legal Compliance' }, { label: 'Statutory Reports' }]} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Overall compliance" subtitle="Hospital-wide compliance score" icon={<CheckCircle2 className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-success-light">{overall}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Active violations" subtitle="Pending resolution" icon={<AlertTriangle className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-emergency-light">{violations}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Hospital licenses" subtitle="Statutory registrations" icon={<FileText className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-white">{licenses}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Laws tracked" subtitle="Regulatory scope" icon={<BarChart3 className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-white">{regulations}</CardBody>
        </Card>
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Statutory reports" subtitle="Board-ready documentation and compliance exports" icon={<FileText className="w-4 h-4" />} />
        <CardBody className="space-y-4">
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 space-y-3">
            <div>
              <p className="font-semibold text-white">Hospital Compliance Summary</p>
              <p className="text-sm text-gray-400 mt-1">Overall compliance status, violation summary, and license portfolio snapshot.</p>
            </div>
            <Button onClick={() => exportReport()} disabled={isPending} className="w-full">
              <Download className="w-4 h-4" /> Generate & Export Statutory Report
            </Button>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 space-y-3">
            <div>
              <p className="font-semibold text-white">License Renewal Calendar</p>
              <p className="text-sm text-gray-400 mt-1">Upcoming license expirations and renewal milestones for operational planning.</p>
            </div>
            <Button variant="outline" className="w-full">
              <FileText className="w-4 h-4" /> Export License Schedule
            </Button>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 space-y-3">
            <div>
              <p className="font-semibold text-white">Regulatory Compliance Matrix</p>
              <p className="text-sm text-gray-400 mt-1">Hospital-wide law compliance status, audit dates, and departmental scope.</p>
            </div>
            <Button variant="outline" className="w-full">
              <FileText className="w-4 h-4" /> Export Compliance Matrix
            </Button>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 space-y-3">
            <div>
              <p className="font-semibold text-white">Active Violations Report</p>
              <p className="text-sm text-gray-400 mt-1">Open violation details, penalty risks, and resolution tracking.</p>
            </div>
            <Button variant="outline" className="w-full">
              <FileText className="w-4 h-4" /> Export Violations Log
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Reporting guide" subtitle="What each report covers and use cases" icon={<BarChart3 className="w-4 h-4" />} />
        <CardBody className="space-y-3 text-sm text-gray-300">
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">All reports are designed to be board-ready, sharing the same data structure and compliance narrative used in the main dashboard.</div>
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">Use the statutory report for executive governance and regulatory submissions; use the license schedule for operations planning; use the compliance matrix for audit readiness.</div>
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">Connect with the dashboard routes for interactive drill-down: licenses, regulations, checklists, audits, and violations.</div>
        </CardBody>
      </Card>
    </div>
  );
}
