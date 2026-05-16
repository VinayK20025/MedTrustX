'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ValidationRule, DataQuery } from '../types/data-manager.types';
import { useResolveQuery, useRunValidation } from '../hooks/useDataMgrAnalytics';
import { ShieldCheck, AlertCircle, CheckCircle2, MessageCircle, Play } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { rules: ValidationRule[]; queries: DataQuery[]; selectedDatasetId?: string; }

export function DataWorkspace({ rules, queries, selectedDatasetId }: Props) {
  const { mutate: resolveQuery } = useResolveQuery();
  const { mutate: runValidation } = useRunValidation();
  const [tab, setTab] = useState<'validation' | 'queries'>('validation');

  return (
    <Card className="border-violet-500/20 shadow-glass bg-[#030206] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-800 via-purple-500 to-indigo-400" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex justify-between items-start">
        <div>
          <h3 className="text-[16px] font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-violet-400" /> Data Governance Engine
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Validate datasets, manage discrepancy queries, and prepare for regulatory lock.</p>
        </div>
        {selectedDatasetId && (
          <Button onClick={() => runValidation(selectedDatasetId)} size="sm" className="bg-violet-500/20 text-violet-400 border border-violet-500/40 hover:bg-violet-500/30" leftIcon={<Play className="w-3.5 h-3.5" />}>Run Validation</Button>
        )}
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        <button onClick={() => setTab('validation')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'validation' ? 'text-violet-400 border-violet-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>Validation Engine</button>
        <button onClick={() => setTab('queries')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors', tab === 'queries' ? 'text-violet-400 border-violet-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
          Queries
          {queries.filter(q => q.status === 'Open').length > 0 && (
            <span className="ml-1.5 bg-emergency/20 text-emergency-light text-[9px] font-bold px-1.5 py-0.5 rounded-full">{queries.filter(q => q.status === 'Open').length}</span>
          )}
        </button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {tab === 'validation' && (
          <div className="p-5 space-y-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Automated Validation Rules</p>
            {rules.map(r => (
              <div key={r.id} className={cn('border rounded-xl p-4 flex items-center gap-4',
                r.status === 'Pass' ? 'bg-success/10 border-success/30' : 'bg-emergency/10 border-emergency/30'
              )}>
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                  r.status === 'Pass' ? 'bg-success/20 text-success-light' : 'bg-emergency/20 text-emergency-light'
                )}>
                  {r.status === 'Pass' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <span className="text-[14px] font-bold text-white block">{r.rule}</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded">{r.category}</span>
                    {r.failCount > 0 && (
                      <span className="text-[10px] font-bold text-emergency-light">{r.failCount} failures</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'queries' && (
          <div className="p-5 space-y-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Discrepancy Query Log</p>
            {queries.map(q => (
              <div key={q.id} className={cn('border rounded-xl p-4',
                q.status === 'Open' ? 'bg-emergency/10 border-emergency/30' :
                q.status === 'Responded' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-success/10 border-success/30'
              )}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className={cn('w-4 h-4',
                      q.status === 'Open' ? 'text-emergency-light' : 'text-blue-400'
                    )} />
                    <span className="text-[10px] font-mono text-gray-400">{q.id}</span>
                  </div>
                  <span className={cn('text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded',
                    q.status === 'Open' ? 'bg-emergency/20 text-emergency-light' :
                    q.status === 'Responded' ? 'bg-blue-500/20 text-blue-300' : 'bg-success/20 text-success-light'
                  )}>{q.status}</span>
                </div>
                <p className="text-[13px] font-bold text-white mb-1">{q.issue}</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3">
                  <span>Field: <strong className="text-gray-300">{q.field}</strong></span>
                  <span>Subject: <strong className="text-gray-300">{q.subject}</strong></span>
                  <span>Site: <strong className="text-gray-300">{q.site}</strong></span>
                </div>
                {(q.status === 'Open' || q.status === 'Responded') && (
                  <Button onClick={() => resolveQuery(q.id)} size="sm" className="bg-white/5 border-white/10 text-[11px] hover:bg-white/10">
                    {q.status === 'Responded' ? 'Accept & Close' : 'Resolve Query'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
