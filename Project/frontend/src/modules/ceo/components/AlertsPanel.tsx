'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';
import type { ActionableAlert } from '../types/ceo.types';
import { useEscalateAlert } from '../hooks/useCeoAnalytics';

interface AlertsPanelProps {
  alerts: ActionableAlert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const { mutate: escalate, isPending } = useEscalateAlert();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light flex flex-col h-full">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Operational Alerts</h3>
          <p className="text-xs text-gray-400 mt-0.5">Real-time critical events</p>
        </div>
      </CardHeader>
      
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.04]">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 flex gap-3 hover:bg-white/[0.02] transition-colors">
              <div className="mt-0.5">
                {alert.type === 'critical' ? (
                  <AlertTriangle className="w-5 h-5 text-emergency-light" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-warning-light" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 bg-white/[0.05] px-1.5 py-0.5 rounded">
                    {alert.category}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-200 leading-snug mb-3">
                  {alert.message}
                </p>
                {alert.actionRequired && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium text-emergency-light bg-emergency/10 px-2 py-0.5 rounded border border-emergency/20">
                      Action Required
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7 hover:bg-white/[0.05]"
                      onClick={() => escalate(alert.id)}
                      disabled={isPending}
                    >
                      {alert.actionLabel || 'Escalate'}
                      <ArrowRight className="w-3 h-3 ml-1.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
