'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ComplianceAudit } from '../types/biomedical.types';
import { FileBadge, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { audits: ComplianceAudit[]; }

export function BiomedicalCompliancePanel({ audits }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/15"><FileBadge className="w-4 h-4 text-emerald-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Compliance Audits</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="divide-y divide-white/[0.03]">
          {audits.map(audit => (
            <div key={audit.id} className="p-5 hover:bg-white/[0.015] transition-colors flex items-center justify-between">
              <div>
                <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                  {audit.deviceId}
                  {(audit.status === 'Expiring' || audit.status === 'Expired') && <AlertTriangle className="w-3.5 h-3.5 text-warning-light" />}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] uppercase font-bold text-gray-500">Body: {audit.certificationBody}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  audit.status === 'Valid' ? 'bg-success/20 text-success-light' : 
                  audit.status === 'Expiring' ? 'bg-warning/20 text-warning-light' : 'bg-emergency/20 text-emergency-light'
                )}>
                  {audit.status}
                </span>
                <span className="text-[10px] font-mono text-gray-400">Exp: {new Date(audit.expiryDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
