'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Inspection } from '../types/reg-inspector.types';
import { useGenerateInspectionReport } from '../hooks/useInspectorAnalytics';
import { Shield, FileDown, AlertTriangle, MapPin, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { inspections: Inspection[]; selectedId?: string; onSelect: (id: string) => void; }

const typeColor: Record<string, string> = { Scheduled: 'text-blue-300 bg-blue-500/15', Surprise: 'text-red-300 bg-red-500/15', 'Follow-Up': 'text-purple-300 bg-purple-500/15' };
const statusBorder: Record<string, string> = { Planned: 'border-gray-500 bg-gray-500/[0.04]', 'In Progress': 'border-amber-500 bg-amber-500/[0.04]', 'Report Pending': 'border-blue-500 bg-blue-500/[0.04]', Closed: 'border-success bg-success/[0.04]' };

export function InspectionListPanel({ inspections, selectedId, onSelect }: Props) {
  const { mutate: genReport } = useGenerateInspectionReport();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-400" /> Inspections
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{inspections.length} Records</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {inspections.map(ins => (
            <div key={ins.id} onClick={() => onSelect(ins.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                statusBorder[ins.status],
                selectedId === ins.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-400">{ins.id}</span>
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider', typeColor[ins.type])}>{ins.type}</span>
              </div>

              <h4 className="text-[13px] font-bold text-white mb-0.5">{ins.facility}</h4>
              <p className="text-[10px] text-gray-400 mb-2">{ins.scope}</p>

              {/* Compliance Score */}
              {ins.complianceScore > 0 && (
                <div className="mb-2">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-gray-500">Compliance</span>
                    <span className={cn('font-mono font-bold', ins.complianceScore >= 85 ? 'text-success-light' : ins.complianceScore >= 70 ? 'text-warning-light' : 'text-emergency-light')}>{ins.complianceScore}%</span>
                  </div>
                  <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                    <div className={cn('h-full transition-all', ins.complianceScore >= 85 ? 'bg-emerald-500' : ins.complianceScore >= 70 ? 'bg-warning' : 'bg-emergency')} style={{ width: `${ins.complianceScore}%` }} />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-white/5">
                <span className="text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(ins.date).toLocaleDateString()}</span>
                {ins.violationsFound > 0 ? (
                  <span className="text-emergency-light flex items-center gap-1 font-bold"><AlertTriangle className="w-3 h-3" /> {ins.violationsFound} violations</span>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </div>

              {ins.status === 'Report Pending' && (
                <Button onClick={(e) => { e.stopPropagation(); genReport(ins.id); }} size="sm" className="mt-2 w-full bg-blue-500/10 text-blue-400 border-blue-500/30 text-[9px] h-7 hover:bg-blue-500/20" leftIcon={<FileDown className="w-2.5 h-2.5" />}>Generate Report</Button>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
