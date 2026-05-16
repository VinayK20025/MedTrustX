'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSubmitOpinion } from '../hooks/useConsultantAnalytics';
import { Send, MessageSquare, FileCheck, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { selectedCaseId?: string; }

export function OpinionPanel({ selectedCaseId }: Props) {
  const { mutate: submitOpinion, isPending } = useSubmitOpinion();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col relative">
      <CardHeader className="border-b border-white/[0.04] p-4">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-green-400" /> Expert Opinion
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">
        <div className="p-4 space-y-4 flex-1">
          {/* Diagnosis Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Clinical Impression</label>
            <textarea
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 min-h-[100px] resize-none"
              placeholder="Enter your clinical assessment and diagnostic impression..."
            />
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recommendations</label>
            <textarea
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 min-h-[120px] resize-none"
              placeholder="Treatment recommendations, further investigations, or management plan..."
            />
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Response Urgency</label>
            <div className="flex gap-2">
              {['Immediate', 'Within 24h', 'Routine'].map(u => (
                <button key={u} className="flex-1 px-2 py-2 rounded-lg text-[11px] font-bold border border-white/10 bg-white/[0.02] text-gray-400 hover:bg-white/[0.05] transition-colors">
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Communication Thread Preview */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" /> Communication Thread
          </h4>
          <div className="space-y-2">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
              <div className="flex justify-between">
                <p className="text-[11px] text-blue-400 font-bold">Dr. S. Mehta</p>
                <span className="text-[9px] text-gray-500 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> 2h ago</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Requesting urgent second opinion on CABG candidacy given renal impairment.</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="p-4 border-t border-white/5 bg-black/40">
          <Button
            disabled={!selectedCaseId}
            onClick={() => selectedCaseId && submitOpinion({ caseId: selectedCaseId, opinion: {} })}
            className={cn('w-full h-12 text-[13px] font-bold border',
              selectedCaseId ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-white/5 text-gray-500 border-white/10 cursor-not-allowed'
            )} leftIcon={<Send className="w-4 h-4" />}>
            Submit Expert Opinion
          </Button>
          <p className="text-[9px] text-gray-600 text-center mt-2">Opinion will be digitally signed, timestamped, and shared with the referring physician.</p>
        </div>
      </CardBody>
    </Card>
  );
}
