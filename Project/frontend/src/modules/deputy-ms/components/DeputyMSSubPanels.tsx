'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { AlertTriangle, Bed, ShieldAlert, Scissors, Activity, FileText, Users, ClipboardCheck } from 'lucide-react';

export function DeputyAlertsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Active Alerts" icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Operational alerts for the Deputy MS.</div>
      </CardBody>
    </Card>
  );
}

export function DeputyBedsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Bed Allocation" icon={<Bed className="w-5 h-5 text-emerald-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Managing VIP and critical bed requests.</div>
      </CardBody>
    </Card>
  );
}

export function DeputyIncidentsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Incidents" icon={<ShieldAlert className="w-5 h-5 text-rose-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Medication errors or fall incident reports.</div>
      </CardBody>
    </Card>
  );
}

export function DeputyOTPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="OT Optimization" icon={<Scissors className="w-5 h-5 text-violet-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Theater utilization metrics.</div>
      </CardBody>
    </Card>
  );
}

export function DeputyPatientFlowPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Patient Flow" icon={<Activity className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Resolving admission bottlenecks.</div>
      </CardBody>
    </Card>
  );
}

export function DeputyReportsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Reports" icon={<FileText className="w-5 h-5 text-teal-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Shift summaries and handovers.</div>
      </CardBody>
    </Card>
  );
}

export function DeputyStaffPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Staff Issues" icon={<Users className="w-5 h-5 text-emerald-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Managing absenteeism and coverage.</div>
      </CardBody>
    </Card>
  );
}

export function DeputyTasksPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Tasks" icon={<ClipboardCheck className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Action items for the shift.</div>
      </CardBody>
    </Card>
  );
}

export function DeputyWardsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Ward Rounds" icon={<Bed className="w-5 h-5 text-teal-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Inspection notes from ward rounds.</div>
      </CardBody>
    </Card>
  );
}
