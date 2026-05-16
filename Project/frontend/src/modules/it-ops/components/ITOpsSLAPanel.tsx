'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ITOpsSLA } from '../types/itOps.types';
import { Target, TrendingDown } from 'lucide-react';

interface Props { slas: ITOpsSLA[]; }

export function ITOpsSLAPanel({ slas }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-teal-400" />
          <h3 className="text-[15px] font-semibold text-white tracking-wide">SLA Governance</h3>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.04] bg-surface-dark/50">
              <th className="py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-5">Service Level Indicator</th>
              <th className="py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Target</th>
              <th className="py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Actual</th>
              <th className="py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right pr-5">Compliance</th>
            </tr>
          </thead>
          <tbody>
            {slas.map(sla => (
              <tr key={sla.id} className="border-b border-white/[0.02] last:border-0 hover:bg-white/[0.02]">
                <td className="py-4 text-[13px] font-bold text-white pl-5">{sla.service}</td>
                <td className="py-4 text-[12px] font-mono text-gray-400 text-center">{sla.target}</td>
                <td className={`py-4 text-[12px] font-mono font-bold text-center ${
                  sla.status === 'breached' ? 'text-emergency-light' : 
                  sla.status === 'at_risk' ? 'text-warning-light' : 'text-success-light'
                }`}>
                  {sla.actual}
                </td>
                <td className="py-4 text-right pr-5">
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded tracking-widest inline-flex items-center gap-1 ${
                    sla.status === 'breached' ? 'bg-emergency/20 text-emergency-light' : 
                    sla.status === 'at_risk' ? 'bg-warning/20 text-warning-light' : 'bg-success/20 text-success-light'
                  }`}>
                    {sla.status === 'breached' && <TrendingDown className="w-3 h-3" />}
                    {sla.status.replace('_', ' ')}
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
