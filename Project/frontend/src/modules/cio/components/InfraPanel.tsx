'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { InfraNode } from '../types/cio.types';
import { Cpu, HardDrive, Database, ServerCrash } from 'lucide-react';

interface InfraPanelProps {
  nodes: InfraNode[];
}

export function InfraPanel({ nodes }: InfraPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'compute': return <Cpu className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'storage': return <HardDrive className="w-4 h-4" />;
      default: return <ServerCrash className="w-4 h-4" />;
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'bg-emergency';
    if (usage >= 75) return 'bg-warning';
    return 'bg-indigo-500';
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col font-mono">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 font-sans">
        <h3 className="text-lg font-semibold text-white tracking-wide">Infrastructure Load</h3>
        <p className="text-xs text-gray-400 mt-0.5">Real-time compute & memory pressure</p>
      </CardHeader>
      
      <CardBody className="p-4 flex-1 overflow-y-auto space-y-4">
        {nodes.map(node => (
          <div key={node.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-300">
                {getIcon(node.type)}
                <span className="text-sm font-semibold">{node.name}</span>
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                node.status === 'critical' ? 'bg-emergency/20 text-emergency-light' : 
                node.status === 'warning' ? 'bg-warning/20 text-warning-light' : 
                'bg-success/20 text-success-light'
              }`}>
                {node.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">CPU</span>
                  <span className="text-white">{node.cpuUsage}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${getUsageColor(node.cpuUsage)}`} style={{ width: `${node.cpuUsage}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">MEM</span>
                  <span className="text-white">{node.memUsage}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${getUsageColor(node.memUsage)}`} style={{ width: `${node.memUsage}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
