'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { ClipboardCheck, Users, Clock, AlertTriangle, Activity, Stethoscope } from 'lucide-react';

export function CNOTasksPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Nursing Tasks" icon={<ClipboardCheck className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Global task completion rate and pending critical tasks.</div>
      </CardBody>
    </Card>
  );
}

export function CNOCarePanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Care Tracking" icon={<Stethoscope className="w-5 h-5 text-teal-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Care plan adherence across all wards.</div>
      </CardBody>
    </Card>
  );
}

export function CNOVitalsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Vitals Monitoring" icon={<Activity className="w-5 h-5 text-rose-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Missed or delayed vitals recording alerts.</div>
      </CardBody>
    </Card>
  );
}

export function CNOStaffingPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Staffing Allocation" icon={<Users className="w-5 h-5 text-emerald-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Nurse-to-patient ratio tracking and allocation.</div>
      </CardBody>
    </Card>
  );
}

export function CNOShiftsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Shift Management" icon={<Clock className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Upcoming shifts, overtime tracking, and handovers.</div>
      </CardBody>
    </Card>
  );
}

export function CNOERPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="ER Nursing" icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Emergency room nursing capacity and triage metrics.</div>
      </CardBody>
    </Card>
  );
}

export function CNOCompliancePanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Missed Care & Compliance" icon={<ClipboardCheck className="w-5 h-5 text-violet-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-10">Omitted care reporting and protocol compliance.</div>
      </CardBody>
    </Card>
  );
}
