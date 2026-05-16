'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { HospitalZoneState, CriticalResource, CommandTask } from '../types/disaster.types';
import { useUpdateCommandTask, useBroadcastAlert, useActivateProtocol } from '../hooks/useDisasterAnalytics';
import { Activity, BedDouble, Siren, CheckCircle2, Clock, AlertTriangle, Send, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { zones: HospitalZoneState[]; resources: CriticalResource[]; tasks: CommandTask[]; }

export function CommandCenterWorkspace({ zones, resources, tasks }: Props) {
  const { mutate: updateTask } = useUpdateCommandTask();
  const { mutate: broadcast } = useBroadcastAlert();
  const { mutate: activateProtocol } = useActivateProtocol();
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [tab, setTab] = useState<'map' | 'resources' | 'tasks' | 'broadcast'>('map');

  const tabs = [
    { key: 'map' as const, label: 'Zone Status' },
    { key: 'resources' as const, label: 'Resources' },
    { key: 'tasks' as const, label: 'Tasks' },
    { key: 'broadcast' as const, label: 'Broadcast' },
  ];

  const zoneStatusColor: Record<string, string> = {
    Available: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    Overload: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
    Full: 'bg-emergency/15 border-emergency/30 text-emergency-light',
    Closed: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
    Evacuating: 'bg-yellow-500/15 border-yellow-600/30 text-yellow-400 animate-pulse',
  };

  return (
    <Card className="border-emergency/25 shadow-glass bg-[#040206] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-700 via-emergency-500 to-red-700 animate-pulse" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-black text-white flex items-center gap-2">
            <Siren className="w-4 h-4 text-emergency-light" /> Incident Command Center
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5 font-mono">Hospital state • Resources • Tasking • Communications</p>
        </div>
        {/* Quick protocol activators */}
        <div className="flex gap-2">
          {(['Code Black', 'Code Red'] as const).map(code => (
            <Button key={code} size="sm" onClick={() => activateProtocol(code)}
              className={cn('h-8 text-[10px] font-black px-3', code === 'Code Black' ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600' : 'bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-700/50')}>
              {code}
            </Button>
          ))}
        </div>
      </CardHeader>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.06] px-5 bg-black/20">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1',
              tab === t.key ? 'text-white border-emergency-light' : 'text-gray-500 border-transparent hover:text-gray-300'
            )}>
            {t.label}
          </button>
        ))}
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {/* ZONE MAP TAB */}
        {tab === 'map' && (
          <div className="p-5 grid grid-cols-2 gap-3 animate-fade-in">
            {zones.map(zone => (
              <div key={zone.id} className={cn('rounded-xl border p-3 flex flex-col gap-2', zoneStatusColor[zone.status])}>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-black">{zone.zone}</span>
                  <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded border tracking-wider', zoneStatusColor[zone.status])}>{zone.status}</span>
                </div>
                <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
                  <div className={cn('h-full transition-all', zone.occupancyPercent > 100 ? 'bg-emergency-500' : zone.occupancyPercent > 80 ? 'bg-orange-500' : 'bg-emerald-500')}
                    style={{ width: `${Math.min(zone.occupancyPercent, 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>{zone.occupancyPercent}% occupied</span>
                  <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {zone.availableBeds > 0 ? `${zone.availableBeds} free` : 'No beds'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RESOURCES TAB */}
        {tab === 'resources' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {resources.map(res => {
              const pct = Math.round((res.available / res.total) * 100);
              return (
                <div key={res.id} className={cn('rounded-xl border p-4',
                  res.status === 'Critical' ? 'bg-emergency/[0.06] border-emergency/30' :
                  res.status === 'Low' ? 'bg-warning/[0.04] border-warning/20' :
                  'bg-white/[0.02] border-white/10'
                )}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] font-bold text-white">{res.name}</span>
                    <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded',
                      res.status === 'Critical' ? 'bg-emergency/20 text-emergency-light border border-emergency/30' :
                      res.status === 'Low' ? 'bg-warning/20 text-warning-light' :
                      'bg-success/10 text-success-light'
                    )}>{res.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-black/50 h-2 rounded-full overflow-hidden">
                      <div className={cn('h-full', pct < 20 ? 'bg-emergency-500' : pct < 40 ? 'bg-warning-light' : 'bg-emerald-500')}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[12px] font-black text-white font-mono shrink-0">{res.available}<span className="text-gray-500 text-[10px] font-normal">/{res.total} {res.unit}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TASKS TAB */}
        {tab === 'tasks' && (
          <div className="p-5 space-y-2 animate-fade-in">
            {tasks.map(task => (
              <div key={task.id} className={cn('flex items-center gap-3 border rounded-xl p-3 transition-all',
                task.status === 'Done' ? 'bg-success/[0.04] border-success/20 opacity-70' :
                task.priority === 'Immediate' ? 'bg-emergency/[0.05] border-emergency/25' :
                'bg-white/[0.02] border-white/10'
              )}>
                <div className={cn('w-5 h-5 rounded-full shrink-0 flex items-center justify-center border',
                  task.status === 'Done' ? 'bg-success/20 border-success/60' :
                  task.status === 'Active' ? 'bg-blue-500/20 border-blue-500/60' :
                  'border-white/20'
                )}>
                  {task.status === 'Done' && <CheckCircle2 className="w-3 h-3 text-success-light" />}
                  {task.status === 'Active' && <Activity className="w-3 h-3 text-blue-400 animate-pulse" />}
                  {task.status === 'Pending' && <Clock className="w-3 h-3 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-[12px] font-bold', task.status === 'Done' ? 'line-through text-gray-500' : 'text-white')}>{task.title}</p>
                  <p className="text-[10px] text-gray-500">{task.team} • {task.priority}</p>
                </div>
                {task.status !== 'Done' && (
                  <Button size="sm" onClick={() => updateTask({ id: task.id, status: 'Done' })} className="h-7 shrink-0 text-[10px] bg-success/10 hover:bg-success/20 text-success-light border border-success/30">Done</Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* BROADCAST TAB */}
        {tab === 'broadcast' && (
          <div className="p-5 flex flex-col gap-4 animate-fade-in">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emergency-light" /> Quick Activation Broadcasts</p>
              <div className="grid grid-cols-2 gap-2">
                {['All Staff — Disaster Mode Active', 'Restrict Non-Emergency Admissions', 'OPD Closed Until Further Notice', 'Request All On-Call Staff to Report'].map(msg => (
                  <button key={msg} onClick={() => broadcast({ msg, channels: ['PA', 'SMS', 'App'] })}
                    className="text-left text-[11px] bg-emergency/10 hover:bg-emergency/20 border border-emergency/25 text-emergency-light p-2.5 rounded-lg transition-colors font-bold">
                    {msg}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Custom Broadcast</p>
              <textarea rows={4} value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
                placeholder="Type emergency broadcast message..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[13px] text-gray-200 focus:outline-none focus:border-emergency/40 resize-none" />
              <div className="flex gap-2 mt-3">
                {['PA System', 'SMS', 'App Notification'].map(ch => (
                  <span key={ch} className="text-[10px] bg-white/10 border border-white/10 px-2.5 py-1 rounded text-gray-300 font-bold">{ch}</span>
                ))}
                <Button onClick={() => broadcast({ msg: broadcastMsg, channels: ['PA', 'SMS', 'App'] })}
                  className="ml-auto h-8 bg-emergency hover:bg-emergency/90 text-white text-[11px] font-black px-4" leftIcon={<Send className="w-3.5 h-3.5" />}>
                  SEND ALERT
                </Button>
              </div>
            </div>
          </div>
        )}

      </CardBody>
    </Card>
  );
}
