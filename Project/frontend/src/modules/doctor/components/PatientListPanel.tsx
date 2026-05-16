'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { MyPatient } from '../types/doctor.types';
import { Users } from 'lucide-react';

interface Props { patients: MyPatient[]; }

const statusStyle: Record<string, { dot: string; badge: string }> = {
  active:          { dot: 'bg-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300' },
  critical:        { dot: 'bg-emergency animate-pulse', badge: 'bg-emergency text-white' },
  stable:          { dot: 'bg-success', badge: 'bg-success/20 text-success-light' },
  discharge_ready: { dot: 'bg-teal-400', badge: 'bg-teal-500/20 text-teal-300' },
};
const typeLabel: Record<string, string> = { opd: 'OPD', ipd: 'IPD' };

export function PatientListPanel({ patients }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-400" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">My Patients</h3>
            <p className="text-xs text-gray-400 mt-0.5">{patients.filter(p => p.type === 'opd').length} OPD • {patients.filter(p => p.type === 'ipd').length} IPD</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[700px]">
          <thead className="text-[10px] text-gray-500 uppercase bg-white/[0.02] border-b border-white/[0.04]">
            <tr>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Diagnosis</th>
              <th className="px-4 py-3 font-medium text-center">Type</th>
              <th className="px-4 py-3 font-medium text-center">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {patients.map(p => {
              const s = statusStyle[p.status];
              return (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <div>
                        <span className="text-xs font-semibold text-white">{p.name}</span>
                        <span className="text-[10px] text-gray-500 ml-1">{p.age}{p.gender}</span>
                      </div>
                    </div>
                    {p.allergies.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {p.allergies.map((a, i) => <span key={i} className="text-[9px] text-emergency-light bg-emergency/10 px-1 py-0.5 rounded">⚠ {a}</span>)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300 max-w-[220px] truncate">{p.diagnosis}</td>
                  <td className="px-4 py-3 text-center"><span className="text-[10px] text-gray-400 bg-white/[0.06] px-2 py-0.5 rounded font-mono">{typeLabel[p.type]}</span></td>
                  <td className="px-4 py-3 text-center"><span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${s.badge}`}>{p.status.replace('_', ' ')}</span></td>
                  <td className="px-4 py-3 text-right">
                    {p.pendingActions > 0 && <span className="text-[10px] text-warning-light bg-warning/10 px-1.5 py-0.5 rounded font-bold">{p.pendingActions} pending</span>}
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
