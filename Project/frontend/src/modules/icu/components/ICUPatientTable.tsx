'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ICUPatient } from '../types/icu.types';

const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  stable: 'success',
  warning: 'warning',
  critical: 'danger',
};

export function ICUPatientTable({ patients }: { patients: ICUPatient[] }) {
  return (
    <Card className="h-full">
      <CardHeader title="ICU Patient Grid" subtitle="Live bedside telemetry" />
      <CardBody className="p-0">
        <div className="divide-y divide-white/[0.06]">
          {patients.map((p) => (
            <div key={p.id} className="px-5 py-4 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.bed} · {p.diagnosis}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[p.status]} size="sm" dot>{p.status}</Badge>
                  <Badge variant="outline" size="sm">Alerts: {p.activeAlerts}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-gray-400">
                <span>HR: <span className="text-white">{p.vitals.hr}</span></span>
                <span>BP: <span className="text-white">{p.vitals.bp}</span></span>
                <span>SpO2: <span className="text-white">{p.vitals.spo2}%</span></span>
                <span>Resp: <span className="text-white">{p.vitals.resp}</span></span>
                <span>Temp: <span className="text-white">{p.vitals.temp} C</span></span>
              </div>
              <p className="text-2xs text-gray-600">Updated {new Date(p.lastUpdated).toLocaleTimeString()}</p>
            </div>
          ))}
          {patients.length === 0 && (
            <div className="px-5 py-10 text-sm text-gray-500 text-center">No ICU patients available.</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
