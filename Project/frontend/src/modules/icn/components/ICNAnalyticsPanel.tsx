'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ICNAnalytics } from '../types/icn.types';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props { analytics: ICNAnalytics[]; }

export function ICNAnalyticsPanel({ analytics }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-teal-400" />
          <h3 className="text-[15px] font-semibold text-white tracking-wide">Ward Analytics</h3>
        </div>
      </CardHeader>
      <CardBody className="p-3 flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2">Ward</th>
              <th className="py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Infection Rate</th>
              <th className="py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Hygiene</th>
              <th className="py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right pr-2">Trend</th>
            </tr>
          </thead>
          <tbody>
            {analytics.map((item, idx) => (
              <tr key={idx} className="border-b border-white/[0.02] last:border-0 hover:bg-white/[0.02]">
                <td className="py-3 text-[13px] font-medium text-white pl-2">{item.ward}</td>
                <td className={`py-3 text-[13px] font-mono text-center font-bold ${item.infectionRate > 3 ? 'text-emergency-light' : 'text-gray-300'}`}>
                  {item.infectionRate}%
                </td>
                <td className={`py-3 text-[13px] font-mono text-center font-bold ${item.handHygieneCompliance < 90 ? 'text-warning-light' : 'text-success-light'}`}>
                  {item.handHygieneCompliance}%
                </td>
                <td className="py-3 text-right pr-2 flex justify-end">
                  {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-emergency-light" />}
                  {item.trend === 'down' && <TrendingDown className="w-4 h-4 text-success-light" />}
                  {item.trend === 'stable' && <Minus className="w-4 h-4 text-gray-500" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
