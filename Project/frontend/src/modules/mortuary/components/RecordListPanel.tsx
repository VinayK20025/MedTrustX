'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { DeceasedRecord } from '../types/mortuary.types';
import { useVerifyIdentity } from '../hooks/useMortuaryAnalytics';
import { UserX, ShieldAlert, FileWarning, CheckCircle2, ScanLine, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { records: DeceasedRecord[]; selectedId?: string; onSelect: (id: string) => void; }

const statusBorder: Record<string, string> = {
  'In Storage': 'border-blue-500 bg-blue-500/[0.04]',
  'Release Pending': 'border-warning bg-warning/[0.04]',
  'Released': 'border-success bg-success/[0.04]',
  'Police Case': 'border-red-600 bg-red-600/[0.06]',
};

export function RecordListPanel({ records, selectedId, onSelect }: Props) {
  const { mutate: verifyId } = useVerifyIdentity();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <UserX className="w-4 h-4 text-gray-400" /> Deceased Records
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{records.length} Records</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {records.map(r => (
            <div key={r.id} onClick={() => onSelect(r.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                statusBorder[r.status],
                selectedId === r.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-400">{r.tagId}</span>
                {r.policeCase && (
                  <span className="text-[9px] font-bold bg-red-600/20 text-red-400 px-1.5 py-0.5 rounded border border-red-600/30 flex items-center gap-1">
                    <ShieldAlert className="w-2.5 h-2.5" /> POLICE CASE
                  </span>
                )}
              </div>

              <h4 className="text-[14px] font-bold text-white mb-0.5">{r.name}</h4>
              <p className="text-[10px] text-gray-400">{r.age}y {r.gender} • {r.source}</p>
              <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{r.causeOfDeath}</p>

              {/* Identity Verification Status */}
              <div className="flex items-center gap-2 mt-2 text-[10px]">
                {r.identityVerified ? (
                  <span className="text-success-light font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> ID Verified</span>
                ) : (
                  <Button onClick={(e) => { e.stopPropagation(); verifyId(r.id); }} size="sm" className="bg-emergency/10 text-emergency-light border-emergency/30 text-[9px] h-6 hover:bg-emergency/20" leftIcon={<ScanLine className="w-2.5 h-2.5" />}>Verify ID</Button>
                )}
              </div>

              {/* Missing Docs */}
              {r.missingDocs.length > 0 && (
                <div className="flex items-center gap-1 mt-2 text-[9px] text-warning-light font-bold">
                  <FileWarning className="w-3 h-3" /> Missing: {r.missingDocs.join(', ')}
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-white/5">
                <span className="text-gray-500">Slot: <strong className="text-gray-300">{r.storageSlot}</strong></span>
                <span className={cn('font-bold uppercase tracking-wider',
                  r.status === 'Released' ? 'text-success-light' :
                  r.status === 'Police Case' ? 'text-red-400' :
                  r.status === 'Release Pending' ? 'text-warning-light' : 'text-gray-400'
                )}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
