'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, Bed, Stethoscope, ClipboardCheck, FileText, Scissors } from 'lucide-react';

export function CEOTasksPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="CEO Task Center" icon={<ClipboardCheck className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Strategic tasks and approvals will appear here.</div>
      </CardBody>
    </Card>
  );
}

export function CEOBedsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Hospital Bed Capacity" icon={<Bed className="w-5 h-5 text-emerald-400" />} subtitle="Overall occupancy 88%" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {['ICU', 'General Wards', 'Emergency', 'Surgical Wards'].map((unit, i) => (
            <div key={i} className="flex justify-between items-center p-3 border border-white/[0.06] rounded-lg bg-surface-dark">
              <span className="text-sm text-white">{unit}</span>
              <Badge variant={i === 0 ? 'danger' : 'success'} size="sm">{i === 0 ? '95% Full' : 'Available'}</Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export function CEOOTPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="OT Utilization" icon={<Scissors className="w-5 h-5 text-rose-400" />} subtitle="Active surgeries" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Real-time OT tracking and block utilization.</div>
      </CardBody>
    </Card>
  );
}

export function CEOClinicalPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Clinical Performance" icon={<Stethoscope className="w-5 h-5 text-teal-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {['Mortality Rate', 'Readmission Rate', 'ALOS', 'Patient Satisfaction'].map((metric, i) => (
            <div key={i} className="flex justify-between items-center p-3 border border-white/[0.06] rounded-lg bg-surface-dark">
              <span className="text-sm text-white">{metric}</span>
              <span className="text-sm font-mono text-teal-400">On Target</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export function CEOCompliancePanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Risk & Compliance" icon={<ClipboardCheck className="w-5 h-5 text-violet-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">JCI and NABH compliance metrics overview.</div>
      </CardBody>
    </Card>
  );
}

export function CEOEscalationsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Executive Escalations" icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Critical issues escalated to CEO.</div>
      </CardBody>
    </Card>
  );
}

export function CEOReportsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Executive Reports" icon={<FileText className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Automated board reports and forecasting models.</div>
      </CardBody>
    </Card>
  );
}
