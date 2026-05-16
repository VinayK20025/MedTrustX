'use client';

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Syringe, Activity, AlertTriangle, FileText, ClipboardCheck,
  CheckCircle2, Clock, Stethoscope, Send
} from 'lucide-react';

/* ─── Interventions Panel ──────────────────────────────── */
export function ICUInterventionsPanel() {
  const interventions = [
    { id: 'INT-1', patient: 'ICU-1 — M. Garcia', type: 'Vasopressor Titration', detail: 'Norepinephrine 0.1→0.15 mcg/kg/min for MAP <65', status: 'active', priority: 'critical' as const },
    { id: 'INT-2', patient: 'ICU-3 — R. Johnson', type: 'Ventilator Weaning', detail: 'SBT trial #2 — CPAP 5, PS 8, FiO₂ 40%', status: 'active', priority: 'high' as const },
    { id: 'INT-3', patient: 'ICU-5 — A. Patel', type: 'Renal Replacement', detail: 'CRRT initiated — Cr 4.2, K+ 6.1, anuria 8hrs', status: 'active', priority: 'critical' as const },
    { id: 'INT-4', patient: 'ICU-2 — S. Chen', type: 'Central Line Insertion', detail: 'R IJ triple lumen — ultrasound guided', status: 'completed', priority: 'routine' as const },
  ];
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Active Interventions" icon={<Syringe className="w-5 h-5 text-rose-400" />} subtitle={`${interventions.filter(i => i.status === 'active').length} active treatments`} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {interventions.map(i => (
            <div key={i.id} className={`p-3 rounded-lg border bg-surface-dark transition-all ${i.priority === 'critical' ? 'border-emergency/30' : 'border-white/[0.06]'}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-white">{i.type}</p>
                <div className="flex gap-1.5">
                  <Badge variant={i.status === 'completed' ? 'success' : i.priority === 'critical' ? 'danger' : 'warning'} size="sm">{i.priority}</Badge>
                  {i.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-success" />}
                </div>
              </div>
              <p className="text-xs text-gray-400">{i.patient}</p>
              <p className="text-xs text-gray-500 mt-1">{i.detail}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── Case Review / Notes Panel ────────────────────────── */
export function ICUCaseReviewPanel() {
  const [note, setNote] = React.useState('');
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Case Notes & Review" icon={<FileText className="w-5 h-5 text-blue-400" />} subtitle="Clinical documentation" />
      <CardBody className="flex-1 flex flex-col gap-3">
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
          <div className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="info" size="sm">Consult Note</Badge>
              <span className="text-[10px] text-gray-500">Dr. Rao · 2 hrs ago</span>
            </div>
            <p className="text-sm text-white">ICU-1: Septic shock secondary to pneumonia. Started broad-spectrum ABx (Meropenem + Vancomycin). Vasopressor-dependent. Plan: Continue resuscitation, repeat lactate in 6hrs, consider hydrocortisone if refractory.</p>
          </div>
          <div className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default" size="sm">Progress Note</Badge>
              <span className="text-[10px] text-gray-500">Dr. Singh · 6 hrs ago</span>
            </div>
            <p className="text-sm text-white">ICU-3: Day 5 ventilation. Improving — RSBI 62, NIF -28. Plan SBT today. If tolerated, extubate tomorrow AM.</p>
          </div>
        </div>
        <div className="pt-3 border-t border-white/[0.06]">
          <div className="flex gap-2">
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add clinical note..." className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors" />
            <Button leftIcon={<Send className="w-4 h-4" />}>Save</Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── ICU Alerts Panel ─────────────────────────────────── */
export function ICUAlertsWorkPanel() {
  const alerts = [
    { id: 'A-1', type: 'Hemodynamic Instability', patient: 'ICU-1 — M. Garcia', detail: 'MAP dropped to 52 despite NE 0.15', severity: 'critical' as const, time: '1 min ago' },
    { id: 'A-2', type: 'Ventilator Alarm', patient: 'ICU-3 — R. Johnson', detail: 'High peak pressure — 42 cmH₂O', severity: 'warning' as const, time: '5 min ago' },
    { id: 'A-3', type: 'Critical Lab', patient: 'ICU-5 — A. Patel', detail: 'K+ 6.8 mEq/L — ECG changes', severity: 'critical' as const, time: '3 min ago' },
  ];
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="ICU Alerts" icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} subtitle={`${alerts.filter(a => a.severity === 'critical').length} critical`} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {alerts.map(a => (
            <div key={a.id} className={`p-3 rounded-lg border bg-surface-dark ${a.severity === 'critical' ? 'border-emergency/30' : 'border-white/[0.06]'}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-white">{a.type}</p>
                <Badge variant={a.severity === 'critical' ? 'danger' : 'warning'} size="sm">{a.severity}</Badge>
              </div>
              <p className="text-xs text-gray-400">{a.patient}</p>
              <p className="text-xs text-gray-500 mt-0.5">{a.detail}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-gray-600">{a.time}</span>
                <Button size="sm" variant="ghost">Acknowledge</Button>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── ICU Reports Panel ────────────────────────────────── */
export function ICUReportsPanel() {
  const reports = [
    { id: 'R-1', name: 'Daily ICU Census Report', date: '2026-05-01', type: 'Census', status: 'complete' },
    { id: 'R-2', name: 'Mortality & Morbidity Conference', date: '2026-04-30', type: 'M&M', status: 'draft' },
    { id: 'R-3', name: 'APACHE II Score Summary', date: '2026-05-01', type: 'Acuity', status: 'complete' },
    { id: 'R-4', name: 'Ventilator Days Tracking', date: '2026-05-01', type: 'Quality', status: 'complete' },
  ];
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="ICU Reports & Analytics" icon={<ClipboardCheck className="w-5 h-5 text-blue-400" />} />
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

/* ─── Executive ICU Overview ───────────────────────────── */
export function ICUExecutiveOverview({ roleLabel = 'Executive' }: { roleLabel?: string }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'ICU Beds Occupied', value: '18/22', status: 'warning' },
          { title: 'Ventilator Patients', value: 8, status: 'normal' },
          { title: 'Average APACHE II', value: 19.4, status: 'warning' },
          { title: 'ICU Mortality (MTD)', value: '4.2%', status: 'normal' },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardBody className="p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
              <p className={`text-2xl font-black mt-1 font-mono ${kpi.status === 'warning' ? 'text-warning-light' : 'text-white'}`}>{kpi.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader title="ICU Census by Unit" icon={<Activity className="w-5 h-5 text-teal-400" />} />
          <CardBody>
            <div className="flex flex-col gap-2">
              {[
                { unit: 'Medical ICU', beds: '8/10', acuity: 'High' },
                { unit: 'Surgical ICU', beds: '6/8', acuity: 'Medium' },
                { unit: 'Neuro ICU', beds: '4/4', acuity: 'Critical' },
              ].map((u, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
                  <p className="text-sm text-white font-medium">{u.unit}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white font-mono">{u.beds}</span>
                    <Badge variant={u.acuity === 'Critical' ? 'danger' : u.acuity === 'High' ? 'warning' : 'default'} size="sm">{u.acuity}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Quality Indicators" icon={<Stethoscope className="w-5 h-5 text-emerald-400" />} />
          <CardBody>
            <div className="flex flex-col gap-2">
              {[
                { metric: 'VAP Rate (per 1000 vent-days)', value: '2.1', target: '<5.0', status: 'success' },
                { metric: 'CLABSI Rate', value: '0.8', target: '<1.0', status: 'success' },
                { metric: 'Average LOS (days)', value: '6.3', target: '<7.0', status: 'success' },
                { metric: 'Unplanned Extubations', value: '1', target: '0', status: 'warning' },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-white/[0.06] bg-surface-dark">
                  <p className="text-sm text-white">{m.metric}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-mono">{m.value}</span>
                    <span className="text-[10px] text-gray-500">target {m.target}</span>
                    <Badge variant={m.status === 'success' ? 'success' : 'warning'} size="sm">{m.status === 'success' ? '✓' : '!'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
