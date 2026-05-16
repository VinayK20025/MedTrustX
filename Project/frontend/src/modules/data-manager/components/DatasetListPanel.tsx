'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { TrialDataset } from '../types/data-manager.types';
import { useLockDataset, useRunValidation } from '../hooks/useDataMgrAnalytics';
import { Database, Lock, AlertCircle, Play } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { datasets: TrialDataset[]; selectedId?: string; onSelect: (id: string) => void; }

export function DatasetListPanel({ datasets, selectedId, onSelect }: Props) {
  const { mutate: lockDs } = useLockDataset();
  const { mutate: runValidation } = useRunValidation();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-violet-400" /> Datasets
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{datasets.length} Sets</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {datasets.map(ds => (
            <div key={ds.id} onClick={() => onSelect(ds.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                ds.status === 'Locked' ? 'border-gray-500 bg-gray-500/[0.04]' :
                ds.errorCount > 20 ? 'border-emergency bg-emergency/[0.04]' : 'border-violet-500 bg-violet-500/[0.04]',
                selectedId === ds.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-400">{ds.id}</span>
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider flex items-center gap-1',
                  ds.status === 'Locked' ? 'bg-gray-500/15 text-gray-300' :
                  ds.status === 'Submitted' ? 'bg-success/15 text-success-light' : 'bg-violet-500/15 text-violet-300'
                )}>
                  {ds.status === 'Locked' && <Lock className="w-2.5 h-2.5" />}
                  {ds.status}
                </span>
              </div>
              
              <h4 className="text-[13px] font-bold text-white mb-0.5">{ds.name}</h4>
              <p className="text-[10px] text-gray-500 mb-2">{ds.study}</p>

              {/* Completeness Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-500">Completeness</span>
                  <span className={cn('font-mono font-bold', ds.completeness >= 95 ? 'text-success-light' : 'text-warning-light')}>{ds.completeness}%</span>
                </div>
                <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                  <div className={cn('h-full transition-all', ds.completeness >= 95 ? 'bg-emerald-500' : 'bg-warning')} style={{ width: `${ds.completeness}%` }} />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-white/5">
                <span className="text-gray-300 font-mono">{ds.totalRecords.toLocaleString()} records</span>
                {ds.errorCount > 0 ? (
                  <span className="text-emergency-light flex items-center gap-1 font-bold"><AlertCircle className="w-3 h-3" /> {ds.errorCount} errors</span>
                ) : (
                  <span className="text-success-light font-bold">Clean</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
