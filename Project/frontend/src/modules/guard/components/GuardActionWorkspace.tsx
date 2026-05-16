'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { GuardTask, PatrolCheckpoint } from '../types/guard.types';
import { useUpdateGuardTask, useEscalateIncident, useCheckPatrolPoint, useReportIncident } from '../hooks/useGuardAnalytics';
import { ShieldAlert, MapPin, CheckCircle2, ArrowUp, Navigation, ClipboardList, FileText, Send } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { task?: GuardTask; patrol: PatrolCheckpoint[]; }

export function GuardActionWorkspace({ task, patrol }: Props) {
  const { mutate: updateTask } = useUpdateGuardTask();
  const { mutate: escalate } = useEscalateIncident();
  const { mutate: checkPoint } = useCheckPatrolPoint();
  const { mutate: reportIncident } = useReportIncident();

  const [activeTab, setActiveTab] = useState<'task' | 'patrol' | 'report'>('task');
  const [reportDesc, setReportDesc] = useState('');

  const tabs = [
    { key: 'task' as const, label: 'Active Task', icon: ShieldAlert },
    { key: 'patrol' as const, label: 'Patrol', icon: Navigation },
    { key: 'report' as const, label: 'Report', icon: FileText },
  ];

  return (
    <Card className={cn('shadow-glass h-full flex flex-col relative overflow-hidden',
      task?.isEmergency ? 'bg-[#160505] border-emergency/35' : 'bg-[#060710] border-white/[0.06]'
    )}>
      {/* Top accent bar */}
      <div className={cn('absolute top-0 left-0 w-full h-1.5',
        task?.isEmergency ? 'bg-gradient-to-r from-red-700 via-emergency-500 to-red-700' : 'bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700'
      )} />

      {/* Emergency banner */}
      {task?.isEmergency && (
        <div className="bg-emergency/20 border-b border-emergency/30 px-5 py-2.5 flex items-center justify-center gap-2 animate-pulse">
          <ShieldAlert className="w-4 h-4 text-emergency-light" />
          <span className="text-[11px] font-black text-emergency-light uppercase tracking-widest">Emergency — Immediate Action Required</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/[0.06] px-4 pt-4">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={cn('flex items-center gap-1.5 pb-2.5 px-3 mr-1 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2',
              activeTab === t.key ? 'text-white border-b-white/60' : 'text-gray-500 hover:text-gray-300 border-b-transparent'
            )}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        {/* TASK TAB */}
        {activeTab === 'task' && (
          <div className="p-5 flex flex-col gap-5 animate-fade-in">
            {!task ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShieldAlert className="w-12 h-12 text-gray-600 mb-4" />
                <p className="text-gray-400 text-[15px] font-bold">No task selected</p>
                <p className="text-gray-600 text-[12px] mt-1">Select an alert from the left panel</p>
              </div>
            ) : (
              <>
                {/* Task detail */}
                <div className="space-y-3">
                  <h2 className={cn('text-[18px] font-black', task.isEmergency ? 'text-emergency-light' : 'text-white')}>{task.title}</h2>
                  <div className="flex items-center gap-2 text-[13px] text-gray-300">
                    <MapPin className={cn('w-4 h-4 shrink-0', task.isEmergency ? 'text-emergency-light' : 'text-blue-400')} />
                    {task.location}
                  </div>
                </div>

                {/* Instructions block */}
                <div className={cn('rounded-xl p-4 border', task.isEmergency ? 'bg-emergency/10 border-emergency/25' : 'bg-white/[0.03] border-white/10')}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1.5">
                    <ClipboardList className="w-3 h-3" /> Instructions
                  </p>
                  <p className="text-[13px] text-gray-200 leading-relaxed">{task.instructions}</p>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-1 gap-3 pt-2">
                  <Button onClick={() => updateTask({ id: task.id, status: 'In Progress' })}
                    className={cn('h-14 text-[14px] font-black rounded-xl', task.isEmergency ? 'bg-emergency hover:bg-emergency/90 text-white shadow-lg shadow-emergency/30' : 'bg-blue-600 hover:bg-blue-500 text-white')}
                    leftIcon={<Navigation className="w-5 h-5" />}>
                    {task.status === 'In Progress' ? 'Responding — En Route' : 'Accept & Go to Location'}
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => updateTask({ id: task.id, status: 'Done' })}
                      className="h-11 text-[12px] font-bold bg-success/15 hover:bg-success/25 text-success-light border border-success/30"
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                      Mark Resolved
                    </Button>
                    <Button onClick={() => escalate(task.id)}
                      className="h-11 text-[12px] font-bold bg-warning/15 hover:bg-warning/25 text-warning-light border border-warning/30"
                      leftIcon={<ArrowUp className="w-4 h-4" />}>
                      Escalate
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* PATROL TAB */}
        {activeTab === 'patrol' && (
          <div className="p-5 animate-fade-in">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" /> Today's Patrol Route
            </h4>
            <div className="relative space-y-3">
              {patrol.map((cp, idx) => (
                <div key={cp.id} className={cn('flex items-start gap-4 p-3 rounded-xl border transition-all',
                  cp.checked ? 'bg-success/[0.04] border-success/20' : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                )}>
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center shrink-0 pt-1">
                    <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      cp.checked ? 'bg-success/20 border-success/60' : 'border-white/20'
                    )}>
                      {cp.checked && <CheckCircle2 className="w-3 h-3 text-success-light" />}
                    </div>
                    {idx < patrol.length - 1 && <div className={cn('w-0.5 h-6 mt-1', cp.checked ? 'bg-success/30' : 'bg-white/10')} />}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={cn('text-[13px] font-bold', cp.checked ? 'text-success-light' : 'text-white')}>{cp.name}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{cp.location}</p>
                      </div>
                      {cp.checked ? (
                        <span className="text-[9px] text-success-light font-mono">{new Date(cp.checkedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      ) : (
                        <Button size="sm" onClick={() => checkPoint(cp.id)} className="h-7 text-[10px] bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30">
                          Check In
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <div className="p-5 flex flex-col gap-4 animate-fade-in">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Report an Incident
            </h4>
            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-blue-500/50">
              <option>Unauthorized Access</option>
              <option>Suspicious Activity</option>
              <option>Crowd Overload</option>
              <option>Medical Emergency</option>
              <option>Theft</option>
              <option>Other</option>
            </select>
            <input type="text" placeholder="Location (e.g. ICU Block B, 2nd Floor)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-blue-500/50" />
            <textarea
              rows={5} placeholder="Describe what you observed..."
              value={reportDesc} onChange={e => setReportDesc(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[13px] text-gray-200 focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed"
            />
            <Button onClick={() => reportIncident({ type: 'Unauthorized Access', description: reportDesc, location: '' })}
              className="h-12 text-[13px] font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl"
              leftIcon={<Send className="w-4 h-4" />}>
              Submit Incident Report
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
