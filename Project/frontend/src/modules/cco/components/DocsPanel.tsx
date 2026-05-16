'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DocComplianceItem } from '../types/cco.types';
import { FileCheck } from 'lucide-react';

interface DocsPanelProps {
  items: DocComplianceItem[];
}

export function DocsPanel({ items }: DocsPanelProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-success/20 text-success-light';
      case 'partial':  return 'bg-warning/20 text-warning-light';
      case 'overdue':  return 'bg-emergency/20 text-emergency-light';
      default: return 'bg-white/10 text-gray-300';
    }
  };

  const getBarColor = (rate: number) => {
    if (rate >= 98) return 'bg-success';
    if (rate >= 90) return 'bg-warning';
    return 'bg-emergency';
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <FileCheck className="w-5 h-5 text-success-light" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Documentation Status</h3>
          <p className="text-xs text-gray-400 mt-0.5">Record completeness by category</p>
        </div>
      </CardHeader>
      
      <CardBody className="p-0 flex-1 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-gray-500 uppercase bg-white/[0.02] border-b border-white/[0.04]">
            <tr>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium text-center">Completed</th>
              <th className="px-4 py-3 font-medium text-center">Rate</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-gray-200 font-medium text-xs">{item.category}</td>
                <td className="px-4 py-3 text-center text-xs text-gray-400 font-mono">
                  {item.totalCompleted}/{item.totalRequired}
                </td>
                <td className={`px-4 py-3 text-center text-xs font-bold font-mono ${item.completionRate >= 98 ? 'text-success-light' : item.completionRate >= 90 ? 'text-warning-light' : 'text-emergency-light'}`}>
                  {item.completionRate}%
                </td>
                <td className="px-4 py-3">
                  <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden min-w-[80px]">
                    <div className={`h-full rounded-full ${getBarColor(item.completionRate)}`} style={{ width: `${item.completionRate}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${getStatusStyle(item.status)}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
