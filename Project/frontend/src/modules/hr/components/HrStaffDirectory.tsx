'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { StaffMember } from '../types/hr.types';
import { Users, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { staff: StaffMember[]; }

const statusDot: Record<StaffMember['status'], string> = {
  'On Duty': 'bg-success-500', 'Off Duty': 'bg-gray-500', 'On Leave': 'bg-blue-500', Absent: 'bg-emergency-500',
};

export function HrStaffDirectory({ staff }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-500/15"><Users className="w-3.5 h-3.5 text-blue-400" /></div>
          <h3 className="text-[13px] font-bold text-white tracking-wide">Staff Directory</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input type="text" placeholder="Search by name, role, or dept..." className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-[11px] text-white focus:outline-none focus:border-blue-500/50" />
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {staff.map(s => (
            <div key={s.id} className="p-3 hover:bg-white/[0.015] cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-[12px] font-bold text-gray-300 relative">
                  {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  <span className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0d0d12]", statusDot[s.status])} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-bold text-white truncate">{s.name}</h4>
                  <p className="text-[10px] text-gray-500 font-mono truncate">{s.role} • {s.department}</p>
                </div>
                {s.licenseStatus === 'Expired' && <span className="text-[8px] bg-emergency/20 text-emergency-light px-1.5 py-0.5 rounded font-bold">EXPIRED</span>}
                {s.licenseStatus === 'Expiring Soon' && <span className="text-[8px] bg-warning/20 text-warning-light px-1.5 py-0.5 rounded font-bold">EXPIRING</span>}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
