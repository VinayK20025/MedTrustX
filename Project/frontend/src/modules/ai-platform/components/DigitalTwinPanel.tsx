'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { Network, RefreshCw, AlertTriangle, CheckCircle2, Cpu, Activity, WifiOff } from 'lucide-react';
import type { DigitalTwin, TwinStatus } from '../types';

const STATUS_CFG: Record<TwinStatus, { color: string; icon: React.ElementType; label: string }> = {
  Synced:     { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, label: 'Synced'     },
  Drifted:    { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',       icon: AlertTriangle,label: 'Drifted'    },
  Offline:    { color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',          icon: WifiOff,      label: 'Offline'    },
  Simulating: { color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',    icon: Activity,     label: 'Simulating' },
};

const ENTITY_ICON: Record<string, React.ElementType> = {
  Patient: Activity, Ward: Network, Device: Cpu, Building: Network, Pathway: Activity,
};

interface Props {
  twins: DigitalTwin[];
  onSync: (id: string) => void;
}

export const DigitalTwinPanel: React.FC<Props> = ({ twins, onSync }) => {
  const drifted = twins.filter(t => t.status === 'Drifted');

  return (
    <div className="h-full flex flex-col bg-surface-dark border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10">
            <Network className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Digital Twins</h3>
          {drifted.length > 0 && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" /> {drifted.length} Drifted
            </span>
          )}
        </div>
        <div className="flex gap-3 mt-1.5 text-[10px]">
          <span className="text-emerald-400">{twins.filter(t => t.status === 'Synced').length} Synced</span>
          <span className="text-purple-400">{twins.filter(t => t.status === 'Simulating').length} Simulating</span>
          <span className="text-gray-500">{twins.reduce((s, t) => s + t.totalSimulations, 0)} Total Sim Runs</span>
        </div>
      </div>

      {/* Twin Cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {twins.map(twin => {
          const st = STATUS_CFG[twin.status];
          const StIcon = st.icon;
          const EntityIcon = ENTITY_ICON[twin.entityType] ?? Activity;
          const hasPredictions = twin.predictedEvents.length > 0;

          return (
            <div
              key={twin.id}
              className={cn(
                'rounded-xl border bg-surface-light p-3 transition-all duration-200',
                twin.status === 'Drifted' ? 'border-amber-500/20' : 'border-white/[0.06]',
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/10">
                    <EntityIcon className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{twin.entityName}</p>
                    <p className="text-[10px] text-gray-500">{twin.entityType} · {twin.entityId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn('flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md border', st.color)}>
                    <StIcon className="w-2.5 h-2.5" /> {st.label}
                  </span>
                  <button
                    onClick={() => onSync(twin.id)}
                    className="p-1 rounded-md bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                    title="Force sync"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Drift score */}
              <div className="mb-2">
                <div className="flex justify-between text-[9px] text-gray-500 mb-1">
                  <span>State Drift Score</span>
                  <span className={cn('font-mono font-semibold',
                    twin.driftScore > 0.2 ? 'text-amber-400' : 'text-emerald-400'
                  )}>{(twin.driftScore * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06]">
                  <div className={cn('h-full rounded-full transition-all',
                    twin.driftScore > 0.2 ? 'bg-amber-500' : 'bg-emerald-500'
                  )} style={{ width: `${twin.driftScore * 100}%` }} />
                </div>
              </div>

              {/* State variables */}
              <div className="grid grid-cols-2 gap-1 mb-2">
                {Object.entries(twin.stateVariables).slice(0, 4).map(([k, v]) => (
                  <div key={k} className="bg-white/[0.03] rounded-md px-2 py-1">
                    <p className="text-[8px] text-gray-600 capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-[10px] font-mono text-gray-300">{String(v)}</p>
                  </div>
                ))}
              </div>

              {/* Predictions */}
              {hasPredictions && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-2">
                  {twin.predictedEvents.map(ev => (
                    <div key={ev.id}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] font-bold text-amber-300">{ev.eventType}</span>
                        <span className="ml-auto text-[9px] text-amber-400 font-mono">{(ev.probability * 100).toFixed(0)}% prob</span>
                      </div>
                      <p className="text-[10px] text-gray-400">{ev.description}</p>
                      <p className="text-[10px] text-emerald-400 mt-0.5">→ {ev.recommendedAction}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between mt-2 text-[9px] text-gray-600">
                <span>{twin.activeSimulations} active sims · {twin.totalSimulations} total</span>
                <span>Synced {new Date(twin.lastSyncedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
