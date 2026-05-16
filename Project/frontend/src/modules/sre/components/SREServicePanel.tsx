'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { SREService } from '../types/sre.types';
import { Server, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface Props { services: SREService[]; }

export function SREServicePanel({ services }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-400" />
          <h3 className="text-[15px] font-semibold text-white tracking-wide">Service Registry</h3>
        </div>
      </CardHeader>
      <CardBody className="p-3 flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2">Service</th>
              <th className="py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Uptime</th>
              <th className="py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Latency</th>
              <th className="py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right pr-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {services.map(item => (
              <tr key={item.id} className="border-b border-white/[0.02] last:border-0 hover:bg-white/[0.02]">
                <td className="py-3 text-[13px] font-bold text-white pl-2">{item.name}</td>
                <td className="py-3 text-[12px] font-mono text-gray-300">{item.uptime}</td>
                <td className="py-3 text-[12px] font-mono text-gray-300">{item.latency}</td>
                <td className="py-3 text-right pr-2">
                  <div className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded tracking-widest ${
                    item.status === 'healthy' ? 'bg-success/20 text-success-light' :
                    item.status === 'degraded' ? 'bg-warning/20 text-warning-light' :
                    'bg-emergency/20 text-emergency-light'
                  }`}>
                    {item.status === 'healthy' && <CheckCircle2 className="w-3 h-3" />}
                    {item.status === 'degraded' && <AlertTriangle className="w-3 h-3" />}
                    {item.status === 'down' && <XCircle className="w-3 h-3" />}
                    {item.status}
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
