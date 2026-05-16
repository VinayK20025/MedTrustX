'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { CultureSample, OrganismIdentification } from '../types/microbiology.types';
import { Microscope, ShieldAlert } from 'lucide-react';

interface Props { activeSample?: CultureSample; identifications: OrganismIdentification[]; }

export function MicrobiologyAnalysisPanel({ activeSample, identifications }: Props) {
  if (!activeSample) return null;

  const idents = identifications.filter(id => id.sampleId === activeSample.id);

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/15"><Microscope className="w-4 h-4 text-purple-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Organism Identification</h3>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">Sample: {activeSample.id}</div>
      </CardHeader>

      <CardBody className="p-5 flex-1 flex flex-col">
        {idents.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-[12px] font-bold">No organisms identified yet.</div>
        ) : (
          <div className="space-y-4">
            {idents.map((ident, i) => (
              <div key={i} className="border border-white/10 rounded-xl bg-surface-dark overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-start justify-between">
                  <div>
                    <h4 className="text-[14px] font-bold text-white flex items-center gap-2 italic">
                      {ident.organismName}
                      {ident.isMDR && <ShieldAlert className="w-4 h-4 text-emergency-light" />}
                    </h4>
                    {ident.isMDR && <div className="text-[10px] text-emergency-light font-bold mt-1 uppercase tracking-wider">Multi-Drug Resistant Isolate</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Confidence</div>
                    <div className="text-[14px] font-mono font-bold text-success-light">{ident.confidenceScore}%</div>
                  </div>
                </div>
                <div className="p-3 bg-black/20 flex justify-between text-[10px] font-mono text-gray-400">
                  <span>Detection Time: {ident.detectionTimeHours}h</span>
                  <span>Method: MALDI-TOF MS</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
