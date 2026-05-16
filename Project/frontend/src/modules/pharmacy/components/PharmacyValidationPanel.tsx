'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, AlertTriangle, CheckCircle2, Search, ChevronRight } from 'lucide-react';

const mockValidations = [
  { id: 'V-1', rxId: 'RX-88220', patient: 'Jane Smith', drug: 'Metformin 500mg', flag: 'Dose Warning', severity: 'warning' as const, status: 'pending' },
  { id: 'V-2', rxId: 'RX-88221', patient: 'Robert Johnson', drug: 'Warfarin 5mg + Aspirin 75mg', flag: 'Drug Interaction', severity: 'critical' as const, status: 'pending' },
  { id: 'V-3', rxId: 'RX-88218', patient: 'Maria Garcia', drug: 'Amoxicillin 500mg', flag: 'Allergy Risk', severity: 'critical' as const, status: 'resolved' },
];

export function PharmacyValidationPanel() {
  const [search, setSearch] = useState('');
  const filtered = mockValidations.filter(v =>
    v.patient.toLowerCase().includes(search.toLowerCase()) || v.rxId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Clinical Validation Queue"
        icon={<ShieldCheck className="w-5 h-5 text-teal-400" />}
        subtitle={`${mockValidations.filter(v => v.status === 'pending').length} pending reviews`}
      />
      <CardBody className="flex-1 flex flex-col gap-3 overflow-y-auto">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient or Rx ID..."
            className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          {filtered.map(v => (
            <div key={v.id} className="group flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark hover:border-white/[0.12] transition-all cursor-pointer">
              {v.status === 'resolved' ? (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              ) : (
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${v.severity === 'critical' ? 'text-emergency-light' : 'text-warning-light'}`} />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{v.patient} — {v.rxId}</p>
                <p className="text-xs text-gray-400 mt-0.5">{v.drug}</p>
              </div>
              <Badge variant={v.severity === 'critical' ? 'danger' : 'warning'} size="sm">{v.flag}</Badge>
              <ChevronRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-10">No matching validation records.</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
