'use client';

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';

const mockAuditEntries = [
  { id: 'AUD-1', category: 'Narcotic Discrepancy', date: '2026-05-01', detail: 'Morphine 10mg — count mismatch Aisle 1, Shelf C', status: 'open', severity: 'critical' as const },
  { id: 'AUD-2', category: 'DEA Compliance', date: '2026-04-30', detail: 'Schedule II quarterly report submitted successfully', status: 'closed', severity: 'normal' as const },
  { id: 'AUD-3', category: 'Temperature Log', date: '2026-04-30', detail: 'Fridge 2 exceeded 8°C for 45 min — biologics alert', status: 'open', severity: 'warning' as const },
  { id: 'AUD-4', category: 'Controlled Access', date: '2026-04-29', detail: 'Unauthorized badge scan attempt — cabinet B3', status: 'closed', severity: 'critical' as const },
];

export function PharmacyCompliancePanel() {
  const openCount = mockAuditEntries.filter(a => a.status === 'open').length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Compliance & Audit Trail"
        icon={<ShieldCheck className="w-5 h-5 text-blue-400" />}
        subtitle={`${openCount} open finding${openCount !== 1 ? 's' : ''}`}
      />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {mockAuditEntries.map(a => (
            <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark hover:border-white/[0.12] transition-all">
              {a.status === 'closed' ? (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              ) : a.severity === 'critical' ? (
                <AlertTriangle className="w-5 h-5 text-emergency-light flex-shrink-0 mt-0.5" />
              ) : (
                <FileText className="w-5 h-5 text-warning-light flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{a.category}</p>
                  <Badge variant={a.status === 'open' ? (a.severity === 'critical' ? 'danger' : 'warning') : 'default'} size="sm">{a.status}</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">{a.detail}</p>
                <p className="text-[10px] text-gray-500 mt-1">{a.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
