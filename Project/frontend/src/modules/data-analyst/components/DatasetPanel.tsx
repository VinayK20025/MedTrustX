'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Database, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { AnalyticsDataset, KPIMetric } from '../types/analyst.types';

const categoryColors: Record<string, string> = {
  Clinical:    'bg-indigo-500/20 text-indigo-300',
  Financial:   'bg-emerald-500/20 text-emerald-300',
  Operational: 'bg-amber-500/20 text-amber-300',
  Quality:     'bg-purple-500/20 text-purple-300',
};

interface DatasetPanelProps {
  datasets: AnalyticsDataset[];
  kpis: KPIMetric[];
  activeDatasetId?: string;
  onSelectDataset?: (id: string) => void;
}

export const DatasetPanel: React.FC<DatasetPanelProps> = ({ datasets, kpis, activeDatasetId, onSelectDataset }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader title="Datasets & KPIs" icon={<Database className="w-4 h-4" />} />
      <CardBody className="flex-1 overflow-y-auto p-0">
        {/* KPI mini grid */}
        <div className="p-4 border-b border-white/[0.06]">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Key Performance Indicators</p>
          <div className="grid grid-cols-2 gap-2">
            {kpis.map(kpi => (
              <div key={kpi.id} className="bg-surface rounded-lg border border-white/[0.06] p-2.5">
                <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1 leading-tight">{kpi.label}</p>
                <p className="text-base font-bold text-white">{kpi.value}</p>
                <div className={cn("flex items-center gap-1 mt-1 text-[10px] font-bold",
                  kpi.positive
                    ? (kpi.trend === 'up' ? "text-emerald-400" : kpi.trend === 'down' ? "text-teal-400" : "text-gray-400")
                    : (kpi.trend === 'up' ? "text-amber-400" : kpi.trend === 'down' ? "text-emerald-400" : "text-gray-400")
                )}>
                  {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : kpi.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                  <span>{kpi.change > 0 ? '+' : ''}{kpi.change}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Datasets */}
        <div className="p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Data Sources</p>
          <div className="divide-y divide-white/[0.04]">
            {datasets.map(ds => (
              <div
                key={ds.id}
                onClick={() => onSelectDataset?.(ds.id)}
                className={cn(
                  "py-3 cursor-pointer transition-colors hover:bg-white/[0.02] rounded-lg px-2 -mx-2 border-l-2",
                  activeDatasetId === ds.id ? "border-l-teal-500 bg-white/[0.03]" :
                  ds.status === 'Error' ? "border-l-red-500" :
                  ds.status === 'Stale' ? "border-l-amber-500" : "border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1 mr-2">
                    <h4 className="text-xs font-medium text-white">{ds.name}</h4>
                    <p className="text-[10px] text-gray-500">{ds.source}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold", categoryColors[ds.category])}>{ds.category}</span>
                    <span className={cn("text-[9px] font-bold",
                      ds.status === 'Active' ? "text-emerald-400" :
                      ds.status === 'Stale' ? "text-amber-400" :
                      ds.status === 'Refreshing' ? "text-indigo-400" : "text-red-400"
                    )}>{ds.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[9px] text-gray-500">
                  <span>{(ds.sizeRows / 1000).toFixed(0)}K rows</span>
                  <span>{ds.refreshSchedule}</span>
                  {ds.status === 'Refreshing' && <RefreshCw className="w-2.5 h-2.5 text-indigo-400 animate-spin" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
