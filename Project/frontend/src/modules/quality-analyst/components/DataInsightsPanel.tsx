'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AnomalyInsight, DataSource } from '../types/quality-analyst.types';
import { useDismissInsight, useFlagAnomaly, useTriggerValidation } from '../hooks/useQualityAnalytics';
import { Lightbulb, AlertTriangle, ShieldAlert, TrendingUp, Database, RefreshCw, X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { insights: AnomalyInsight[]; sources: DataSource[]; }

const severityColor = { Critical: 'text-emergency-light bg-emergency/[0.05] border-emergency/30', High: 'text-orange-400 bg-orange-500/[0.05] border-orange-500/30', Medium: 'text-blue-400 bg-blue-500/[0.05] border-blue-500/30' };
const typeIcon = { Anomaly: AlertTriangle, Risk: ShieldAlert, Opportunity: TrendingUp };

export function DataInsightsPanel({ insights, sources }: Props) {
  const { mutate: dismiss } = useDismissInsight();
  const { mutate: flag } = useFlagAnomaly();
  const { mutate: validate } = useTriggerValidation();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-purple-400" /> AI Insights & Anomalies
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">
        {/* Data Sources Sync Status */}
        <div className="p-4 border-b border-white/[0.04] bg-black/20">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Data Validation Sources</p>
          <div className="grid grid-cols-2 gap-2">
            {sources.map(src => (
              <div key={src.id} className="bg-white/[0.02] border border-white/10 rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-gray-300">{src.name}</p>
                  <p className={cn('text-[9px] mt-0.5 font-bold', src.status === 'Connected' ? 'text-success-light' : 'text-warning-light')}>{src.status}</p>
                </div>
                <button onClick={() => validate(src.id)} className="p-1.5 hover:bg-white/10 rounded text-gray-400 transition-colors">
                  <RefreshCw className={cn('w-3.5 h-3.5', src.status === 'Syncing' && 'animate-spin')} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Feed */}
        <div className="p-4 space-y-3 flex-1">
          {insights.map(insight => {
            const Icon = typeIcon[insight.type];
            return (
              <div key={insight.id} className={cn('rounded-xl border p-4 transition-all', severityColor[insight.severity])}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">{insight.type}</span>
                  </div>
                  <span className="text-[9px] text-gray-500">{new Date(insight.detectedAt).toLocaleDateString()}</span>
                </div>

                <h4 className="text-[14px] font-black mt-1">{insight.metric}</h4>
                <p className="text-[12px] opacity-90 mt-1 leading-relaxed">{insight.description}</p>
                
                <div className="mt-3 p-2.5 bg-black/30 rounded-lg border border-black/20">
                  <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Recommendation</p>
                  <p className="text-[11px] font-semibold">{insight.recommendation}</p>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-current/10">
                  <Button size="sm" onClick={() => flag(insight.id)} className="flex-1 h-8 text-[10px] bg-white/10 hover:bg-white/20 border-transparent text-current" leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>Escalate</Button>
                  <Button size="sm" onClick={() => dismiss(insight.id)} className="flex-1 h-8 text-[10px] bg-transparent hover:bg-black/20 border-current/20 text-current" leftIcon={<X className="w-3.5 h-3.5" />}>Dismiss</Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
