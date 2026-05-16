'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { NursingStaff } from '../types/nursing.types';
import { Users, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { staff: NursingStaff[]; }

export function NursingStaffPanel({ staff }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Staff Directory</h3>
        </div>
        <span className="text-xs text-gray-400">{staff.filter(s => s.status === 'active').length} Active Now</span>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {staff.map(s => (
          <div key={s.id} className={`p-3 rounded-lg border border-white/[0.06] flex items-center justify-between ${s.status === 'active' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-surface-dark/50 opacity-60'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${s.status === 'active' ? 'bg-success' : s.status === 'break' ? 'bg-warning' : 'bg-gray-500'}`} />
              <div>
                <span className="text-sm font-bold text-white block">{s.name}</span>
                <span className="text-[10px] text-gray-400">{s.role} | Ward: {s.currentWard || 'N/A'}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded block mb-1">{s.shift}</span>
              <span className="text-[9px] text-gray-500">{s.status}</span>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
