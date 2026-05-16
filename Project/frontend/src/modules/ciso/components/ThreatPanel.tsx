'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ThreatEvent } from '../types/ciso.types';
import { Crosshair, ShieldX, Eye, Ban } from 'lucide-react';
import { useBlockSource } from '../hooks/useCisoAnalytics';

interface ThreatPanelProps {
  threats: ThreatEvent[];
}

const severityConfig = {
  critical: { badge: 'bg-emergency text-white animate-pulse', dot: 'bg-emergency' },
  high:     { badge: 'bg-emergency/20 text-emergency-light border border-emergency/30', dot: 'bg-emergency/60' },
  medium:   { badge: 'bg-warning/20 text-warning-light border border-warning/30', dot: 'bg-warning' },
  low:      { badge: 'bg-white/10 text-gray-300 border border-white/20', dot: 'bg-gray-500' },
};

const typeLabels: Record<string, string> = {
  intrusion: 'Intrusion',
  brute_force: 'Brute Force',
  privilege_escalation: 'Priv. Escalation',
  data_exfiltration: 'Data Exfiltration',
  anomaly: 'Anomaly',
};

export function ThreatPanel({ threats }: ThreatPanelProps) {
  const { mutate: blockSource, isPending } = useBlockSource();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-emergency-light" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Threat Feed</h3>
            <p className="text-xs text-gray-400 mt-0.5">Real-time threat intelligence stream</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emergency/10 border border-emergency/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emergency opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emergency"></span>
          </span>
          <span className="text-[10px] text-emergency-light font-bold uppercase tracking-wider">LIVE</span>
        </div>
      </CardHeader>
      
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[450px]">
        <div className="divide-y divide-white/[0.04]">
          {threats.map((threat) => {
            const sev = severityConfig[threat.severity];
            return (
              <div key={threat.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${sev.badge}`}>
                    {threat.severity}
                  </span>
                  <span className="text-[10px] text-red-300 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 font-mono">
                    {typeLabels[threat.type] || threat.type}
                  </span>
                  {threat.mitreTactic && (
                    <span className="text-[10px] text-gray-500 bg-white/[0.04] px-1.5 py-0.5 rounded font-mono">
                      {threat.mitreTactic}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-600 ml-auto font-mono">
                    {new Date(threat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-sm text-gray-200 leading-snug mb-2 font-medium">
                  {threat.description}
                </p>
                
                <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono mb-3">
                  <span>SRC: <span className="text-orange-300">{threat.source}</span></span>
                  <span>→</span>
                  <span>TGT: <span className="text-indigo-300">{threat.target}</span></span>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="text-xs h-7 bg-emergency/80 hover:bg-emergency gap-1"
                    onClick={() => blockSource(threat.source)}
                    disabled={isPending}
                  >
                    <Ban className="w-3 h-3" /> Block Source
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                    <Eye className="w-3 h-3" /> Investigate
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
