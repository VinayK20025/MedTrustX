'use client';

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tag, Printer, Package, ArrowRightLeft } from 'lucide-react';

const mockLabels = [
  { id: 'LBL-1', rxId: 'RX-88220', drug: 'Metformin 500mg Tab', patient: 'Jane Smith', qty: 60, printed: false },
  { id: 'LBL-2', rxId: 'RX-88219', drug: 'Amoxicillin 500mg Cap', patient: 'John Doe', qty: 21, printed: true },
  { id: 'LBL-3', rxId: 'RX-88221', drug: 'Warfarin 5mg Tab', patient: 'Robert Johnson', qty: 30, printed: false },
];

export function PharmacyTechLabelingPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Label Queue" icon={<Tag className="w-5 h-5 text-violet-400" />} subtitle={`${mockLabels.filter(l => !l.printed).length} labels pending`} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {mockLabels.map(l => (
            <div key={l.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark hover:border-white/[0.12] transition-all">
              <Tag className={`w-4 h-4 flex-shrink-0 ${l.printed ? 'text-success' : 'text-violet-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{l.drug} × {l.qty}</p>
                <p className="text-xs text-gray-400">{l.patient} · {l.rxId}</p>
              </div>
              <Badge variant={l.printed ? 'success' : 'default'} size="sm">{l.printed ? 'Printed' : 'Pending'}</Badge>
              {!l.printed && <Button size="sm" variant="ghost" leftIcon={<Printer className="w-3 h-3" />}>Print</Button>}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export function PharmacyTechPackingPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Packing Workflow" icon={<Package className="w-5 h-5 text-amber-400" />} subtitle="Active packing tasks" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {mockLabels.map(l => (
            <div key={l.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark hover:border-white/[0.12] transition-all">
              <Package className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{l.rxId} — {l.patient}</p>
                <p className="text-xs text-gray-400">{l.drug} × {l.qty}</p>
              </div>
              <Button size="sm" variant="outline">Pack & Seal</Button>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export function PharmacyTechHandoverPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Pharmacist Handover Queue" icon={<ArrowRightLeft className="w-5 h-5 text-teal-400" />} subtitle="Ready for pharmacist final check" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {mockLabels.filter(l => l.printed).map(l => (
            <div key={l.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark hover:border-white/[0.12] transition-all">
              <ArrowRightLeft className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{l.rxId} — {l.patient}</p>
                <p className="text-xs text-gray-400">Labeled, packed, awaiting pharmacist verification</p>
              </div>
              <Button size="sm">Hand Over</Button>
            </div>
          ))}
          {mockLabels.filter(l => l.printed).length === 0 && (
            <div className="text-center text-gray-500 text-sm py-10">No items ready for handover yet.</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
