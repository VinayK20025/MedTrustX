'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { NetworkIncident } from '../types/network.types';
import { useResolveNetworkIncident } from '../hooks/useNetworkAnalytics';
import { Activity, AlertTriangle, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { incidents: NetworkIncident[]; }

export function NetworkWorkspace({ incidents }: Props) {
  const { mutate: resolveIncident } = useResolveNetworkIncident();

  return (
    <Card className="border-indigo-500/25 shadow-glass bg-[#03040a] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-bold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-blue-400" /> Network Telemetry Workspace</h3>
          <p className="text-[11px] text-gray-500 mt-1 font-mono">Real-time bandwidth analysis & active incidents.</p>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">
        {/* Active Incidents */}
        {incidents.length > 0 && (
          <div className="p-5 border-b border-white/5 bg-emergency/[0.02]">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-warning-light" /> Active Network Incidents</h4>
            <div className="space-y-3">
              {incidents.map(inc => (
                <div key={inc.id} className="bg-white/5 border border-white/10 p-3 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-gray-400 font-mono">{inc.id} • {inc.deviceAffected}</span>
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

        {/* Bandwidth & Traffic Visualization Mock */}
        <div className="p-5 flex-1 flex flex-col">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Core Bandwidth Utilization (Gbps)</h4>
          <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
             {/* Mock Waveform / Graph Area */}
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             <Activity className="w-16 h-16 text-indigo-500/20 mb-4" />
             <p className="text-[13px] text-gray-400">Live Traffic Visualization active.</p>
             <div className="mt-6 w-full max-w-md">
               <div className="flex justify-between text-[10px] text-gray-400 font-mono mb-1"><span>Current: 4.2 Gbps</span><span>Peak: 10 Gbps</span></div>
               <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-[42%]"></div>
               </div>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button className="h-10 bg-white/5 hover:bg-white/10 text-[12px] font-bold text-gray-300" leftIcon={<Zap className="w-4 h-4" />}>Run Traceroute</Button>
            <Button className="h-10 bg-white/5 hover:bg-white/10 text-[12px] font-bold text-gray-300" leftIcon={<ChevronRight className="w-4 h-4" />}>Configure VLANs</Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
