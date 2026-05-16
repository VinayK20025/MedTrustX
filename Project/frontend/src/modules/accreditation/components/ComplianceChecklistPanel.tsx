'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { StandardChapter, ComplianceChecklistItem } from '../types/accreditation.types';
import { useUpdateChecklistItem, useUploadEvidence } from '../hooks/useAccreditationAnalytics';
import { ClipboardCheck, CheckCircle2, XCircle, FilePlus2, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { chapters: StandardChapter[]; checklists: ComplianceChecklistItem[]; }

export function ComplianceChecklistPanel({ chapters, checklists }: Props) {
  const { mutate: updateStatus } = useUpdateChecklistItem();
  const { mutate: uploadEv } = useUploadEvidence();
  const [selectedChapter, setSelectedChapter] = useState<string>(chapters[0]?.code || '');

  const filteredItems = checklists.filter(c => c.chapterCode === selectedChapter);
  const activeChapter = chapters.find(c => c.code === selectedChapter);

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-emerald-400" /> Standard Assessment
        </h3>
      </CardHeader>

      <div className="flex border-b border-white/[0.04] overflow-x-auto px-2 scrollbar-hide">
        {chapters.map(ch => (
          <button key={ch.id} onClick={() => setSelectedChapter(ch.code)}
            className={cn('px-4 py-3 shrink-0 flex flex-col items-start gap-1 border-b-2 transition-all mr-1',
              selectedChapter === ch.code ? 'border-emerald-500 bg-white/[0.04]' : 'border-transparent hover:bg-white/[0.02]'
            )}>
            <div className="flex items-center gap-2">
              <span className={cn('text-[12px] font-black', selectedChapter === ch.code ? 'text-emerald-400' : 'text-gray-400')}>{ch.code}</span>
              <span className={cn('w-2 h-2 rounded-full', ch.status === 'Compliant' ? 'bg-success-light' : ch.status === 'At Risk' ? 'bg-warning-light' : 'bg-emergency-light')} />
            </div>
            <span className="text-[9px] text-gray-500 font-mono">{ch.completedItems}/{ch.totalItems} Met</span>
          </button>
        ))}
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="p-4 bg-black/20 border-b border-white/[0.04] flex justify-between items-center">
          <div>
            <h4 className="text-[13px] font-bold text-white">{activeChapter?.name}</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Overall Compliance: {activeChapter?.complianceRate}%</p>
          </div>
          <div className="w-16 h-2 bg-black/50 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${activeChapter?.complianceRate}%` }} />
          </div>
        </div>

        <div className="divide-y divide-white/[0.03]">
          {filteredItems.map(item => (
            <div key={item.id} className="p-4 transition-all hover:bg-white/[0.02]">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-black text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">{item.standard}</span>
                <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded border uppercase',
                  item.status === 'Met' ? 'bg-success/10 text-success-light border-success/30' :
                  item.status === 'Partially Met' ? 'bg-warning/10 text-warning-light border-warning/30' :
                  'bg-emergency/10 text-emergency-light border-emergency/30'
                )}>{item.status}</span>
              </div>
              <p className="text-[12px] text-gray-200 leading-relaxed font-semibold">{item.description}</p>
              
              <div className="mt-3 flex items-center justify-between">
                {item.evidenceDocument ? (
                  <div className="flex items-center gap-1.5 text-[10px] text-blue-300 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                    <Check className="w-3 h-3" /> Evidence: {item.evidenceDocument}
                  </div>
                ) : (
                  <Button size="sm" onClick={() => uploadEv({ id: item.id, file: null })}
                    className="h-7 text-[10px] bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10"
                    leftIcon={<FilePlus2 className="w-3 h-3" />}>Attach Evidence</Button>
                )}

                {item.status !== 'Met' && (
                  <div className="flex gap-1.5">
                    <button onClick={() => updateStatus({ id: item.id, status: 'Met' })} className="p-1.5 bg-success/10 hover:bg-success/20 text-success-light rounded transition-colors"><CheckCircle2 className="w-4 h-4" /></button>
                    <button onClick={() => updateStatus({ id: item.id, status: 'Not Met' })} className="p-1.5 bg-emergency/10 hover:bg-emergency/20 text-emergency-light rounded transition-colors"><XCircle className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
