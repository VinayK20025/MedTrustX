'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DepartmentPerformance } from '../types/admin.types';
import { Activity, Clock, Users } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { departments: DepartmentPerformance[]; }

export function AdminDepartmentPerformancePanel({ departments }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-emerald-400">DEPARTMENT PERFORMANCE</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <table className="w-full text-left text-[12px] text-gray-300">
          <thead className="bg-black/20 text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5 sticky top-0">
            <tr>
              <th className="px-5 py-3 font-bold">Department</th>
              <th className="px-5 py-3 font-bold">Throughput (24h)</th>
              <th className="px-5 py-3 font-bold">Avg Wait</th>
              <th className="px-5 py-3 font-bold">Efficiency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {departments.map((dept) => (
              <tr key={dept.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-white">{dept.name}</span>
                    <span className={cn("text-[10px] w-max px-1.5 py-0.5 rounded", 
                      dept.status === 'Optimal' ? 'bg-success/10 text-success-light' : 
                      dept.status === 'Degraded' ? 'bg-warning/10 text-warning-light' : 'bg-emergency/10 text-emergency-light'
                    )}>
                      {dept.status}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 font-mono text-[13px]">
                   <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-500"/> {dept.patientThroughput}</span>
                </td>
                <td className="px-5 py-4 font-mono text-[13px]">
                   <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-500"/> {dept.avgWaitTime}</span>
                </td>
                <td className="px-5 py-4">
                   <div className="flex items-center gap-2">
                     <span className={cn("font-mono font-bold text-[13px]", dept.efficiencyScore < 80 ? "text-warning-light" : "text-success-light")}>{dept.efficiencyScore}%</span>
                     {dept.activeIssues > 0 && <span className="bg-emergency-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{dept.activeIssues} issue</span>}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
