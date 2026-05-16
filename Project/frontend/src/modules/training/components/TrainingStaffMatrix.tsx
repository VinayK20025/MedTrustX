'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { StaffTrainingRecord } from '../types/training.types';
import { Users, CheckCircle2, Circle, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { records: StaffTrainingRecord[]; }

const statusCfg: Record<StaffTrainingRecord['status'], { icon: React.ReactNode; color: string; bg: string }> = {
  Completed:   { icon: <CheckCircle2 className="w-4 h-4 text-success-light" />, color: 'text-success-light', bg: 'bg-success/10' },
  'In Progress': { icon: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />, color: 'text-blue-300', bg: 'bg-blue-500/10' },
  'Not Started': { icon: <Circle className="w-4 h-4 text-gray-500" />, color: 'text-gray-400', bg: 'bg-white/5' },
  Overdue:       { icon: <AlertTriangle className="w-4 h-4 text-emergency-light" />, color: 'text-emergency-light', bg: 'bg-emergency/10' },
};

export function TrainingStaffMatrix({ records }: Props) {
  return (
    <Card className="border-indigo-500/25 shadow-glass bg-[#040614] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><Users className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Staff Training Matrix</h3>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-black/30 text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5 sticky top-0 z-10">
            <tr>
              <th className="px-5 py-3">Staff</th>
              <th className="px-5 py-3">Course</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Cert Expiry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {records.map(r => {
              const cfg = statusCfg[r.status];
              return (
                <tr key={r.id} className={cn("hover:bg-white/[0.02] transition-colors", r.status === 'Overdue' && "bg-emergency/[0.03]")}>
                  <td className="px-5 py-3">
                    <span className="font-bold text-white block">{r.staffName}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{r.role} • {r.department}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-300 font-mono">{r.courseName}</td>
                  <td className="px-5 py-3">
                    <span className={cn("flex items-center gap-1.5 text-[11px] font-bold", cfg.color)}>
                      {cfg.icon} {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px]">
                    {r.certDaysRemaining !== undefined ? (
                      <span className={cn(r.certDaysRemaining < 0 ? "text-emergency-light" : r.certDaysRemaining < 30 ? "text-warning-light" : "text-gray-400")}>
                        {r.certDaysRemaining < 0 ? `Expired ${Math.abs(r.certDaysRemaining)}d ago` : `${r.certDaysRemaining}d left`}
                      </span>
                    ) : <span className="text-gray-600">—</span>}
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
