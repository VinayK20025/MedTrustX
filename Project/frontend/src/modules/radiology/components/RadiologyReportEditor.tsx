'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ImagingStudy, DiagnosticReport } from '../types/radiology.types';
import { useFinalizeReport } from '../hooks/useRadiologyAnalytics';
import { Mic, FileSignature, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activeStudy?: ImagingStudy; draft?: DiagnosticReport; }

export function RadiologyReportEditor({ activeStudy, draft }: Props) {
  const { mutate: finalize, isPending } = useFinalizeReport();
  const [isCritical, setIsCritical] = useState(draft?.isCritical ?? false);

  if (!activeStudy) return null;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><Mic className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Dictation & Reporting</h3>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-[11px] text-gray-300 font-bold cursor-pointer">
            <input type="checkbox" checked={isCritical} onChange={(e) => setIsCritical(e.target.checked)} className="form-checkbox bg-black border-white/20 text-emergency-light rounded" />
            Flag as Critical Finding
          </label>
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto">
        <div>
          <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Findings</label>
          <textarea 
            className="w-full h-24 bg-surface-dark border border-white/10 rounded-xl p-3 text-[13px] text-gray-200 resize-none focus:outline-none focus:border-blue-500/50"
            defaultValue={draft?.findings}
            placeholder="Describe imaging findings here..."
          />
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Impression (Conclusion)</label>
          <textarea 
            className="w-full h-20 bg-surface-dark border border-white/10 rounded-xl p-3 text-[13px] text-white font-bold resize-none focus:outline-none focus:border-blue-500/50"
            defaultValue={draft?.impression}
            placeholder="1. Primary diagnosis..."
          />
        </div>

        <div className="flex justify-end mt-auto pt-4 border-t border-white/[0.04]">
          <Button onClick={() => finalize({ id: activeStudy.id, report: { studyId: activeStudy.id, findings: '', impression: '', isCritical, status: 'Final' }})} disabled={isPending} className={cn("text-white font-bold", isCritical ? "bg-emergency-600 hover:bg-emergency-500" : "bg-blue-600 hover:bg-blue-500")} leftIcon={isCritical ? <AlertTriangle className="w-4 h-4"/> : <FileSignature className="w-4 h-4"/>}>
            {isCritical ? 'Finalize & Send Critical Alert' : 'Sign & Finalize Report'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
