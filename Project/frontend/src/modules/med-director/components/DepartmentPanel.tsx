'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DepartmentPerformance } from '../types/med-director.types';
import { Building2 } from 'lucide-react';

interface Props { departments: DepartmentPerformance[]; }

const statusStyle: Record<string, { badge: string; dot: string }> = {
  optimal:   { badge: 'bg-success/20 text-success-light', dot: 'bg-success' },
  attention: { badge: 'bg-warning/20 text-warning-light', dot: 'bg-warning' },
  critical:  { badge: 'bg-emergency/20 text-emergency-light', dot: 'bg-emergency animate-pulse' },
};

export function DepartmentPanel({ departments }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Department Performance</h3>
          <p className="text-xs text-gray-400 mt-0.5">{departments.length} clinical units monitored</p>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[700px]">
          <thead className="text-[10px] text-gray-500 uppercase bg-white/[0.02] border-b border-white/[0.04]">
            <tr>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium text-right">Mortality</th>
              <th className="px-4 py-3 font-medium text-right">Infection</th>
              <th className="px-4 py-3 font-medium text-right">Readmit</th>
              <th className="px-4 py-3 font-medium text-right">LOS</th>
              <th className="px-4 py-3 font-medium text-right">Occ%</th>
              <th className="px-4 py-3 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {departments.map(dept => {
              const st = statusStyle[dept.status];
              return (
                <tr key={dept.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                      <span className="text-gray-200 font-semibold text-xs">{dept.name}</span>
                      {dept.openIncidents > 0 && (
                        <span className="text-[9px] text-emergency-light bg-emergency/10 px-1 py-0.5 rounded">{dept.openIncidents} incidents</span>
                      )}
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-right text-xs font-mono ${dept.mortalityRate > 3 ? 'text-emergency-light font-bold' : 'text-gray-300'}`}>{dept.mortalityRate}%</td>
                  <td className={`px-4 py-3 text-right text-xs font-mono ${dept.infectionRate > 2 ? 'text-emergency-light font-bold' : dept.infectionRate > 1.5 ? 'text-warning-light' : 'text-gray-300'}`}>{dept.infectionRate}%</td>
                  <td className={`px-4 py-3 text-right text-xs font-mono ${dept.readmissionRate > 5 ? 'text-warning-light' : 'text-gray-300'}`}>{dept.readmissionRate}%</td>
                  <td className="px-4 py-3 text-right text-xs text-gray-300 font-mono">{dept.avgLOS}d</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-10 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${dept.occupancy > 90 ? 'bg-emergency' : dept.occupancy > 75 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${dept.occupancy}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 font-mono">{dept.occupancy}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${st.badge}`}>{dept.status}</span>
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
