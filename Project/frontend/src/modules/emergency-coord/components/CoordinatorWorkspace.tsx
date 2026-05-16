'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { TriagePatient, AmbulanceUnit, CoordinatorTask, FlowResource } from '../types/emergency-coord.types';
import { useAssignTriage, useRedirectAmbulance, useEcUpdateTask, useEcBroadcast, useEscalateToDisaster } from '../hooks/useEcAnalytics';
import { Navigation, Ambulance, ClipboardList, Send, ArrowUp, CheckCircle2, Activity, BedDouble, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { patient?: TriagePatient; ambulances: AmbulanceUnit[]; tasks: CoordinatorTask[]; resources: FlowResource[]; }

const ROUTING_OPTS = ['ICU', 'ER Bay', 'OT', 'Ward A', 'Ward B', 'OPD Fast Track', 'Isolation Room'];

export function CoordinatorWorkspace({ patient, ambulances, tasks, resources }: Props) {
  const { mutate: assign } = useAssignTriage();
  const { mutate: redirect } = useRedirectAmbulance();
  const { mutate: updateTask } = useEcUpdateTask();
  const { mutate: broadcast } = useEcBroadcast();
  const { mutate: escalate } = useEscalateToDisaster();
  const [tab, setTab] = useState<'patient' | 'ambulances' | 'tasks' | 'resources'>('patient');

  const tabs = [
    { key: 'patient' as const, label: 'Patient Routing', icon: Navigation },
    { key: 'ambulances' as const, label: 'Ambulances', icon: Ambulance },
    { key: 'tasks' as const, label: 'Task Board', icon: ClipboardList },
    { key: 'resources' as const, label: 'Resources', icon: BedDouble },
  ];

  const priorityColor = { Red: 'text-red-400', Yellow: 'text-yellow-400', Green: 'text-emerald-400', Black: 'text-gray-500' };
  const ambStatusColor = { 'En Route': 'text-blue-400', Transporting: 'text-orange-400', 'On Scene': 'text-yellow-400', Available: 'text-emerald-400' };

  return (
    <Card className="border-orange-500/20 shadow-glass bg-[#060408] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-700 via-orange-500 to-yellow-600" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-black text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" /> Emergency Coordination Hub
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5 font-mono">Patient routing • Ambulance tracking • Task execution</p>
        </div>
        <Button onClick={() => escalate('Threshold exceeded')}
          className="h-8 text-[10px] font-black bg-emergency/20 hover:bg-emergency/30 text-emergency-light border border-emergency/30 px-3"
          leftIcon={<ArrowUp className="w-3.5 h-3.5" />}>
          Escalate to Disaster Officer
        </Button>
      </CardHeader>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1',
              tab === t.key ? 'text-orange-400 border-orange-400' : 'text-gray-500 border-transparent hover:text-gray-300'
            )}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {/* PATIENT ROUTING TAB */}
        {tab === 'patient' && (
          <div className="p-5 animate-fade-in">
            {!patient ? (
              <div className="flex flex-col items-center justify-center py-24 opacity-40">
                <Navigation className="w-12 h-12 text-gray-600 mb-4" />
                <p className="text-gray-400 font-bold">Select a patient from the triage queue</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Patient header */}
                <div className={cn('rounded-xl border p-4 flex gap-4 items-start',
                  patient.priority === 'Red' ? 'bg-emergency/10 border-emergency/30' :
                  patient.priority === 'Yellow' ? 'bg-yellow-500/10 border-yellow-600/30' :
                  'bg-white/[0.02] border-white/10'
                )}>
                  <div className={cn('text-[28px] font-black', priorityColor[patient.priority])}>{patient.tag}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('text-[12px] font-black uppercase', priorityColor[patient.priority])}>{patient.priority} — {patient.priority === 'Red' ? 'IMMEDIATE' : patient.priority === 'Yellow' ? 'DELAYED' : patient.priority === 'Green' ? 'MINOR' : 'EXPECTANT'}</span>
                    </div>
                    <p className="text-[14px] font-bold text-white">{patient.chiefComplaint}</p>
                    <p className="text-[11px] text-gray-400 mt-1">From: {patient.from} {patient.eta ? `• ETA ${patient.eta}m` : ''}</p>
                  </div>
                </div>

                {/* Current routing */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Routing Decision</p>
                  {patient.routedTo ? (
                    <div className="bg-success/10 border border-success/25 rounded-xl px-4 py-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success-light" />
                      <span className="text-[13px] font-bold text-success-light">Routed to: {patient.routedTo}</span>
                    </div>
                  ) : (
                    <div className="bg-warning/10 border border-warning/25 rounded-xl px-4 py-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning-light animate-pulse" />
                      <span className="text-[13px] font-bold text-warning-light">Awaiting routing decision</span>
                    </div>
                  )}
                </div>

                {/* Quick routing buttons */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-3">Route to Department</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ROUTING_OPTS.map(dest => (
                      <Button key={dest} size="sm" onClick={() => assign({ id: patient.id, priority: patient.priority, dest })}
                        className={cn('h-11 text-[12px] font-bold border transition-all',
                          dest.includes('ICU') || dest.includes('OT') ? 'bg-emergency/10 hover:bg-emergency/20 text-emergency-light border-emergency/30' :
                          'bg-white/5 hover:bg-white/10 text-white border-white/10'
                        )}
                        leftIcon={<Navigation className="w-3.5 h-3.5" />}>
                        {dest}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Broadcast about this patient */}
                <Button onClick={() => broadcast(`Prepare ${patient.routedTo || 'ER'} for incoming ${patient.priority} patient: ${patient.chiefComplaint}`)}
                  className="w-full h-10 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-[12px] font-bold"
                  leftIcon={<Send className="w-4 h-4" />}>
                  Broadcast Patient Prep Alert
                </Button>
              </div>
            )}
          </div>
        )}

        {/* AMBULANCES TAB */}
        {tab === 'ambulances' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {ambulances.map(amb => (
              <div key={amb.id} className={cn('rounded-xl border p-4 flex gap-4 items-center',
                amb.patientLoad === 'Critical' ? 'bg-emergency/[0.05] border-emergency/25' :
                amb.status === 'Available' ? 'bg-success/[0.03] border-success/20' :
                'bg-white/[0.02] border-white/10'
              )}>
                <div className="shrink-0">
                  <Ambulance className={cn('w-6 h-6', amb.patientLoad === 'Critical' ? 'text-emergency-light' : 'text-gray-400')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-black text-white">{amb.callSign}</span>
                    <span className={cn('text-[9px] font-bold uppercase', ambStatusColor[amb.status])}>{amb.status}</span>
                    {amb.patientLoad !== 'Empty' && (
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded font-bold',
                        amb.patientLoad === 'Critical' ? 'bg-emergency/20 text-emergency-light' : 'bg-blue-500/20 text-blue-300'
                      )}>{amb.patientLoad} Load</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400">{amb.currentLocation}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{amb.patientCount} patient{amb.patientCount !== 1 ? 's' : ''} on board</p>
                </div>
                <div className="text-right shrink-0">
                  {amb.etaMinutes !== undefined && (
                    <div className={cn('font-black text-[18px] font-mono', amb.etaMinutes <= 3 ? 'text-emergency-light' : 'text-white')}>{amb.etaMinutes}m</div>
                  )}
                  {amb.status === 'Available' && (
                    <Button size="sm" onClick={() => redirect({ ambId: amb.id, instruction: 'Dispatch to scene' })}
                      className="h-7 text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30">
                      Dispatch
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TASKS TAB */}
        {tab === 'tasks' && (
          <div className="p-5 space-y-2 animate-fade-in">
            {tasks.map(task => (
              <div key={task.id} className={cn('flex items-center gap-3 rounded-xl border p-3',
                task.status === 'Done' ? 'bg-white/[0.01] border-white/5 opacity-60' :
                task.priority === 'Immediate' ? 'bg-emergency/[0.05] border-emergency/25' :
                'bg-white/[0.02] border-white/10'
              )}>
                <div className={cn('w-5 h-5 rounded-full shrink-0 flex items-center justify-center border',
                  task.status === 'Done' ? 'bg-success/20 border-success/60' :
                  task.status === 'In Progress' ? 'bg-blue-500/20 border-blue-500/60 animate-pulse' :
                  'border-white/20'
                )}>
                  {task.status === 'Done' && <CheckCircle2 className="w-3 h-3 text-success-light" />}
                  {task.status === 'In Progress' && <Activity className="w-3 h-3 text-blue-400" />}
                  {task.status === 'Pending' && <Clock className="w-3 h-3 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-[12px] font-bold', task.status === 'Done' ? 'line-through text-gray-500' : 'text-white')}>{task.title}</p>
                  <p className="text-[10px] text-gray-500">{task.owner} • {task.department}</p>
                </div>
                {task.status !== 'Done' && (
                  <Button size="sm" onClick={() => updateTask({ id: task.id, status: 'Done' })}
                    className="h-7 shrink-0 text-[10px] bg-success/10 hover:bg-success/20 text-success-light border border-success/30">
                    Done
                  </Button>
                )}
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
                  res.status === 'Low' ? 'bg-warning/[0.04] border-warning/25' :
                  'bg-white/[0.02] border-white/10'
                )}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] font-bold text-white">{res.name}</span>
                    <span className={cn('text-[20px] font-black font-mono',
                      res.status === 'Critical' ? 'text-emergency-light' :
                      res.status === 'Low' ? 'text-warning-light' : 'text-success-light'
                    )}>{res.available}<span className="text-[12px] text-gray-500 ml-1">{res.unit}</span></span>
                  </div>
                  <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                    <div className={cn('h-full transition-all duration-500',
                      pct < 15 ? 'bg-emergency-500' : pct < 30 ? 'bg-warning-light' : 'bg-emerald-500'
                    )} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">{pct}% available ({res.available} of {res.total} {res.unit})</p>
                </div>
              );
            })}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
