'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { Annotation } from '../types/radiology.types';
import { PenTool } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { annotations: Annotation[]; }

export function RadiologyAnnotationPanel({ annotations }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><PenTool className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Image Markups</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        {annotations.length === 0 ? (
           <div className="p-8 text-center text-[12px] text-gray-500 font-bold">No measurements or ROIs added.</div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {annotations.map(ann => (
              <div key={ann.id} className="p-4 hover:bg-white/[0.015] transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-[13px] font-bold text-white">{ann.label}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">{ann.type}</p>
                  </div>
                  <span className="text-[14px] font-mono font-bold text-teal-400">
                    {ann.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
