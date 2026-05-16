'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { QualityRiskAlert, DepartmentScorecard } from '../types/quality-manager.types';
import { useDismissQmAlert } from '../hooks/useQualityManagerAnalytics';
import { ShieldAlert, AlertTriangle, ArrowUpRight, BarChart } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { alerts: QualityRiskAlert[]; scorecards: DepartmentScorecard[]; }

const severityColor = {
  Critical: 'text-emergency-light bg-emergency/[0.05] border-emergency/30',
  High: 'text-orange-400 bg-orange-500/[0.05] border-orange-500/30',
  Medium: 'text-warning-light bg-warning/[0.05] border-warning/30'
};

export function QualityInsightsPanel({ alerts, scorecards }: Props) {
  const { mutate: dismiss } = useDismissQmAlert();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-purple-400" /> Risk & Compliance Insights
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        {/* Alerts Feed */}
        <div className="p-4 space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className={cn('rounded-xl border p-4 transition-all', severityColor[alert.severity])}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">{alert.severity} Risk</span>
                </div>
                <span className="text-[9px] text-gray-400">{new Date(alert.detectedAt).toLocaleDateString()}</span>
              </div>

              <h4 className="text-[14px] font-black mt-1">{alert.title}</h4>
              <p className="text-[12px] opacity-90 mt-1 leading-relaxed">{alert.description}</p>
              
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-current/10">
                <span className="text-[11px] font-bold opacity-80">{alert.department}</span>
                <div className="flex-1" />
                <Button size="sm" onClick={() => dismiss(alert.id)} className="h-7 text-[10px] bg-transparent hover:bg-black/20 border border-current/20 text-current">Dismiss</Button>
                <Button size="sm" className="h-7 text-[10px] bg-white/10 hover:bg-white/20 border-transparent text-current" leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>Action</Button>
              </div>
            </div>
          ))}
        </div>

        {/* Scorecards */}
        <div className="p-4 border-t border-white/[0.04] bg-black/20 space-y-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1"><BarChart className="w-3 h-3" /> Department Scorecards</p>
          {scorecards.map(sc => (
            <div key={sc.id} className={cn('rounded-xl border p-3 flex flex-col gap-2 transition-all cursor-default',
              sc.status === 'Pass' ? 'bg-success/[0.02] border-success/20 hover:bg-success/[0.04]' :
              sc.status === 'Warning' ? 'bg-warning/[0.04] border-warning/30 hover:bg-warning/[0.06]' :
              'bg-emergency/[0.05] border-emergency/30 hover:bg-emergency/[0.08]'
            )}>
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-white">{sc.department}</span>
                <span className={cn('text-[18px] font-black font-mono',
                  sc.score >= 90 ? 'text-success-light' : sc.score >= 80 ? 'text-warning-light' : 'text-emergency-light'
                )}>{sc.score}<span className="text-[11px] text-gray-500 ml-0.5">/100</span></span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-white/5 pt-2">
                <span>Compliance: {sc.complianceScore}%</span>
                <span>{sc.incidentCount} Incidents</span>
              </div>
            </div>
          ))}
        </div>

      </CardBody>
    </Card>
  );
}
