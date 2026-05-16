'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { UnitStaff } from '../types/unit-head.types';
import { UserCog } from 'lucide-react';

interface Props { staff: UnitStaff[]; }

const statusStyle: Record<string, string> = {
  on_duty: 'bg-success/20 text-success-light',
  on_call: 'bg-indigo-500/20 text-indigo-300',
  break:   'bg-warning/20 text-warning-light',
};
const roleLabel: Record<string, string> = {
  intensivist: 'Intensivist', registrar: 'Registrar', nurse: 'Nurse', respiratory_therapist: 'RT',
};

export function UnitStaffPanel({ staff }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <UserCog className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Staff On Duty</h3>
          <p className="text-xs text-gray-400 mt-0.5">{staff.filter(s => s.status === 'on_duty').length} active</p>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-2">
        {staff.map(s => (
          <div key={s.id} className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-white">{s.name}</span>
              <span className="text-[10px] text-gray-500">{roleLabel[s.role]}</span>
              <span className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded ${statusStyle[s.status]}`}>{s.status.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-1">
              {s.assignedBeds.map(b => (
                <span key={b} className="text-[9px] text-gray-400 bg-white/[0.04] px-1 py-0.5 rounded font-mono">{b}</span>
              ))}
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
