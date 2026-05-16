'use client';
import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { BrainCircuit, RefreshCw, Play, AlertTriangle, CheckCircle2, Clock, XCircle, Search, ChevronRight } from 'lucide-react';
import type { AiModel, AiModelStatus } from '../types';

const STATUS_CONFIG: Record<AiModelStatus, { color: string; icon: React.ElementType; label: string }> = {
  'Deployed':          { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, label: 'Deployed' },
  'Staging':           { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',   icon: Clock,         label: 'Staging'  },
  'Training':          { color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',icon: RefreshCw,     label: 'Training' },
  'Deprecated':        { color: 'text-gray-400 bg-gray-500/10 border-gray-500/20',      icon: XCircle,       label: 'Deprecated' },
  'Failed':            { color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',      icon: XCircle,       label: 'Failed'   },
  'Pending Approval':  { color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',icon: Clock,         label: 'Pending'  },
};

interface Props {
  models: AiModel[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onRetrain: (id: string) => void;
  onDeploy: (id: string) => void;
}

export const AiModelRegistryPanel: React.FC<Props> = ({ models, selectedId, onSelect, onRetrain, onDeploy }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<AiModelStatus | 'All'>('All');

  const filtered = models.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                        m.domain.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="h-full flex flex-col bg-surface-dark border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/10">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Model Registry</h3>
          <span className="ml-auto text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
            {models.filter(m => m.status === 'Deployed').length} Live
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search models..."
            className="w-full bg-surface border border-white/[0.06] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/40"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1 flex-wrap">
          {(['All', 'Deployed', 'Staging', 'Training', 'Pending Approval'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                'px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-colors',
                filterStatus === s
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-white/[0.02] text-gray-500 border-white/[0.06] hover:text-gray-300'
              )}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Model List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        {filtered.map(model => {
          const st = STATUS_CONFIG[model.status];
          const Icon = st.icon;
          const isSelected = model.id === selectedId;
          const hasDrift = model.driftScore > 0.1;

          return (
            <div
              key={model.id}
              onClick={() => onSelect(model.id)}
              className={cn(
                'px-4 py-3 cursor-pointer transition-all duration-150 hover:bg-white/[0.03]',
                isSelected && 'bg-indigo-500/5 border-l-2 border-indigo-500'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-xs font-semibold text-white truncate">{model.name}</p>
                    {hasDrift && (
                      <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" title="Drift detected" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500">{model.domain} · {model.type} · v{model.version}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold border', st.color)}>
                      <Icon className="w-2.5 h-2.5" />
                      {st.label}
                    </span>
                    {model.status === 'Deployed' && (
                      <span className="text-[9px] text-gray-400 font-mono">
                        {model.accuracy.toFixed(1)}% acc · {model.inferenceLatencyMs}ms
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {model.status === 'Deployed' && (
                    <button
                      onClick={e => { e.stopPropagation(); onRetrain(model.id); }}
                      className="p-1 rounded-md bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                      title="Trigger retrain"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  )}
                  {model.status === 'Staging' && (
                    <button
                      onClick={e => { e.stopPropagation(); onDeploy(model.id); }}
                      className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      title="Promote to production"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  )}
                  <ChevronRight className="w-3 h-3 text-gray-600" />
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-600">
            <BrainCircuit className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs">No models match filter</p>
          </div>
        )}
      </div>
    </div>
  );
};
