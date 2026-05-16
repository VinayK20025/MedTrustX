'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { TrafficFlowLog } from '../types/network.types';
import { Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { flows: TrafficFlowLog[]; }

export function NetworkTrafficPanel({ flows }: Props) {
  return (
    <Card className="border-emerald-500/30 shadow-glass bg-[#0a0a0a] h-full flex flex-col font-mono relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 animate-pulse" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-gray-400">VPC FLOW LOGS (LIVE INGEST)</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold tracking-wider">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          SNIFFING
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[10px] text-gray-500 bg-black/40">
              <th className="p-3 font-medium">TIMESTAMP</th>
              <th className="p-3 font-medium">SOURCE IP</th>
              <th className="p-3 font-medium">DESTINATION IP</th>
              <th className="p-3 font-medium">PORT</th>
              <th className="p-3 font-medium">ACTION</th>
              <th className="p-3 font-medium text-right">BYTES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[11px] text-gray-300">
            {flows.map(flow => (
              <tr key={flow.id} className={cn("hover:bg-white/5 transition-colors", flow.action === 'REJECT' || flow.action === 'DROP' ? 'bg-emergency/5' : '')}>
                <td className="p-3 text-gray-500">{new Date(flow.timestamp).toISOString().split('T')[1].replace('Z', '')}</td>
                <td className="p-3 text-blue-400">{flow.sourceIp}</td>
                <td className="p-3 text-emerald-400">{flow.destinationIp}</td>
                <td className="p-3">{flow.port}/{flow.protocol}</td>
                <td className="p-3">
                  <span className={cn('px-1.5 py-0.5 rounded font-bold text-[9px]', 
                    flow.action === 'ACCEPT' ? 'bg-success/20 text-success-light' : 'bg-emergency/20 text-emergency-light'
                  )}>{flow.action}</span>
                </td>
                <td className="p-3 text-right">{flow.bytesTransferred}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
