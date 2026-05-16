'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DeptStaff } from '../types/hod.types';
import { UserCog } from 'lucide-react';

interface Props { staff: DeptStaff[]; }

const statusStyle: Record<string, string> = {
  on_duty:  'bg-success/20 text-success-light',
  on_call:  'bg-indigo-500/20 text-indigo-300',
  off_duty: 'bg-white/10 text-gray-400',
  leave:    'bg-white/5 text-gray-500',
};

const roleLabel: Record<string, string> = {
  consultant: 'Consultant', registrar: 'Registrar', resident: 'Resident', nurse: 'Nurse',
};

export function StaffPanel({ staff }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <UserCog className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Staff Allocation</h3>
          <p className="text-xs text-gray-400 mt-0.5">{staff.filter(s => s.status === 'on_duty').length} on duty • {staff.length} total</p>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-2.5">
        {staff.map(s => {
          const loadPct = Math.round((s.activeCases / s.maxCases) * 100);
          return (
            <div key={s.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-white">{s.name}</span>
                  <span className="text-[10px] text-gray-500">{roleLabel[s.role]}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded ${statusStyle[s.status]}`}>{s.status.replace('_', ' ')}</span>
                </div>
                <span className={`text-xs font-black font-mono ${loadPct >= 90 ? 'text-emergency-light' : loadPct >= 70 ? 'text-warning-light' : 'text-success-light'}`}>{s.activeCases}/{s.maxCases}</span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${loadPct >= 90 ? 'bg-emergency' : loadPct >= 70 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${loadPct}%` }} />
              </div>
              <div className="flex gap-x-4 text-[10px] text-gray-500 mt-1">
                <span>Shift: <span className="text-gray-300">{s.shift}</span></span>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
