'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { AlertTriangle, FileText, ClipboardCheck, Bed, Activity, Scissors, Users, ShieldAlert } from 'lucide-react';

export function SuperAlertsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Critical Alerts" icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Facility-wide critical alerts.</div>
      </CardBody>
    </Card>
  );
}

export function SuperReportsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Daily Reports" icon={<FileText className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Consolidated morning reports.</div>
      </CardBody>
    </Card>
  );
}

export function SuperTasksPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Task Management" icon={<ClipboardCheck className="w-5 h-5 text-teal-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Delegated tasks to ward managers.</div>
      </CardBody>
    </Card>
  );
}

export function SuperWardsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Ward Management" icon={<Bed className="w-5 h-5 text-emerald-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Ward readiness and capacity overview.</div>
      </CardBody>
    </Card>
  );
}

export function SuperIncidentsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Incidents & Complaints" icon={<ShieldAlert className="w-5 h-5 text-rose-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Patient grievances and safety incidents.</div>
      </CardBody>
    </Card>
  );
}

export function SuperPatientFlowPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Admissions & Discharges" icon={<Activity className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Tracking admission delays.</div>
      </CardBody>
    </Card>
  );
}

export function SuperOTPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="OT Coordination" icon={<Scissors className="w-5 h-5 text-violet-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Surgical block schedule compliance.</div>
      </CardBody>
    </Card>
  );
}

export function SuperStaffPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Staff Coordination" icon={<Users className="w-5 h-5 text-emerald-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Roster fulfillment rates.</div>
      </CardBody>
    </Card>
  );
}
