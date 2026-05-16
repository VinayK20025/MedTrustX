'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { BuildingZone, FireZoneStatus } from '../types/fire-safety.types';
import { useEvacuateZone, useTriggerAlarm } from '../hooks/useFireSafetyAnalytics';
import { Flame, MapPin, LogOut, Bell } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { zones: BuildingZone[]; }

const zoneStatusConfig: Record<FireZoneStatus, { border: string; badge: string; dot: string; bg: string }> = {
  'Safe':           { border: 'border-l-emerald-600', bg: 'hover:bg-emerald-500/[0.02]',  dot: 'bg-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400' },
  'Smoke Detected': { border: 'border-l-yellow-500',  bg: 'bg-yellow-500/[0.03] hover:bg-yellow-500/[0.06]', dot: 'bg-yellow-400 animate-pulse', badge: 'bg-yellow-500/20 text-yellow-400 border border-yellow-600/30' },
  'Fire Alert':     { border: 'border-l-emergency',   bg: 'bg-emergency/[0.06] hover:bg-emergency/[0.10]',   dot: 'bg-emergency-light animate-ping', badge: 'bg-emergency/20 text-emergency-light border border-emergency/40 animate-pulse' },
  'Evacuating':     { border: 'border-l-orange-500',  bg: 'bg-orange-500/[0.04] hover:bg-orange-500/[0.07]', dot: 'bg-orange-400 animate-pulse', badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
  'Contained':      { border: 'border-l-blue-500',    bg: 'bg-blue-500/[0.03]', dot: 'bg-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
};

export function FireZoneMapPanel({ zones }: Props) {
  const { mutate: evacuate } = useEvacuateZone();
  const { mutate: triggerAlarm } = useTriggerAlarm();

  const sorted = [...zones].sort((a, b) => {
    const order: Record<FireZoneStatus, number> = { 'Fire Alert': 0, Evacuating: 1, 'Smoke Detected': 2, Contained: 3, Safe: 4 };
    return order[a.status] - order[b.status];
  });

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-orange-500/15"><Flame className="w-4 h-4 text-orange-400" /></div>
          <h3 className="text-[14px] font-bold text-white">Zone Safety Map</h3>
        </div>
        <span className="text-[9px] font-bold text-gray-400">{zones.length} zones</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {sorted.map(zone => {
            const cfg = zoneStatusConfig[zone.status];
            const isAlert = zone.status === 'Fire Alert' || zone.status === 'Smoke Detected';
            return (
              <div key={zone.id} className={cn('p-4 border-l-4 transition-all cursor-default', cfg.border, cfg.bg)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="relative shrink-0">
                      <div className={cn('w-2.5 h-2.5 rounded-full', cfg.dot)} />
                      {zone.status === 'Fire Alert' && <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emergency-light animate-ping opacity-60" />}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-white">{zone.name}</p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{zone.floor}</p>
                    </div>
                  </div>
                  <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider', cfg.badge)}>{zone.status}</span>
                </div>

                <div className="text-[10px] text-gray-500 mb-2">{zone.detectorCount} detectors • Last: {new Date(zone.lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>

                {isAlert && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" onClick={() => evacuate(zone.id)}
                      className="h-7 text-[10px] font-bold bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border border-orange-500/30"
                      leftIcon={<LogOut className="w-3 h-3" />}>Evacuate</Button>
                    <Button size="sm" onClick={() => triggerAlarm(zone.id)}
                      className="h-7 text-[10px] font-bold bg-emergency/15 hover:bg-emergency/25 text-emergency-light border border-emergency/30"
                      leftIcon={<Bell className="w-3 h-3" />}>Trigger Alarm</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
