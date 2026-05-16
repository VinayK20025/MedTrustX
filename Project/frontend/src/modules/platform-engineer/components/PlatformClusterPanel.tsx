'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { K8sCluster, K8sNode } from '../types/platform.types';
import { Network, Server } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { clusters: K8sCluster[]; nodes: K8sNode[]; }

export function PlatformClusterPanel({ clusters, nodes }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><Network className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Cluster Topology</h3>
        </div>
      </CardHeader>

      <CardBody className="p-4 flex-1 overflow-y-auto max-h-[400px]">
        <div className="space-y-6">
          {clusters.map(cluster => {
            const clusterNodes = nodes.filter(n => n.clusterId === cluster.id);
            return (
              <div key={cluster.id} className="border border-white/5 rounded-xl bg-surface-dark overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                  <div>
                    <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                      {cluster.name}
                    </h4>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] text-gray-500 font-mono">K8s {cluster.version}</span>
                      <span className="text-[10px] text-gray-500 font-mono">| {cluster.environment}</span>
                    </div>
                  </div>
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                    cluster.status === 'Healthy' ? 'bg-success/20 text-success-light' : 'bg-emergency/20 text-emergency-light'
                  )}>
                    {cluster.status}
                  </span>
                </div>
                
                <div className="p-4">
                  <h5 className="text-[10px] uppercase font-bold text-gray-500 mb-3 tracking-widest">Node Topology ({cluster.nodes.ready}/{cluster.nodes.total} Ready)</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clusterNodes.map(node => (
                      <div key={node.id} className="bg-white/5 p-3 rounded border border-white/5 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[11px] font-mono text-gray-300 flex items-center gap-1.5"><Server className="w-3 h-3 text-indigo-400"/> {node.name.split('.')[0]}</span>
                          <div className={cn("w-2 h-2 rounded-full", node.status === 'Ready' ? "bg-success-light" : "bg-emergency-light")} />
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-bold">
                          <span className={cn(node.role === 'Control Plane' ? 'text-purple-400' : 'text-gray-500')}>{node.role}</span>
                          <span className="text-gray-400">CPU: <span className={node.cpuUsage > 80 ? 'text-warning-light' : 'text-white'}>{node.cpuUsage}%</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
