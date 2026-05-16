'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { NutritionEducationMaterial } from '../types/nutrition.types';
import { BookOpen, Video, FileText, Link as LinkIcon } from 'lucide-react';

interface Props { materials: NutritionEducationMaterial[]; }

export function NutritionEducationPanel({ materials }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/15"><BookOpen className="w-4 h-4 text-purple-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Diet Guidelines</h3>
        </div>
      </CardHeader>

      <CardBody className="p-4 flex-1 overflow-y-auto max-h-[300px] space-y-3">
        {materials.map(mat => (
          <div key={mat.id} className="p-3 bg-surface-dark border border-white/[0.04] rounded-xl flex items-start justify-between group hover:bg-white/[0.02] transition-colors">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-1.5 rounded bg-white/5 text-gray-400">
                {mat.format === 'Video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-[12px] font-bold text-white group-hover:text-purple-300 transition-colors">{mat.title}</h4>
                <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400">{mat.category}</span>
                <p className="text-[11px] text-gray-500 mt-1">{mat.description}</p>
              </div>
            </div>
            <Button size="xs" variant="ghost" className="text-gray-400 hover:text-white" leftIcon={<LinkIcon className="w-3 h-3" />}>
              Share
            </Button>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
