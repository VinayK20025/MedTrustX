'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AppIncident } from '../types/appsupport.types';
import { useRestartService, useRollbackRelease, useUpdateAppIncident } from '../hooks/useAppSupportAnalytics';
import { Activity, GitMerge, RotateCcw, Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { incident?: AppIncident; }

export function SupportWorkspace({ incident }: Props) {
  const { mutate: restartService } = useRestartService();
  const { mutate: rollbackRelease } = useRollbackRelease();
  const { mutate: updateStatus } = useUpdateAppIncident();

  if (!incident) return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center">
      <Activity className="w-10 h-10 text-gray-600 mb-4" />
      <p className="text-gray-500 text-[15px]">Select an incident to view diagnostics</p>
    </Card>
  );

  const isSev1 = incident.severity === 'Sev 1';

  return (
    <Card className={cn("shadow-glass h-full flex flex-col relative overflow-hidden", isSev1 ? "bg-[#1a0505] border-emergency/30" : "bg-[#050a14] border-blue-500/25")}>
      <div className={cn("absolute top-0 left-0 w-full h-1.5", isSev1 ? "bg-gradient-to-r from-red-600 to-emergency-500 animate-pulse" : "bg-gradient-to-r from-blue-600 to-indigo-500")} />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        {isSev1 && (
           <div className="mb-3 bg-emergency/20 border border-emergency/30 text-emergency-light p-2 rounded text-[11px] font-bold flex items-center justify-center gap-2">
             <AlertTriangle className="w-4 h-4" /> MAJOR INCIDENT ACTIVE - BRIDGE OPEN
           </div>
        )}
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-[18px] font-bold text-white flex items-center gap-2"><Terminal className={cn("w-5 h-5", isSev1 ? "text-emergency-light" : "text-blue-400")} /> {incident.title}</h3>
        </div>
        <p className="text-[12px] text-gray-400">App: <span className="text-gray-300 font-bold">{incident.appAffected}</span> • ID: <span className="text-gray-500 font-mono">{incident.id}</span></p>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">
        {/* Release Correlation */}
        {incident.recentRelease && (
          <div className="p-4 border-b border-white/5 bg-warning/[0.03] flex items-center justify-between">
            <div>
              <h4 className="text-[11px] font-bold text-warning-light uppercase tracking-widest flex items-center gap-1.5 mb-1"><GitMerge className="w-3.5 h-3.5" /> Recent Change Correlation</h4>
              <p className="text-[12px] text-gray-300">Deployment <span className="font-mono text-white">{incident.recentRelease.version}</span> occurred near incident start time.</p>
            </div>
            <Button onClick={() => rollbackRelease(incident.recentRelease!.version)} size="sm" className="h-8 text-[10px] bg-warning/10 hover:bg-warning/20 text-warning-light border border-warning/30" leftIcon={<RotateCcw className="w-3 h-3" />}>Trigger Rollback</Button>
          </div>
        )}

        {/* Diagnostics & Logs Explorer */}
        <div className="p-5 flex-1 flex flex-col">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Log Trace Explorer</h4>
          <div className="flex-1 bg-black/60 border border-white/10 rounded-lg p-3 overflow-y-auto font-mono text-[11px] space-y-2 mb-4">
            {incident.traces.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No traces available.</p>
            ) : (
              incident.traces.map(trace => {
                const colors = {
                  INFO: 'text-blue-300', WARN: 'text-warning-light', ERROR: 'text-orange-400', FATAL: 'text-emergency-light font-bold bg-emergency/10 inline-block px-1'
                };
                return (
                  <div key={trace.id} className="flex gap-3 border-b border-white/5 pb-2">
                    <span className="text-gray-600 shrink-0">{new Date(trace.timestamp).toLocaleTimeString()}</span>
                    <span className={cn("shrink-0 w-12", colors[trace.level])}>[{trace.level}]</span>
                    <span className="text-gray-500 shrink-0">[{trace.service}]</span>
                    <span className="text-gray-300 break-all">{trace.message}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-auto">
            <Button onClick={() => restartService(incident.appAffected)} className="h-10 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[12px] font-bold" leftIcon={<RotateCcw className="w-4 h-4" />}>Restart Listener Service</Button>
            <Button onClick={() => updateStatus({ id: incident.id, status: 'Resolved' })} disabled={incident.status === 'Resolved'} className="h-10 bg-success/10 hover:bg-success/20 text-success-light border border-success/30 text-[12px] font-bold disabled:opacity-50" leftIcon={<CheckCircle2 className="w-4 h-4" />}>Mark Mitigated / Resolved</Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
