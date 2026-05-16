'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DeptPatient } from '../types/hod.types';
import { Users } from 'lucide-react';

interface Props { patients: DeptPatient[]; }

const acuityStyle: Record<string, { badge: string; dot: string }> = {
  critical: { badge: 'bg-emergency text-white', dot: 'bg-emergency animate-pulse' },
  high:     { badge: 'bg-emergency/20 text-emergency-light', dot: 'bg-emergency' },
  moderate: { badge: 'bg-warning/20 text-warning-light', dot: 'bg-warning' },
  stable:   { badge: 'bg-success/20 text-success-light', dot: 'bg-success' },
};

export function PatientPanel({ patients }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-400" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Active Patients</h3>
            <p className="text-xs text-gray-400 mt-0.5">{patients.length} in department</p>
          </div>
        </div>
        <span className="text-xs text-emergency-light bg-emergency/10 px-2 py-1 rounded-full border border-emergency/20 font-bold">
          {patients.filter(p => p.acuity === 'critical').length} critical
        </span>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[750px]">
          <thead className="text-[10px] text-gray-500 uppercase bg-white/[0.02] border-b border-white/[0.04]">
            <tr>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Diagnosis</th>
              <th className="px-4 py-3 font-medium">Doctor</th>
              <th className="px-4 py-3 font-medium text-center">Acuity</th>
              <th className="px-4 py-3 font-medium text-right">LOS</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {patients.map(p => {
              const a = acuityStyle[p.acuity];
              return (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${a.dot}`} />
                      <div>
                        <span className="text-xs font-semibold text-white">{p.name}</span>
                        <span className="text-[10px] text-gray-500 ml-1">{p.age}{p.gender} • {p.bed}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300 max-w-[200px] truncate">{p.diagnosis}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{p.attendingDoctor}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${a.badge}`}>{p.acuity}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-mono text-gray-300">{p.los}d</td>
                  <td className="px-4 py-3 text-right">
                    {p.pendingActions.length > 0 && (
                      <span className="text-[10px] text-warning-light bg-warning/10 px-1.5 py-0.5 rounded">{p.pendingActions.length} pending</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
