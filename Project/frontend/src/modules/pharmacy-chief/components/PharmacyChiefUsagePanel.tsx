'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DrugUsageMetric } from '../types/pharmacyChief.types';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { metrics: DrugUsageMetric[]; }

export function PharmacyChiefUsagePanel({ metrics }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/15"><Activity className="w-4 h-4 text-emerald-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Usage Analytics</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-black/20 text-gray-400 font-mono text-[10px] uppercase">
            <tr>
              <th className="px-5 py-3">Dept / Drug</th>
              <th className="px-5 py-3 text-right">Consumption</th>
              <th className="px-5 py-3 text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {metrics.map((m, idx) => (
              <tr key={idx} className="hover:bg-white/[0.015] transition-colors">
                <td className="px-5 py-3">
                  <p className="font-bold text-white">{m.drugName}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{m.department}</p>
                </td>
                <td className="px-5 py-3 text-right">
                  <p className="text-[13px] font-mono text-white">{m.quantityConsumed} units</p>
                  <div className={cn("flex items-center justify-end gap-1 text-[10px] font-bold mt-1", m.trendPercentage > 0 ? "text-emergency-light" : "text-emerald-400")}>
                    {m.trendPercentage > 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                    {Math.abs(m.trendPercentage)}% vs last mo
                  </div>
                </td>
                <td className="px-5 py-3 text-right font-mono text-gray-300">
                  ${m.costIncurred.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
