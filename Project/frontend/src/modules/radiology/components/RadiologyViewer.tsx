'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ImagingStudy } from '../types/radiology.types';
import { Scan, MousePointer2, Maximize, Target, Sun } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activeStudy?: ImagingStudy; }

export function RadiologyViewer({ activeStudy }: Props) {
  if (!activeStudy) return null;

  return (
    <Card className="border-indigo-500/30 shadow-glass bg-[#050505] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 animate-pulse" />
      <CardHeader className="border-b border-white/[0.04] p-3 flex items-center justify-between bg-black/50">
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-indigo-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-gray-300">DIAGNOSTIC VIEWER</h3>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-gray-500">
           <span className="text-white">{activeStudy.patientName}</span>
           <span>{activeStudy.patientId}</span>
           <span>{activeStudy.modality} {activeStudy.bodyPart}</span>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex">
        {/* Toolbar */}
        <div className="w-12 border-r border-white/5 bg-black/40 flex flex-col items-center py-4 gap-4">
           <button className="p-2 rounded hover:bg-white/10 text-indigo-400 bg-indigo-500/20"><MousePointer2 className="w-4 h-4" /></button>
           <button className="p-2 rounded hover:bg-white/10 text-gray-400"><Sun className="w-4 h-4" /></button>
           <button className="p-2 rounded hover:bg-white/10 text-gray-400"><Maximize className="w-4 h-4" /></button>
           <button className="p-2 rounded hover:bg-white/10 text-gray-400"><Target className="w-4 h-4" /></button>
        </div>
        
        {/* Main Canvas Area (Simulated) */}
        <div className="flex-1 relative flex items-center justify-center bg-[#0a0a0a] overflow-hidden group cursor-crosshair">
          {/* Simulated CT Scan View */}
          <div className="w-[400px] h-[400px] rounded-full border border-white/10 bg-gradient-to-tr from-gray-900 via-gray-700 to-gray-900 flex items-center justify-center relative opacity-80 mix-blend-screen">
             {/* Simulated Anomaly */}
             <div className="absolute top-[35%] right-[30%] w-8 h-10 bg-white/40 blur-sm rounded-full" />
             <div className="absolute top-[35%] right-[30%] w-12 h-12 border border-emergency-light/50 border-dashed rounded-full animate-pulse" />
          </div>
          
          {/* Viewport Overlay Info */}
          <div className="absolute top-4 left-4 text-[10px] font-mono text-white/50 leading-tight">
             <p>WW: 80 WL: 40</p>
             <p>Zoom: 1.2x</p>
             <p>ST: 5.0mm</p>
          </div>
          <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/50">
             <p>Slice: 128 / {activeStudy.imageCount}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
