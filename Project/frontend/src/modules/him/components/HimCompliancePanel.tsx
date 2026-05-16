'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ComplianceViolation } from '../types/him.types';
import { useResolveViolation } from '../hooks/useHimAnalytics';
import { ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { violations: ComplianceViolation[]; }

export function HimCompliancePanel({ violations }: Props) {
  const { mutate: resolve, isPending } = useResolveViolation();
  const active = violations.filter(v => v.status !== 'Resolved');

  return (
    <Card className={cn("shadow-glass h-full flex flex-col bg-surface-light", active.length > 0 ? "border-emergency/40" : "border-white/[0.06]")}>
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg relative", active.length > 0 ? "bg-emergency/20" : "bg-white/5")}>
            <ShieldAlert className={cn("w-4 h-4", active.length > 0 ? "text-emergency-light animate-pulse" : "text-gray-400")} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Compliance Audit Alerts</h3>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        {active.length === 0 ? (
           <div className="p-8 text-center text-[12px] text-gray-500 font-bold">No active compliance violations.</div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {active.map(vio => (
              <div key={vio.id} className={cn("p-4 border-l-2 flex flex-col gap-3", 
                vio.severity === 'Critical' ? 'bg-emergency/[0.05] border-emergency' : 'bg-warning/[0.05] border-warning'
              )}>
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={cn("text-[13px] font-bold flex items-center gap-2", vio.severity === 'Critical' ? 'text-emergency-light' : 'text-warning-light')}>
                      {vio.category} Violation
                    </h4>
                    <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 font-mono">{vio.department}</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{vio.description}</p>
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  <span className="flex items-center gap-1 text-[9px] text-gray-500 font-mono"><Clock className="w-3 h-3" /> {new Date(vio.timestamp).toLocaleTimeString()}</span>
                  <Button 
                    size="sm" 
                    disabled={isPending}
                    onClick={() => resolve({ violationId: vio.id, notes: 'Reviewed and resolved by HIM.' })}
                    className="bg-surface-dark border border-white/10 hover:bg-white/5 text-[10px] h-7"
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5"/>}
                  >
                    Clear Audit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
