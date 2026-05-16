'use client';

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Activity, Heart, Bed, ArrowRightLeft, Shield, Syringe } from 'lucide-react';

/* ─── ICU Live Vitals ──────────────────────────────────── */
export function ICULiveVitalsPanel() {
  const patients = [
    { id: 'I-1', bed: 'ICU-1', name: 'M. Garcia', hr: 112, bp: '90/58', spo2: 92, etco2: 38, map: 69, vent: 'CMV', status: 'critical' },
    { id: 'I-2', bed: 'ICU-3', name: 'R. Johnson', hr: 78, bp: '120/80', spo2: 98, etco2: 35, map: 93, vent: 'CPAP', status: 'stable' },
    { id: 'I-3', bed: 'ICU-5', name: 'A. Patel', hr: 95, bp: '100/65', spo2: 95, etco2: 41, map: 77, vent: 'BiPAP', status: 'warning' },
  ];
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Live ICU Monitoring" icon={<Activity className="w-5 h-5 text-emerald-400" />} subtitle={`${patients.length} beds active`} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {patients.map(p => (
            <div key={p.id} className={`p-3 rounded-lg border bg-surface-dark ${p.status === 'critical' ? 'border-emergency/30' : 'border-white/[0.06]'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-white">{p.bed} — {p.name}</p>
                <Badge variant={p.status === 'critical' ? 'danger' : p.status === 'warning' ? 'warning' : 'success'} size="sm">{p.status}</Badge>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                <div><span className="text-gray-500">HR</span><br/><span className="text-white font-mono">{p.hr}</span></div>
                <div><span className="text-gray-500">BP</span><br/><span className="text-white font-mono">{p.bp}</span></div>
                <div><span className="text-gray-500">SpO₂</span><br/><span className="text-white font-mono">{p.spo2}%</span></div>
                <div><span className="text-gray-500">EtCO₂</span><br/><span className="text-white font-mono">{p.etco2}</span></div>
                <div><span className="text-gray-500">MAP</span><br/><span className="text-white font-mono">{p.map}</span></div>
                <div><span className="text-gray-500">Vent</span><br/><span className="text-white font-mono">{p.vent}</span></div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── ICU Care & Meds ──────────────────────────────────── */
export function ICUCareMedsPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="ICU Care & Medications" icon={<Syringe className="w-5 h-5 text-violet-400" />} subtitle="Infusions, drips, and interventions" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <div className="p-3 rounded-lg border border-emergency/30 bg-surface-dark">
            <p className="text-sm font-semibold text-white">ICU-1 — Norepinephrine 0.1 mcg/kg/min</p>
            <p className="text-xs text-gray-400">Titrating for MAP &gt;65 · Started 4 hrs ago</p>
            <Badge variant="danger" size="sm" className="mt-1">Active Drip</Badge>
          </div>
          <div className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <p className="text-sm font-semibold text-white">ICU-3 — Propofol 25 mcg/kg/min</p>
            <p className="text-xs text-gray-400">Sedation for ventilation · RASS target -2</p>
            <Badge variant="warning" size="sm" className="mt-1">Active Drip</Badge>
          </div>
          <div className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <p className="text-sm font-semibold text-white">ICU-5 — Heparin 1000 units/hr</p>
            <p className="text-xs text-gray-400">DVT prophylaxis · aPTT due in 2 hrs</p>
            <Badge variant="default" size="sm" className="mt-1">Active Drip</Badge>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── ICU Patient Detail ──────────────────────────────── */
export function ICUPatientDetailPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Patient Detail" icon={<Bed className="w-5 h-5 text-blue-400" />} subtitle="Select a patient to view full chart" />
      <CardBody className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500 text-sm py-10 border border-dashed border-white/10 rounded-lg px-8">
          Select a patient from the ICU grid to view their detailed chart, ventilator settings, and nursing assessments.
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── ER Triage Queue ──────────────────────────────────── */
export function ERTriageQueuePanel() {
  const queue = [
    { id: 'E-1', name: 'Walk-in #42', complaint: 'Chest pain, diaphoresis', esi: 1, arrival: '3 min ago' },
    { id: 'E-2', name: 'Walk-in #43', complaint: 'Laceration right forearm', esi: 3, arrival: '8 min ago' },
    { id: 'E-3', name: 'Ambulance #12', complaint: 'MVA — GCS 12', esi: 2, arrival: '1 min ago' },
  ];
  const esiColors: Record<number, string> = { 1: 'danger', 2: 'danger', 3: 'warning', 4: 'default', 5: 'default' };
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="ER Triage Queue" icon={<Shield className="w-5 h-5 text-rose-400" />} subtitle={`${queue.length} awaiting triage`} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {queue.sort((a, b) => a.esi - b.esi).map(q => (
            <div key={q.id} className={`flex items-center gap-3 p-3 rounded-lg border bg-surface-dark ${q.esi <= 2 ? 'border-emergency/30' : 'border-white/[0.06]'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${q.esi <= 2 ? 'bg-emergency/20 text-emergency-light' : 'bg-white/5 text-gray-300'}`}>ESI {q.esi}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{q.name}</p>
                <p className="text-xs text-gray-400">{q.complaint}</p>
              </div>
              <span className="text-[10px] text-gray-500">{q.arrival}</span>
              <Button size="sm">Triage</Button>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── ER Emergency Care ────────────────────────────────── */
export function EREmergencyCarePanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Emergency Care" icon={<Heart className="w-5 h-5 text-rose-400" />} subtitle="Active emergency interventions" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <div className="p-3 rounded-lg border border-emergency/30 bg-surface-dark">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-bold text-white">Bay 1 — Chest Pain Protocol</p>
              <Badge variant="danger" size="sm">STAT</Badge>
            </div>
            <p className="text-xs text-gray-400">12-lead ECG obtained · Troponin pending · ASA 325mg given</p>
          </div>
          <div className="p-3 rounded-lg border border-warning/30 bg-surface-dark">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-bold text-white">Bay 3 — Trauma Assessment</p>
              <Badge variant="warning" size="sm">Active</Badge>
            </div>
            <p className="text-xs text-gray-400">MVA patient · C-spine cleared · CT abdomen pending</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/* ─── ER Transfer Panel ────────────────────────────────── */
export function ERTransferPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Transfers & Dispositions" icon={<ArrowRightLeft className="w-5 h-5 text-teal-400" />} subtitle="Pending bed assignments" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <ArrowRightLeft className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <div className="flex-1"><p className="text-sm text-white font-medium">Bay 1 → ICU Admission</p><p className="text-xs text-gray-400">Awaiting ICU bed · cardiology consult</p></div>
            <Badge variant="warning" size="sm">Pending</Badge>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <ArrowRightLeft className="w-4 h-4 text-success flex-shrink-0" />
            <div className="flex-1"><p className="text-sm text-white font-medium">Bay 5 → Discharge</p><p className="text-xs text-gray-400">Discharge instructions printed</p></div>
            <Badge variant="success" size="sm">Ready</Badge>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
