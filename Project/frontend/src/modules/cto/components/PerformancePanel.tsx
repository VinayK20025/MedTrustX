'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PerformanceMetric } from '../types/cto.types';
import { Gauge } from 'lucide-react';

interface PerformancePanelProps {
  metrics: PerformanceMetric[];
}

export function PerformancePanel({ metrics }: PerformancePanelProps) {
  const getLatencyColor = (val: number) => val > 150 ? 'text-emergency-light' : val > 80 ? 'text-warning-light' : 'text-success-light';
  const getErrorColor = (val: number) => val > 0.1 ? 'text-emergency-light' : val > 0.05 ? 'text-warning-light' : 'text-success-light';
  const getSatColor = (val: number) => val > 70 ? 'text-emergency-light' : val > 50 ? 'text-warning-light' : 'text-success-light';

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col font-mono">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2 font-sans">
        <Gauge className="w-5 h-5 text-teal-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Performance (RED)</h3>
          <p className="text-xs text-gray-400 mt-0.5">Rate • Errors • Duration per service</p>
        </div>
      </CardHeader>
      
      <CardBody className="p-0 flex-1 overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[600px]">
          <thead className="text-[10px] text-gray-500 uppercase bg-white/[0.02] border-b border-white/[0.04]">
            <tr>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium text-right">P50</th>
              <th className="px-4 py-3 font-medium text-right">P99</th>
              <th className="px-4 py-3 font-medium text-right">RPS</th>
              <th className="px-4 py-3 font-medium text-right">Err%</th>
              <th className="px-4 py-3 font-medium text-right">Sat%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {metrics.map(m => (
              <tr key={m.service} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-gray-200 font-bold text-xs">{m.service}</td>
                <td className="px-4 py-3 text-right text-xs text-gray-400">{m.latencyP50}ms</td>
                <td className={`px-4 py-3 text-right text-xs font-bold ${getLatencyColor(m.latencyP99)}`}>{m.latencyP99}ms</td>
                <td className="px-4 py-3 text-right text-xs text-gray-300">{m.throughput}</td>
                <td className={`px-4 py-3 text-right text-xs font-bold ${getErrorColor(m.errorRate)}`}>{m.errorRate}%</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-12 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${m.saturation > 70 ? 'bg-emergency' : m.saturation > 50 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${m.saturation}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${getSatColor(m.saturation)}`}>{m.saturation}%</span>
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
