'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { InternTask } from '../types/intern.types';
import { ClipboardList, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { tasks: InternTask[]; }

export function InternTaskPanel({ tasks }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-teal-400" />
        <h3 className="text-lg font-semibold text-white tracking-wide">Assisted Tasks & Drafts</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {tasks.map(t => (
          <div key={t.id} className="p-3 rounded-lg border border-white/[0.04] bg-surface-dark/50 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-white">{t.title}</span>
              {t.status === 'draft_submitted' && <span className="text-[9px] uppercase font-bold bg-warning/20 text-warning-light px-1.5 py-0.5 rounded flex items-center gap-1"><Clock className="w-3 h-3"/> Pending Review</span>}
              {t.status === 'approved' && <span className="text-[9px] uppercase font-bold bg-success/20 text-success-light px-1.5 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Approved</span>}
              {t.status === 'pending' && <span className="text-[9px] uppercase font-bold bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">To Do</span>}
            </div>
            <div className="flex justify-between items-end mt-1 text-[10px]">
              <span className="text-gray-400">Patient: {t.patientName}</span>
              <span className="text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded">Sup: {t.supervisor}</span>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
