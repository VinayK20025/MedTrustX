'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DeputyStaff } from '../types/deputy.types';
import { Users, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { staff: DeputyStaff[]; }

export function DeputyStaffPanel({ staff }: Props) {
  return (
    <Card className="border-teal-500/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-teal-500/20 px-5 py-4 flex items-center justify-between bg-teal-500/5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Available Reserve</h3>
        </div>
        <span className="text-xs text-teal-300">{staff.filter(s => s.status === 'free').length} Ready</span>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {staff.map(s => (
          <div key={s.id} className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-white block">{s.name}</span>
              <span className="text-[10px] text-gray-400">{s.role} | {s.currentLocation}</span>
            </div>
            {s.status === 'free' ? (
              <Button size="sm" className="h-7 px-3 text-[10px] bg-teal-600 hover:bg-teal-700 text-white border-none flex items-center gap-1">
                <LogIn className="w-3 h-3" /> Assign
              </Button>
            ) : (
              <span className="text-[9px] uppercase tracking-widest text-gray-500">{s.status}</span>
            )}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
