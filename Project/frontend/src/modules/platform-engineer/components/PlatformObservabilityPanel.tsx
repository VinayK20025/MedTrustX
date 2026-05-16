'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PlatformMetric } from '../types/platform.types';
import { Activity } from 'lucide-react';

interface Props { metrics: PlatformMetric[]; }

export function PlatformObservabilityPanel({ metrics }: Props) {
  return (
    <Card className="border-indigo-500/30 shadow-glass bg-[#0a0a0a] h-full flex flex-col font-mono relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 animate-pulse" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-gray-400">CLUSTER METRICS (PROMETHEUS)</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold tracking-wider">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          LIVE SCRAPE
        </div>
      </CardHeader>

      <CardBody className="p-4 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4">
          {metrics.map(metric => (
            <div key={metric.clusterId} className="bg-[#111] p-4 rounded-lg border border-white/10">
              <div className="flex justify-between items-start border-b border-white/5 pb-2 mb-3">
                <h4 className="text-[12px] font-bold text-white">{metric.clusterId}</h4>
                <span className="text-[9px] text-gray-500">Scrape: {new Date(metric.timestamp).toLocaleTimeString()}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                <div className="bg-black p-2 rounded">
                  <span className="text-gray-500 block">CPU Util</span>
                  <span className="text-[16px] text-blue-400">{metric.cpuUtilization}%</span>
                </div>
                <div className="bg-black p-2 rounded">
                  <span className="text-gray-500 block">Memory Util</span>
                  <span className="text-[16px] text-teal-400">{metric.memoryUtilization}%</span>
                </div>
                <div className="bg-black p-2 rounded">
                  <span className="text-gray-500 block">Network IN/OUT</span>
                  <span className="text-[14px] text-purple-400">{metric.networkIngress}/{metric.networkEgress} Mb/s</span>
                </div>
                <div className="bg-black p-2 rounded">
                  <span className="text-gray-500 block">API Latency (p99)</span>
                  <span className="text-[16px] text-yellow-400">{metric.apiLatency}ms</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
