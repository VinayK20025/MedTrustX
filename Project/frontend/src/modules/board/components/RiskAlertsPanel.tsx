'use client';
import React from 'react';
import { ChartCard } from './ChartCard';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { RiskAndComplianceAlert } from '../types/board.types';

interface RiskAlertsPanelProps {
  alerts: RiskAndComplianceAlert[];
  className?: string;
}

export function RiskAlertsPanel({ alerts, className }: RiskAlertsPanelProps) {
  return (
    <ChartCard 
      title="Strategic Risk & Alerts" 
      subtitle="Critical anomalies requiring board attention"
      className={className}
      bodyClassName="p-0 flex flex-col"
    >
      <div className="flex-1 overflow-y-auto max-h-[400px]">
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No critical alerts
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-5 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                <div className={cn(
                  'p-2.5 rounded-xl flex-shrink-0',
                  alert.type === 'critical' ? 'bg-emergency/10 text-emergency-light' :
                  alert.type === 'warning' ? 'bg-warning/10 text-warning-light' :
                  'bg-info/10 text-info-light'
                )}>
                  {alert.type === 'critical' && <AlertTriangle className="w-5 h-5" />}
                  {alert.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                  {alert.type === 'info' && <Info className="w-5 h-5" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white uppercase tracking-wide">
                      {alert.category}
                    </p>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(alert.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 mt-1 text-sm leading-relaxed">
                    {alert.message}
                  </p>
                  {(alert.hospitalId || alert.unit) && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      {alert.hospitalId && <span className="px-2 py-0.5 rounded bg-white/[0.05]">{alert.hospitalId}</span>}
                      {alert.unit && <span className="px-2 py-0.5 rounded bg-white/[0.05]">{alert.unit}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ChartCard>
  );
}
