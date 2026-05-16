'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { MicroserviceNode } from '../types/cto.types';
import { Boxes } from 'lucide-react';

interface ServiceMapPanelProps {
  services: MicroserviceNode[];
}

const statusDot: Record<string, string> = {
  healthy:  'bg-success',
  degraded: 'bg-warning animate-pulse',
  down:     'bg-emergency animate-pulse',
};

const langBadge: Record<string, string> = {
  'Go':      'text-cyan-300 bg-cyan-500/10',
  'Python':  'text-yellow-300 bg-yellow-500/10',
  'Node.js': 'text-green-300 bg-green-500/10',
  'Java':    'text-orange-300 bg-orange-500/10',
};

export function ServiceMapPanel({ services }: ServiceMapPanelProps) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col font-mono">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2 font-sans">
        <Boxes className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Service Health Map</h3>
          <p className="text-xs text-gray-400 mt-0.5">{services.length} microservices • real-time status</p>
        </div>
      </CardHeader>
      
      <CardBody className="p-4 flex-1 overflow-y-auto space-y-2.5">
        {services.map(svc => (
          <div key={svc.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${statusDot[svc.status]}`} />
                <span className="text-sm font-bold text-white">{svc.name}</span>
                <span className="text-[10px] text-gray-500">{svc.version}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${langBadge[svc.language] || 'text-gray-400 bg-white/5'}`}>
                {svc.language}
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-[10px]">
              <div>
                <span className="text-gray-500 block">P99</span>
                <span className={svc.latencyP99 > 150 ? 'text-warning-light font-bold' : 'text-gray-300'}>{svc.latencyP99}ms</span>
              </div>
              <div>
                <span className="text-gray-500 block">Err%</span>
                <span className={svc.errorRate > 0.1 ? 'text-emergency-light font-bold' : 'text-gray-300'}>{svc.errorRate}%</span>
              </div>
              <div>
                <span className="text-gray-500 block">Pods</span>
                <span className="text-gray-300">{svc.replicas}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Deployed</span>
                <span className="text-gray-300">{svc.lastDeployed}</span>
              </div>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-1">
              {svc.dependencies.map(dep => (
                <span key={dep} className="text-[9px] text-indigo-300/60 bg-indigo-500/5 px-1.5 py-0.5 rounded border border-indigo-500/10">
                  → {dep}
                </span>
              ))}
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
