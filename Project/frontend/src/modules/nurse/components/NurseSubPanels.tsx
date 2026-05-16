'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Heart, Thermometer, Activity, Pill, ClipboardCheck, Stethoscope,
  UserCheck, Clock, AlertTriangle, CheckCircle2, Search, Users
} from 'lucide-react';

/* ─── Vitals Panel ──────────────────────────────────────── */
const mockVitals = [
  { id: 'V-1', patient: 'Bed 4A — John Doe', bp: '128/82', hr: 78, temp: 98.4, spo2: 97, rr: 16, time: '10 min ago', flag: null },
  { id: 'V-2', patient: 'Bed 7B — Maria Garcia', bp: '90/58', hr: 112, temp: 101.2, spo2: 92, rr: 22, time: '3 min ago', flag: 'critical' as const },
  { id: 'V-3', patient: 'Bed 12C — Sarah Chen', bp: '138/88', hr: 84, temp: 98.6, spo2: 98, rr: 14, time: '25 min ago', flag: null },
];

export function NurseVitalsPanel({ roleLabel = 'Staff Nurse' }: { roleLabel?: string }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Vitals Recording" icon={<Heart className="w-5 h-5 text-rose-400" />} subtitle={`${mockVitals.length} patients due`} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {mockVitals.map(v => (
            <div key={v.id} className={`p-3 rounded-lg border bg-surface-dark hover:border-white/[0.12] transition-all ${v.flag === 'critical' ? 'border-emergency/30' : 'border-white/[0.06]'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-white">{v.patient}</p>
                {v.flag && <Badge variant="danger" size="sm">Critical</Badge>}
                <span className="text-[10px] text-gray-500">{v.time}</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="flex items-center gap-1"><Activity className="w-3 h-3 text-blue-400" /><span className="text-gray-400">BP</span><span className="text-white font-mono">{v.bp}</span></div>
                <div className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-400" /><span className="text-gray-400">HR</span><span className="text-white font-mono">{v.hr}</span></div>
                <div className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-amber-400" /><span className="text-gray-400">T</span><span className="text-white font-mono">{v.temp}°F</span></div>
                <div className="flex items-center gap-1"><span className="text-teal-400 text-[10px] font-bold">SpO₂</span><span className="text-white font-mono">{v.spo2}%</span></div>
                <div className="flex items-center gap-1"><span className="text-gray-400">RR</span><span className="text-white font-mono">{v.rr}</span></div>
              </div>
              <Button size="sm" variant="outline" className="mt-2 w-full">Record New Vitals</Button>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── Medication Administration Panel ──────────────────── */
const mockMeds = [
  { id: 'M-1', patient: 'Bed 4A — John Doe', drug: 'Amoxicillin 500mg PO', dueAt: '14:00', status: 'due' },
  { id: 'M-2', patient: 'Bed 7B — Maria Garcia', drug: 'Morphine 2mg IV PRN', dueAt: 'PRN', status: 'prn' },
  { id: 'M-3', patient: 'Bed 12C — Sarah Chen', drug: 'Metoprolol 25mg PO', dueAt: '14:30', status: 'due' },
  { id: 'M-4', patient: 'Bed 4A — John Doe', drug: 'Ibuprofen 400mg PO', dueAt: '12:00', status: 'given' },
];

export function NurseMedicationPanel({ roleLabel = 'Staff Nurse' }: { roleLabel?: string }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Medication Administration" icon={<Pill className="w-5 h-5 text-emerald-400" />} subtitle={`${mockMeds.filter(m => m.status === 'due').length} due now`} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {mockMeds.map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark hover:border-white/[0.12] transition-all">
              {m.status === 'given' ? <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" /> : <Pill className={`w-4 h-4 flex-shrink-0 ${m.status === 'due' ? 'text-amber-400' : 'text-gray-400'}`} />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{m.drug}</p>
                <p className="text-xs text-gray-400">{m.patient}</p>
              </div>
              <span className="text-xs text-gray-500 font-mono">{m.dueAt}</span>
              <Badge variant={m.status === 'given' ? 'success' : m.status === 'due' ? 'warning' : 'default'} size="sm">{m.status}</Badge>
              {m.status !== 'given' && <Button size="sm">Administer</Button>}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── Patient Worklist Panel ───────────────────────────── */
export function NursePatientWorklist({ roleLabel = 'Staff Nurse' }: { roleLabel?: string }) {
  const [search, setSearch] = useState('');
  const patients = [
    { id: 'P-1', name: 'John Doe', bed: '4A', ward: 'General', status: 'stable', acuity: 'low' },
    { id: 'P-2', name: 'Maria Garcia', bed: '7B', ward: 'General', status: 'unstable', acuity: 'high' },
    { id: 'P-3', name: 'Sarah Chen', bed: '12C', ward: 'Surgical', status: 'stable', acuity: 'medium' },
    { id: 'P-4', name: 'Robert Johnson', bed: '9A', ward: 'General', status: 'stable', acuity: 'low' },
  ];
  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Patient Worklist" icon={<Users className="w-5 h-5 text-blue-400" />} subtitle={`${patients.length} assigned`} />
      <CardBody className="flex-1 flex flex-col gap-3 overflow-y-auto">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..." className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors" />
        </div>
        {filtered.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark hover:border-white/[0.12] transition-all cursor-pointer">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.status === 'unstable' ? 'bg-emergency' : 'bg-success'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{p.name}</p>
              <p className="text-xs text-gray-400">Bed {p.bed} · {p.ward}</p>
            </div>
            <Badge variant={p.acuity === 'high' ? 'danger' : p.acuity === 'medium' ? 'warning' : 'default'} size="sm">{p.acuity}</Badge>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

/* ─── Task Board Panel ─────────────────────────────────── */
const mockTasks = [
  { id: 'T-1', task: 'Dressing change — Bed 4A', priority: 'routine', status: 'pending', dueAt: '14:15' },
  { id: 'T-2', task: 'Blood draw — Bed 7B', priority: 'stat', status: 'pending', dueAt: 'STAT' },
  { id: 'T-3', task: 'Catheter removal — Bed 12C', priority: 'routine', status: 'completed', dueAt: '11:00' },
  { id: 'T-4', task: 'Post-op assessment — Bed 9A', priority: 'urgent', status: 'pending', dueAt: '14:30' },
];

export function NurseTaskBoard({ roleLabel = 'Staff Nurse' }: { roleLabel?: string }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Task Board" icon={<ClipboardCheck className="w-5 h-5 text-violet-400" />} subtitle={`${mockTasks.filter(t => t.status === 'pending').length} pending`} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {mockTasks.map(t => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark hover:border-white/[0.12] transition-all">
              {t.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" /> : <Clock className={`w-4 h-4 flex-shrink-0 ${t.priority === 'stat' ? 'text-emergency-light' : 'text-violet-400'}`} />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{t.task}</p>
                <span className="text-xs text-gray-500 font-mono">{t.dueAt}</span>
              </div>
              <Badge variant={t.priority === 'stat' ? 'danger' : t.priority === 'urgent' ? 'warning' : 'default'} size="sm">{t.priority}</Badge>
              {t.status === 'pending' && <Button size="sm" variant="outline">Complete</Button>}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── Rounds Panel ─────────────────────────────────────── */
export function NurseRoundsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Nursing Rounds" icon={<Stethoscope className="w-5 h-5 text-teal-400" />} subtitle="Current shift rounds" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {['4A — John Doe', '7B — Maria Garcia', '12C — Sarah Chen', '9A — Robert Johnson'].map((bed, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark hover:border-white/[0.12] transition-all">
              <UserCheck className={`w-4 h-4 flex-shrink-0 ${i < 2 ? 'text-success' : 'text-gray-500'}`} />
              <div className="flex-1">
                <p className="text-sm text-white font-medium">Bed {bed}</p>
                <p className="text-xs text-gray-400">{i < 2 ? 'Round completed' : 'Pending assessment'}</p>
              </div>
              <Badge variant={i < 2 ? 'success' : 'default'} size="sm">{i < 2 ? 'Done' : 'Pending'}</Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── Procedures Panel ─────────────────────────────────── */
export function NurseProceduresPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Procedures & Interventions" icon={<Stethoscope className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <div className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-white">IV Cannulation — Bed 7B</p>
              <Badge variant="warning" size="sm">Scheduled</Badge>
            </div>
            <p className="text-xs text-gray-400">16G left antecubital · Dr. Patel order</p>
          </div>
          <div className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-white">Wound Dressing — Bed 4A</p>
              <Badge variant="success" size="sm">Completed</Badge>
            </div>
            <p className="text-xs text-gray-400">Abdominal surgical site · clean technique</p>
          </div>
          <div className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-white">Foley Catheter Removal — Bed 12C</p>
              <Badge variant="default" size="sm">Pending</Badge>
            </div>
            <p className="text-xs text-gray-400">Post-op day 2 · physician cleared</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── Alerts Panel (shared) ────────────────────────────── */
export function NurseAlertsSharedPanel({ roleLabel = 'Nurse' }: { roleLabel?: string }) {
  const alerts = [
    { id: 'A-1', type: 'Fall Risk', patient: 'Bed 7B — Maria Garcia', severity: 'critical' as const, time: '2 min ago' },
    { id: 'A-2', type: 'Med Due', patient: 'Bed 4A — John Doe', severity: 'warning' as const, time: '5 min ago' },
    { id: 'A-3', type: 'Lab Ready', patient: 'Bed 12C — Sarah Chen', severity: 'info' as const, time: '12 min ago' },
  ];
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title={`${roleLabel} Alerts`} icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} subtitle={`${alerts.length} active`} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {alerts.map(a => (
            <div key={a.id} className={`flex items-center gap-3 p-3 rounded-lg border bg-surface-dark transition-all ${a.severity === 'critical' ? 'border-emergency/30' : 'border-white/[0.06]'}`}>
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${a.severity === 'critical' ? 'text-emergency-light' : a.severity === 'warning' ? 'text-warning-light' : 'text-blue-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{a.type}</p>
                <p className="text-xs text-gray-400">{a.patient}</p>
              </div>
              <span className="text-[10px] text-gray-500">{a.time}</span>
              <Button size="sm" variant="ghost">Acknowledge</Button>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── Reports Panel (shared) ──────────────────────────── */
export function NurseReportsPanel({ roleLabel = 'Nursing' }: { roleLabel?: string }) {
  const reports = [
    { id: 'R-1', name: 'Shift Handoff Summary', date: '2026-05-01', type: 'Shift Report', status: 'complete' },
    { id: 'R-2', name: 'Incident Report — Bed 7B', date: '2026-05-01', type: 'Incident', status: 'draft' },
    { id: 'R-3', name: 'Daily Census Report', date: '2026-05-01', type: 'Census', status: 'complete' },
  ];
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title={`${roleLabel} Reports`} icon={<ClipboardCheck className="w-5 h-5 text-blue-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {reports.map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark hover:border-white/[0.12] transition-all">
              <ClipboardCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{r.name}</p>
                <p className="text-xs text-gray-400">{r.date} · {r.type}</p>
              </div>
              <Badge variant={r.status === 'draft' ? 'warning' : 'success'} size="sm">{r.status}</Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
