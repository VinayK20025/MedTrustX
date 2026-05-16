'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { HospitalLicense, ComplianceViolation } from '../types/legal-compliance.types';
import { useInitiateLicenseRenewal, useResolveViolation } from '../hooks/useLegalComplianceAnalytics';
import { ShieldAlert, AlertTriangle, FileWarning, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { licenses: HospitalLicense[]; violations: ComplianceViolation[]; }

const severityColor = { Critical: 'text-emergency-light bg-emergency/[0.05] border-emergency/30', High: 'text-orange-400 bg-orange-500/[0.05] border-orange-500/30', Medium: 'text-warning-light bg-warning/[0.05] border-warning/30' };

export function ComplianceRiskPanel({ licenses, violations }: Props) {
  const { mutate: renew } = useInitiateLicenseRenewal();
  const { mutate: resolve } = useResolveViolation();

  const activeViolations = violations.filter(v => v.status !== 'Resolved');
  const criticalLicenses = licenses.filter(l => l.status !== 'Active');

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-purple-400" /> Statutory Risks & Alerts
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        
        {/* Violations Feed */}
        <div className="p-4 space-y-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Active Violations</p>
          {activeViolations.length === 0 && <p className="text-[12px] text-gray-500 italic">No active regulatory violations.</p>}
          {activeViolations.map(vio => (
            <div key={vio.id} className={cn('rounded-xl border p-4 transition-all', severityColor[vio.severity])}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">{vio.severity} Priority</span>
                <span className="text-[9px] text-gray-400">{new Date(vio.detectedAt).toLocaleDateString()}</span>
              </div>

              <h4 className="text-[13px] font-bold text-white mt-1 leading-snug">{vio.issue}</h4>
              
              <div className="mt-3 p-2.5 bg-black/30 rounded-lg border border-black/20">
                <p className="text-[9px] uppercase font-bold opacity-60 mb-0.5">Penalty Risk</p>
                <p className="text-[11px] font-bold text-emergency-light">{vio.penaltyRisk}</p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-current/10">
                <span className="text-[10px] font-bold opacity-80">{vio.department} • {vio.status}</span>
                <Button size="sm" onClick={() => resolve({ id: vio.id, notes: 'Resolved' })} className="h-7 text-[9px] bg-white/10 hover:bg-white/20 border-transparent text-current" leftIcon={<CheckCircle2 className="w-3 h-3" />}>Mark Resolved</Button>
              </div>
            </div>
          ))}
        </div>

        {/* Expiring Licenses */}
        <div className="p-4 border-t border-white/[0.04] bg-black/20 space-y-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1"><FileWarning className="w-3 h-3" /> License Watchlist</p>
          {criticalLicenses.map(lic => (
            <div key={lic.id} className={cn('rounded-xl border p-3 flex flex-col gap-2 transition-all',
              lic.status === 'Expired' ? 'bg-emergency/[0.05] border-emergency/30' : 'bg-warning/[0.04] border-warning/30'
            )}>
              <div className="flex justify-between items-start">
                <span className="text-[13px] font-bold text-white">{lic.name}</span>
                <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded uppercase shrink-0',
                  lic.status === 'Expired' ? 'bg-emergency/20 text-emergency-light border border-emergency/30 animate-pulse' : 'bg-warning/20 text-warning-light border border-warning/30'
                )}>{lic.status}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                <span>Exp: {new Date(lic.expiryDate).toLocaleDateString()}</span>
                {lic.renewalStatus === 'In Progress' || lic.renewalStatus === 'Submitted' ? (
                  <span className="text-blue-300 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> {lic.renewalStatus}</span>
                ) : (
                  <Button size="sm" onClick={() => renew(lic.id)} className="h-6 px-2 text-[9px] bg-white/10 hover:bg-white/20 text-white border-transparent">Initiate Renewal</Button>
                )}
              </div>
            </div>
          ))}
        </div>

      </CardBody>
    </Card>
  );
}
