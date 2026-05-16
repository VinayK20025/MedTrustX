'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Activity, Stethoscope, AlertTriangle, ClipboardCheck, Users, Search, FlaskConical } from 'lucide-react';

export function CMOOutcomesPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Clinical Outcomes" icon={<Stethoscope className="w-5 h-5 text-teal-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Procedure success rates and recovery metrics.</div>
      </CardBody>
    </Card>
  );
}

export function CMOInfectionPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Infection Control" icon={<Activity className="w-5 h-5 text-emerald-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {['CLABSI', 'CAUTI', 'SSI', 'VAP'].map((metric, i) => (
            <div key={i} className="flex justify-between items-center p-3 border border-white/[0.06] rounded-lg bg-surface-dark">
              <span className="text-sm text-white">{metric}</span>
              <Badge variant="success" size="sm">0 Cases</Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export function CMOMortalityPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Mortality Review" icon={<AlertTriangle className="w-5 h-5 text-rose-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">M&M Conference notes and mortality statistics.</div>
      </CardBody>
    </Card>
  );
}

export function CMOAuditPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Case Audits" icon={<Search className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Randomized clinical audits.</div>
      </CardBody>
    </Card>
  );
}

export function CMOCompliancePanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Protocol Compliance" icon={<ClipboardCheck className="w-5 h-5 text-violet-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Clinical guideline adherence rates.</div>
      </CardBody>
    </Card>
  );
}

export function CMODiagnosticsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Diagnostics Oversight" icon={<FlaskConical className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Lab and radiology turnaround times and accuracy.</div>
      </CardBody>
    </Card>
  );
}

export function CMORiskPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="High-Risk Monitoring" icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Patients flagged by predictive AI for deterioration.</div>
      </CardBody>
    </Card>
  );
}
