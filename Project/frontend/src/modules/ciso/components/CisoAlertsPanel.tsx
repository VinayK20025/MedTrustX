'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, ShieldAlert, Info, Terminal } from 'lucide-react';
import type { CisoAlert } from '../types/ciso.types';
import { useResolveCisoAlert } from '../hooks/useCisoAnalytics';

interface CisoAlertsPanelProps {
  alerts: CisoAlert[];
}

export function CisoAlertsPanel({ alerts }: CisoAlertsPanelProps) {
  const { mutate: resolveAlert, isPending } = useResolveCisoAlert();

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return <ShieldAlert className="w-5 h-5 text-emergency-light" />;
      case 'warning':  return <AlertTriangle className="w-5 h-5 text-warning-light" />;
      case 'info':     return <Info className="w-5 h-5 text-info-light" />;
      default: return null;
    }
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-emergency/20 text-emergency-light';
      case 'warning':  return 'bg-warning/20 text-warning-light';
      case 'info':     return 'bg-info/20 text-info-light';
      default: return 'bg-white/10 text-white';
    }
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Security Alerts</h3>
          <p className="text-xs text-gray-400 mt-0.5">ZTA policy engine & detection alerts</p>
        </div>
        {alerts.filter(a => a.type === 'critical').length > 0 && (
          <span className="text-[10px] text-emergency-light bg-emergency/10 px-2 py-1 rounded-full border border-emergency/20 font-bold animate-pulse">
            {alerts.filter(a => a.type === 'critical').length} CRITICAL
          </span>
        )}
      </CardHeader>
      
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.04]">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 flex gap-3 hover:bg-white/[0.02] transition-colors group">
              <div className="mt-0.5">{getIcon(alert.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${getBadgeClass(alert.type)}`}>
                    {alert.type}
                  </span>
                  <span className="text-[10px] text-red-300 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                    {alert.category}
                  </span>
                  <span className="text-[10px] text-gray-600 bg-white/[0.03] px-1.5 py-0.5 rounded font-mono">
                    via {alert.source}
                  </span>
                  <span className="text-[10px] text-gray-500 ml-auto font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-sm text-gray-200 leading-snug mb-3 font-medium">
                  {alert.message}
                </p>
                
                {alert.actionRequired && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="text-xs h-7"
                      onClick={() => resolveAlert(alert.id)}
                      disabled={isPending}
                    >
                      Acknowledge
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                      <Terminal className="w-3 h-3" /> View Logs
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="p-8 text-center text-gray-500">No active security alerts</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
