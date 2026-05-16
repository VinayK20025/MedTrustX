'use client';

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileBarChart, Download, Calendar } from 'lucide-react';

const mockReports = [
  { id: 'RPT-1', name: 'Daily Dispensing Summary', date: '2026-05-01', type: 'Shift Report', records: 142, status: 'complete' },
  { id: 'RPT-2', name: 'Controlled Substance Log', date: '2026-05-01', type: 'Compliance', records: 8, status: 'complete' },
  { id: 'RPT-3', name: 'Near-Miss / Error Report', date: '2026-04-30', type: 'Safety', records: 1, status: 'flagged' },
  { id: 'RPT-4', name: 'Expired Stock Audit', date: '2026-04-30', type: 'Inventory', records: 3, status: 'complete' },
];

export function PharmacyReportsPanel({ roleLabel = 'Pharmacy' }: { roleLabel?: string }) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader
        title={`${roleLabel} Reports & Logs`}
        icon={<FileBarChart className="w-5 h-5 text-blue-400" />}
        action={
          <Button size="sm" variant="outline" leftIcon={<Calendar className="w-3.5 h-3.5" />}>
            Date Range
          </Button>
        }
      />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {mockReports.map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark hover:border-white/[0.12] transition-all">
              <FileBarChart className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{r.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.date} · {r.records} records</p>
              </div>
              <Badge variant={r.status === 'flagged' ? 'warning' : 'default'} size="sm">{r.type}</Badge>
              <Button size="sm" variant="ghost" leftIcon={<Download className="w-3 h-3" />}>Export</Button>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
