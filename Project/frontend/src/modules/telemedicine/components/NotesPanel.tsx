'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Calendar, ClipboardCheck, History } from 'lucide-react';
import { cn } from '@/utils/cn';

export function NotesPanel() {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col relative">
      <CardHeader className="border-b border-white/[0.04] p-4">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" /> Clinical Notes
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">
        <div className="p-4 space-y-4 flex-1">
          {/* Diagnosis Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Diagnosis</label>
            <textarea 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 min-h-[100px] resize-none"
              placeholder="Enter clinical diagnosis..."
            />
          </div>

          {/* Advice/Notes Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Patient Advice</label>
            <textarea 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 min-h-[120px] resize-none"
              placeholder="Instructions for the patient..."
            />
          </div>

          {/* Follow-up Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Follow-up</label>
            <div className="flex gap-2">
              <Button size="sm" className="bg-white/5 border-white/10 text-[11px] flex-1 hover:bg-white/10" leftIcon={<Calendar className="w-3.5 h-3.5" />}>
                Schedule Next
              </Button>
              <Button size="sm" className="bg-white/5 border-white/10 text-[11px] flex-1 hover:bg-white/10" leftIcon={<ClipboardCheck className="w-3.5 h-3.5" />}>
                Referral
              </Button>
            </div>
          </div>
        </div>

        {/* Patient History Preview */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <History className="w-3.5 h-3.5" /> Recent History
          </h4>
          <div className="space-y-2">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
              <p className="text-[11px] text-white font-bold">12 Apr 2024</p>
              <p className="text-[10px] text-gray-400">Seasonal allergies, prescribed Antihistamines.</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
              <p className="text-[11px] text-white font-bold">05 Jan 2024</p>
              <p className="text-[10px] text-gray-400">Routine checkup, BP stable.</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/40">
          <Button className="w-full h-10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-[12px]" leftIcon={<ClipboardCheck className="w-3.5 h-3.5" />}>
            Finalize Consultation
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
