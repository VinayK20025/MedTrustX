'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { LearningProtocol } from '../types/jr.types';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { protocols: LearningProtocol[]; }

export function JRLearningPanel({ protocols }: Props) {
  return (
    <Card className="border-teal-500/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2 bg-teal-500/5">
        <BookOpen className="w-5 h-5 text-teal-400" />
        <h3 className="text-lg font-semibold text-teal-300 tracking-wide">Embedded Learning</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {protocols.map(p => (
          <div key={p.id} className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-white">{p.title}</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">{p.category}</span>
            </div>
            <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">{p.summary}</p>
            <Button size="sm" variant="outline" className="w-full h-7 text-[10px] border-white/10 text-gray-300 hover:bg-white/5">
              Read Protocol
            </Button>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
