'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ServerInfra, ItIncident } from '../types/it.types';
import { useRestartServer, useResolveItIncident } from '../hooks/useItAnalytics';
import { Server, HardDrive, Cpu, AlertTriangle, Terminal, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { infra: ServerInfra[]; incidents: ItIncident[]; }

export function ItControlWorkspace({ infra, incidents }: Props) {
  const { mutate: restartServer } = useRestartServer();
  const { mutate: resolveIncident } = useResolveItIncident();

  return (
    <Card className="border-indigo-500/25 shadow-glass bg-[#030612] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-600" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-bold text-white flex items-center gap-2"><Terminal className="w-4 h-4 text-indigo-400" /> IT Command Workspace</h3>
          <p className="text-[11px] text-gray-500 mt-1 font-mono">Infrastructure telemetry & active incident resolution.</p>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">
        {/* Active Incidents */}
        {incidents.length > 0 && (
          <div className="p-5 border-b border-white/5 bg-emergency/[0.02]">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-warning-light" /> Active Incidents ({incidents.length})</h4>
            <div className="space-y-3">
              {incidents.map(inc => (
                <div key={inc.id} className="bg-white/5 border border-white/10 p-3 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-gray-400 font-mono">{inc.id} • {inc.systemAffected}</span>
                      <h5 className="text-[13px] font-bold text-white mt-0.5">{inc.title}</h5>
                    </div>
                    <span className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded", inc.severity === 'Critical' || inc.severity === 'High' ? "bg-emergency/20 text-emergency-light" : "bg-warning/20 text-warning-light")}>{inc.severity}</span>
                  </div>
                  <p className="text-[11px] text-gray-300">{inc.description}</p>
                  <div className="flex justify-end mt-1">
                    <Button size="sm" onClick={() => resolveIncident(inc.id)} className="h-7 text-[10px] bg-success/20 hover:bg-success/30 text-success-light border border-success/30" leftIcon={<CheckCircle2 className="w-3 h-3" />}>Mark Resolved</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Infrastructure Telemetry */}
        <div className="p-5 flex-1">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Infrastructure Telemetry</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infra.map(srv => {
              const isHighCpu = srv.cpuUsage > 80;
              return (
                <div key={srv.id} className={cn("bg-white/[0.02] border rounded-xl p-4 flex flex-col justify-between", srv.status === 'Warning' ? "border-warning/30" : "border-white/5")}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded", srv.status === 'OK' ? "bg-emerald-500/10 text-emerald-400" : "bg-warning/10 text-warning-light")}><Server className="w-4 h-4" /></div>
                      <div>
                        <h5 className="text-[13px] font-bold text-white font-mono">{srv.hostname}</h5>
                        <p className="text-[10px] text-gray-500">{srv.role}</p>
                      </div>
                    </div>
                    {srv.status !== 'OK' && <AlertTriangle className="w-4 h-4 text-warning-light animate-pulse" />}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                        <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU</span>
                        <span className={cn(isHighCpu ? "text-emergency-light font-bold" : "")}>{srv.cpuUsage}%</span>
                      </div>
                      <div className="w-full bg-black/50 h-1 rounded-full"><div className={cn("h-full", isHighCpu ? "bg-emergency-500" : "bg-indigo-500")} style={{ width: `${srv.cpuUsage}%` }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                        <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> RAM</span>
                        <span>{srv.memoryUsage}%</span>
                      </div>
                      <div className="w-full bg-black/50 h-1 rounded-full"><div className="h-full bg-blue-500" style={{ width: `${srv.memoryUsage}%` }} /></div>
                    </div>
                  </div>

                  {srv.status !== 'OK' && (
                    <Button onClick={() => restartServer(srv.id)} className="w-full mt-4 h-8 bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-gray-300 font-bold" leftIcon={<RefreshCw className="w-3 h-3" />}>Remote Restart</Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
