'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { WardStaff } from '../types/ward.types';
import { Users, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { staff: WardStaff[]; }

export function WardStaffPanel({ staff }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Nursing Staff</h3>
        </div>
        <span className="text-xs text-gray-400">{staff.filter(s => s.status === 'active').length} Active</span>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {staff.map(s => (
          <div key={s.id} className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${s.status === 'active' ? 'bg-success' : s.status === 'busy' ? 'bg-warning' : 'bg-gray-500'}`} />
              <div>
                <span className="text-sm font-bold text-white block">{s.name}</span>
                <span className="text-[10px] text-gray-400">{s.role}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-300 block mb-1">Load: {s.patientLoad}</span>
              <Button size="sm" variant="outline" className="h-6 px-2 text-[9px]">Assign</Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
