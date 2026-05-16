'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, ShieldAlert, FileSearch, ArrowRight } from 'lucide-react';
import type { ClinicalAlert } from '../types/cmo.types';
import { useInitiateAudit } from '../hooks/useCmoAnalytics';

interface ClinicalAlertsPanelProps {
  alerts: ClinicalAlert[];
}

export function ClinicalAlertsPanel({ alerts }: ClinicalAlertsPanelProps) {
  const { mutate: handleAudit, isPending } = useInitiateAudit();

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-emergency-light" />;
      case 'warning': return <ShieldAlert className="w-5 h-5 text-warning-light" />;
      case 'audit': return <FileSearch className="w-5 h-5 text-indigo-400" />;
      default: return null;
    }
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-emergency/20 text-emergency-light';
      case 'warning': return 'bg-warning/20 text-warning-light';
      case 'audit': return 'bg-indigo-500/20 text-indigo-300';
      default: return 'bg-white/10 text-white';
    }
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Clinical Risk & Audit Flags</h3>
          <p className="text-xs text-gray-400 mt-0.5">Automated protocol deviations & governance</p>
        </div>
      </CardHeader>
      
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.04]">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-5 flex gap-4 hover:bg-white/[0.02] transition-colors">
              <div className="mt-0.5">{getIcon(alert.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${getBadgeClass(alert.type)}`}>
                    {alert.type}
                  </span>
                  <span className="text-xs font-semibold text-gray-400 bg-white/[0.05] px-2 py-0.5 rounded">
                    {alert.department}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono ml-auto">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-sm text-gray-200 leading-relaxed mb-3">
                  {alert.message}
                </p>
                
                {alert.actionRequired && (
                  <div className="flex items-center gap-3">
                    {alert.type === 'audit' ? (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="text-xs h-8 bg-indigo-600 hover:bg-indigo-500 text-white"
                        onClick={() => handleAudit(alert.id)}
                        disabled={isPending}
                      >
                        Initiate Audit
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-8"
                      >
                        Review Case
                      </Button>
                    )}
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
