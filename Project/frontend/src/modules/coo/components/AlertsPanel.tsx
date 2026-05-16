'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, AlertCircle, MapPin } from 'lucide-react';
import type { CooAlert } from '../types/coo.types';
import { useResolveAlert } from '../hooks/useCooAnalytics';

interface AlertsPanelProps {
  alerts: CooAlert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const { mutate: handleAction, isPending } = useResolveAlert();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Bottlenecks & Alerts</h3>
          <p className="text-xs text-gray-400 mt-0.5">Require immediate operational resolution</p>
        </div>
        <div className="px-2 py-1 rounded bg-emergency/10 text-emergency-light text-xs font-bold animate-pulse">
          {alerts.length} Active
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
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                    alert.type === 'critical' ? 'bg-emergency/20 text-emergency-light' : 'bg-warning/20 text-warning-light'
                  }`}>
                    {alert.type}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-sm text-gray-200 leading-snug mb-2 font-medium">
                  {alert.message}
                </p>

                {alert.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <MapPin className="w-3 h-3" />
                    {alert.location}
                  </div>
                )}
                
                {alert.actionRequired && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="text-xs h-7"
                      onClick={() => handleAction({ alertId: alert.id, actionType: 'resolve' })}
                      disabled={isPending}
                    >
                      Resolve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-7"
                      onClick={() => handleAction({ alertId: alert.id, actionType: 'assign' })}
                      disabled={isPending}
                    >
                      Assign
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7 text-gray-400 hover:text-white"
                      onClick={() => handleAction({ alertId: alert.id, actionType: 'escalate' })}
                      disabled={isPending}
                    >
                      Escalate
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
