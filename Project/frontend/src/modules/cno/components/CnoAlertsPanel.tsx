'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import type { CnoAlert } from '../types/cno.types';
import { useResolveCnoAlert } from '../hooks/useCnoAnalytics';

interface CnoAlertsPanelProps {
  alerts: CnoAlert[];
}

export function CnoAlertsPanel({ alerts }: CnoAlertsPanelProps) {
  const { mutate: resolveAlert, isPending } = useResolveCnoAlert();

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-emergency-light" />;
      case 'warning': return <ShieldAlert className="w-5 h-5 text-warning-light" />;
      case 'info': return <Info className="w-5 h-5 text-info-light" />;
      default: return null;
    }
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-emergency/20 text-emergency-light';
      case 'warning': return 'bg-warning/20 text-warning-light';
      case 'info': return 'bg-info/20 text-info-light';
      default: return 'bg-white/10 text-white';
    }
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Care Alerts & Escalations</h3>
          <p className="text-xs text-gray-400 mt-0.5">Nursing operational incidents</p>
        </div>
      </CardHeader>
      
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.04]">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 flex gap-3 hover:bg-white/[0.02] transition-colors">
              <div className="mt-0.5">{getIcon(alert.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${getBadgeClass(alert.type)}`}>
                    {alert.type}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono ml-auto">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-sm text-gray-200 leading-snug mb-2 font-medium">
                  {alert.message}
                </p>
                <p className="text-xs text-gray-500 mb-3">Location: {alert.ward}</p>
                
                {alert.actionRequired && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="text-xs h-7"
                      onClick={() => resolveAlert(alert.id)}
                      disabled={isPending}
                    >
                      Resolve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-7"
                    >
                      Escalate
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="p-8 text-center text-gray-500">No active alerts</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
