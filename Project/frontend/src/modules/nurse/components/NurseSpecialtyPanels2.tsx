'use client';

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, Scissors, ClipboardList, Stethoscope, ShieldCheck, Users, FlaskConical, FileText, CheckCircle2 } from 'lucide-react';

/* ─── OT Schedule ──────────────────────────────────────── */
export function OTSchedulePanel() {
  const surgeries = [
    { id: 'S-1', time: '14:00', patient: 'R. Johnson', procedure: 'Laparoscopic Cholecystectomy', surgeon: 'Dr. Williams', ot: 'OT-2', status: 'next' },
    { id: 'S-2', time: '16:30', patient: 'A. Patel', procedure: 'Total Knee Replacement', surgeon: 'Dr. Singh', ot: 'OT-1', status: 'scheduled' },
  ];
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="OT Schedule" icon={<Calendar className="w-5 h-5 text-blue-400" />} subtitle="Today's surgical list" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {surgeries.map(s => (
            <div key={s.id} className={`p-3 rounded-lg border bg-surface-dark ${s.status === 'next' ? 'border-teal-500/30' : 'border-white/[0.06]'}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-white">{s.time} — {s.procedure}</p>
                <Badge variant={s.status === 'next' ? 'info' : 'default'} size="sm">{s.status === 'next' ? 'Up Next' : 'Scheduled'}</Badge>
              </div>
              <p className="text-xs text-gray-400">{s.patient} · {s.surgeon} · {s.ot}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── OT Active Surgery ───────────────────────────────── */
export function OTActiveSurgeryPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Active Surgery" icon={<Scissors className="w-5 h-5 text-rose-400" />} subtitle="OT-3 · In Progress" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="p-4 rounded-lg border border-teal-500/30 bg-surface-dark mb-3">
          <p className="text-sm font-bold text-white">Appendectomy — M. Davis</p>
          <p className="text-xs text-gray-400 mt-1">Surgeon: Dr. Chen · Anesthetist: Dr. Rao</p>
          <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
            <div><span className="text-gray-500">Elapsed</span><br/><span className="text-white font-mono">01:22:40</span></div>
            <div><span className="text-gray-500">Blood Loss</span><br/><span className="text-white font-mono">~150 mL</span></div>
            <div><span className="text-gray-500">Phase</span><br/><span className="text-teal-300 font-semibold">Closure</span></div>
          </div>
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Instrument Count</p>
        <div className="flex gap-2">
          <Badge variant="success" size="sm">Sponges ✓</Badge>
          <Badge variant="success" size="sm">Needles ✓</Badge>
          <Badge variant="warning" size="sm">Instruments: Counting</Badge>
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── OT Pre-Op / Intra-Op / Post-Op Checklists ──────── */
export function OTChecklistPanel({ phase }: { phase: 'Pre-Op' | 'Intra-Op' | 'Post-Op' }) {
  const items: Record<string, string[]> = {
    'Pre-Op': ['Patient identity verified', 'Consent form signed', 'NPO status confirmed', 'Surgical site marked', 'Allergies reviewed', 'Blood type confirmed'],
    'Intra-Op': ['Time-out completed', 'Instrument count initiated', 'Specimens labeled', 'Fluid balance recorded', 'Drains documented'],
    'Post-Op': ['Patient to PACU', 'Handoff report given', 'Drain output recorded', 'Pain assessment done', 'Recovery vitals stable'],
  };
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title={`${phase} Checklist`} icon={<ClipboardList className="w-5 h-5 text-violet-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {items[phase].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-white/[0.06] bg-surface-dark">
              <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${i < 3 ? 'text-success' : 'text-gray-600'}`} />
              <p className={`text-sm ${i < 3 ? 'text-white' : 'text-gray-400'}`}>{item}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── Triage Assessment Form ──────────────────────────── */
export function TriageAssessmentPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Triage Assessment" icon={<Stethoscope className="w-5 h-5 text-teal-400" />} subtitle="ESI Scoring & Initial Assessment" />
      <CardBody className="flex-1 flex flex-col gap-3 overflow-y-auto">
        <div className="grid grid-cols-5 gap-2">
          {[1,2,3,4,5].map(esi => (
            <button key={esi} className={`p-3 rounded-lg border text-center text-sm font-bold transition-all hover:-translate-y-0.5 ${esi <= 2 ? 'border-emergency/30 text-emergency-light bg-emergency/5 hover:bg-emergency/10' : esi === 3 ? 'border-warning/30 text-warning-light bg-warning/5' : 'border-white/[0.06] text-gray-400 bg-surface-dark'}`}>
              ESI {esi}
            </button>
          ))}
        </div>
        <textarea placeholder="Chief complaint and initial assessment..." className="flex-1 min-h-[200px] w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-teal-500 transition-colors resize-none" />
        <Button className="w-full">Complete Triage</Button>
      </CardBody>
    </Card>
  );
}

/* ─── Triage Intake Form ─────────────────────────────── */
export function TriageIntakePanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Patient Intake" icon={<Users className="w-5 h-5 text-blue-400" />} subtitle="New patient registration" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 text-sm py-10 border border-dashed border-white/10 rounded-lg">
          Quick intake form for walk-in patients. Captures demographics, insurance, and presenting complaint.
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── Triage Routing Panel ────────────────────────────── */
export function TriageRoutingPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Patient Routing" icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />} subtitle="Department assignment" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {['ER Bay 1 — Cardiac', 'ER Bay 3 — Trauma', 'Minor Injuries — Bay 7', 'Fast Track — Room 2'].map((dest, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark hover:border-white/[0.12] transition-all cursor-pointer">
              <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-emergency' : i === 1 ? 'bg-warning' : 'bg-success'}`} />
              <p className="text-sm text-white font-medium flex-1">{dest}</p>
              <Badge variant={i < 2 ? 'danger' : 'default'} size="sm">{i < 2 ? 'High' : 'Normal'}</Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── Research Nurse Panels ───────────────────────────── */
export function ResearchVisitsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Study Visits" icon={<Calendar className="w-5 h-5 text-violet-400" />} subtitle="Scheduled protocol visits" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {[{ patient: 'Subject 001', visit: 'Week 12 — Follow-up', trial: 'CARDIO-RX Phase III', time: '14:00' }, { patient: 'Subject 004', visit: 'Screening Visit', trial: 'ONCO-AB Phase II', time: '15:30' }].map((v, i) => (
            <div key={i} className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
              <p className="text-sm font-semibold text-white">{v.patient} — {v.visit}</p>
              <p className="text-xs text-gray-400 mt-0.5">{v.trial} · {v.time}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export function ResearchCompliancePanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Protocol Compliance" icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <p className="text-sm text-white">CARDIO-RX Phase III</p>
            <Badge variant="success" size="sm">98% compliant</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <p className="text-sm text-white">ONCO-AB Phase II</p>
            <Badge variant="warning" size="sm">1 deviation</Badge>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function ResearchDataPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Data Collection" icon={<FlaskConical className="w-5 h-5 text-blue-400" />} subtitle="CRF entries and specimen tracking" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 text-sm py-10 border border-dashed border-white/10 rounded-lg">
          Case Report Form (CRF) entry, specimen labeling, and biobank tracking interface.
        </div>
      </CardBody>
    </Card>
  );
}
