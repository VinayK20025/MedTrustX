'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { DollarSign, Stethoscope, Activity, ClipboardCheck, FileText, Search, ShieldCheck } from 'lucide-react';

export function BoardFinancialPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Financial Performance" icon={<DollarSign className="w-5 h-5 text-emerald-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">EBITDA, Revenue, and Margin trends.</div>
      </CardBody>
    </Card>
  );
}

export function BoardClinicalPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Clinical Quality" icon={<Stethoscope className="w-5 h-5 text-teal-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Aggregate patient safety scores.</div>
      </CardBody>
    </Card>
  );
}

export function BoardOperationsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Operational Efficiency" icon={<Activity className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Asset utilization and expansion plans.</div>
      </CardBody>
    </Card>
  );
}

export function BoardCompliancePanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Regulatory Compliance" icon={<ClipboardCheck className="w-5 h-5 text-violet-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Accreditation status and legal risks.</div>
      </CardBody>
    </Card>
  );
}

export function BoardReportsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Board Reports" icon={<FileText className="w-5 h-5 text-amber-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Quarterly investor and management reports.</div>
      </CardBody>
    </Card>
  );
}

export function BoardAuditPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Audit & Risk" icon={<Search className="w-5 h-5 text-rose-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Internal audit findings and remediation.</div>
      </CardBody>
    </Card>
  );
}

export function BoardAccessPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="IAM & Security" icon={<ShieldCheck className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Zero-trust architecture compliance overview.</div>
      </CardBody>
    </Card>
  );
}
