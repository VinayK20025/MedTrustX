'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Activity, Bed, Scissors, Users, Stethoscope, AlertTriangle, ClipboardCheck, FileText, Wrench } from 'lucide-react';

export function COOPatientFlowPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Patient Flow Management" icon={<Activity className="w-5 h-5 text-teal-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">End-to-end patient journey tracking.</div>
      </CardBody>
    </Card>
  );
}

export function COOBedsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Bed Management" icon={<Bed className="w-5 h-5 text-emerald-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Real-time bed turnover and availability matrix.</div>
      </CardBody>
    </Card>
  );
}

export function COOQueuePanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Queue Management" icon={<Users className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Outpatient and diagnostic queue lengths.</div>
      </CardBody>
    </Card>
  );
}

export function COONursingPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Nursing Operations" icon={<Stethoscope className="w-5 h-5 text-teal-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Nursing productivity and operational efficiency.</div>
      </CardBody>
    </Card>
  );
}

export function COOOTPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="OT Management" icon={<Scissors className="w-5 h-5 text-rose-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Turnaround times between surgeries.</div>
      </CardBody>
    </Card>
  );
}

export function COOStaffPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Staff Allocation" icon={<Users className="w-5 h-5 text-emerald-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Hospital-wide resource distribution.</div>
      </CardBody>
    </Card>
  );
}

export function COOEquipmentPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Equipment Status" icon={<Wrench className="w-5 h-5 text-violet-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Downtime tracking for MRI, CT, and other heavy assets.</div>
      </CardBody>
    </Card>
  );
}

export function COOAlertsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Bottlenecks & Alerts" icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">System-identified operational bottlenecks.</div>
      </CardBody>
    </Card>
  );
}

export function COOTasksPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Task Execution" icon={<ClipboardCheck className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Key operational tasks and milestones.</div>
      </CardBody>
    </Card>
  );
}

export function COOEscalationsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Escalations" icon={<AlertTriangle className="w-5 h-5 text-rose-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Critical capacity or supply chain escalations.</div>
      </CardBody>
    </Card>
  );
}

export function COOReportsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Operational Reports" icon={<FileText className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Daily operational summaries.</div>
      </CardBody>
    </Card>
  );
}
