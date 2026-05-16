'use client';

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Activity, Beaker, Send } from 'lucide-react';

export function ClinicalPharmacyCommunicationPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Physician Communication" icon={<MessageSquare className="w-5 h-5 text-blue-400" />} subtitle="Drug therapy recommendations & clinical notes" />
      <CardBody className="flex-1 flex flex-col gap-3 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <div className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="info" size="sm">Recommendation</Badge>
              <p className="text-xs text-gray-400">To Dr. Chen · 12 min ago</p>
            </div>
            <p className="text-sm text-white">Recommend switching from Ciprofloxacin to Levofloxacin for Bed 14-B due to QTc prolongation risk with concurrent amiodarone.</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="success" size="sm">Accepted</Badge>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning" size="sm">Pending Review</Badge>
              <p className="text-xs text-gray-400">To Dr. Patel · 1 hr ago</p>
            </div>
            <p className="text-sm text-white">Vancomycin trough level 22.4 µg/mL — exceeds therapeutic range. Suggest dose reduction to 750mg Q12H.</p>
          </div>
        </div>
        <div className="mt-auto pt-3 border-t border-white/[0.06]">
          <div className="flex gap-2">
            <input
              placeholder="Type recommendation..."
              className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
            />
            <Button leftIcon={<Send className="w-4 h-4" />}>Send</Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function ClinicalPharmacyMonitoringPanel() {
  const monitoringItems = [
    { id: 'M-1', patient: 'Bed 14-B — R. Johnson', drug: 'Vancomycin IV', metric: 'Trough Level', lastValue: '22.4 µg/mL', target: '10-20 µg/mL', status: 'critical' as const },
    { id: 'M-2', patient: 'Bed 8-A — S. Patel', drug: 'Warfarin 5mg', metric: 'INR', lastValue: '2.8', target: '2.0-3.0', status: 'normal' as const },
    { id: 'M-3', patient: 'Bed 22-C — M. Garcia', drug: 'Gentamicin IV', metric: 'Peak/Trough', lastValue: 'Due in 2hr', target: 'Peak 5-10', status: 'pending' as const },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Therapeutic Drug Monitoring" icon={<Activity className="w-5 h-5 text-emerald-400" />} subtitle="Active lab-based monitoring" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {monitoringItems.map(m => (
            <div key={m.id} className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark hover:border-white/[0.12] transition-all">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{m.patient}</p>
                <Badge variant={m.status === 'critical' ? 'danger' : m.status === 'pending' ? 'warning' : 'success'} size="sm">{m.status}</Badge>
              </div>
              <p className="text-xs text-gray-400 mt-1">{m.drug} — {m.metric}</p>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="text-white font-mono">Last: {m.lastValue}</span>
                <span className="text-gray-500">Target: {m.target}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export function ClinicalPharmacyTherapyPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Therapy Optimization" icon={<Beaker className="w-5 h-5 text-violet-400" />} subtitle="Dose adjustments & regimen changes" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <div className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-white">IV → PO Conversion</p>
              <Badge variant="info" size="sm">3 candidates</Badge>
            </div>
            <p className="text-xs text-gray-400">Patients stable for 48+ hrs on IV antibiotics eligible for oral step-down.</p>
            <Button size="sm" variant="outline" className="mt-2">Review Patients</Button>
          </div>
          <div className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-white">Renal Dose Adjustment</p>
              <Badge variant="warning" size="sm">1 alert</Badge>
            </div>
            <p className="text-xs text-gray-400">Bed 22-C CrCl dropped to 38 mL/min — Gentamicin dose needs recalculation.</p>
            <Button size="sm" variant="outline" className="mt-2">Adjust Dose</Button>
          </div>
          <div className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-white">Antibiotic Stewardship</p>
              <Badge variant="default" size="sm">5 reviews</Badge>
            </div>
            <p className="text-xs text-gray-400">Patients on broad-spectrum for &gt;72hrs — culture results available for de-escalation.</p>
            <Button size="sm" variant="outline" className="mt-2">View List</Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
