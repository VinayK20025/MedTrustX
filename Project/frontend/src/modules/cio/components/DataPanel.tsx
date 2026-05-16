'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DataPipeline } from '../types/cio.types';
import { Network, PlayCircle, XCircle, CheckCircle2 } from 'lucide-react';

interface DataPanelProps {
  pipelines: DataPipeline[];
}

export function DataPanel({ pipelines }: DataPanelProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-success-light" />;
      case 'running': return <PlayCircle className="w-4 h-4 text-indigo-400 animate-pulse" />;
      case 'failed': return <XCircle className="w-4 h-4 text-emergency-light" />;
      default: return null;
    }
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col font-mono">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 font-sans flex items-center gap-2">
        <Network className="w-4 h-4 text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Data Pipelines</h3>
          <p className="text-xs text-gray-400 mt-0.5">ETL & Integration Status</p>
        </div>
      </CardHeader>
      
      <CardBody className="p-4 flex-1 overflow-y-auto space-y-3">
        {pipelines.map(pipeline => (
          <div key={pipeline.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-lg flex items-center justify-between hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3">
              {getStatusIcon(pipeline.status)}
              <div>
                <p className="text-sm text-gray-200 font-semibold">{pipeline.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Last Run: {new Date(pipeline.lastRun).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">{pipeline.recordsProcessed.toLocaleString()}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Records</p>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
