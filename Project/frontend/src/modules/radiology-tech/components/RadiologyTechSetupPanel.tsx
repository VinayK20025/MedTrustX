'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ImagingPatientQueue, ImagingProtocol } from '../types/radiologyTech.types';
import { Settings2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activePatient?: ImagingPatientQueue; protocols: ImagingProtocol[]; }

export function RadiologyTechSetupPanel({ activePatient, protocols }: Props) {
  if (!activePatient) return null;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-orange-400" />
          <h3 className="text-[15px] font-bold text-white tracking-wide">Protocol Selection</h3>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">Patient: {activePatient.mrn}</div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="p-4 bg-white/[0.02] border-b border-white/5">
           <h4 className="text-[14px] font-bold text-white mb-1">Order Details</h4>
           <p className="text-[12px] text-gray-400">{activePatient.modality} - {activePatient.bodyPart}</p>
        </div>

        <div className="divide-y divide-white/[0.03]">
          {protocols.filter(p => p.modality === activePatient.modality).map(prot => (
            <div key={prot.id} className="p-5 hover:bg-white/[0.015] transition-colors cursor-pointer border-l-2 border-transparent hover:border-orange-500">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[13px] font-bold text-white">{prot.name}</h4>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400 font-mono">{prot.id}</span>
              </div>
              <p className="text-[11px] text-gray-400 mb-4">{prot.description}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                 {prot.parameters.kVp && <div className="bg-surface-dark p-2 rounded border border-white/5 text-center"><span className="block text-gray-500 mb-1">kVp</span><span className="text-white font-bold">{prot.parameters.kVp}</span></div>}
                 {prot.parameters.mA && <div className="bg-surface-dark p-2 rounded border border-white/5 text-center"><span className="block text-gray-500 mb-1">mA</span><span className="text-white font-bold">{prot.parameters.mA}</span></div>}
                 {prot.parameters.sliceThickness && <div className="bg-surface-dark p-2 rounded border border-white/5 text-center"><span className="block text-gray-500 mb-1">Slice</span><span className="text-white font-bold">{prot.parameters.sliceThickness}</span></div>}
                 {prot.parameters.durationMinutes && <div className="bg-surface-dark p-2 rounded border border-white/5 text-center"><span className="block text-gray-500 mb-1">Duration</span><span className="text-white font-bold">{prot.parameters.durationMinutes}m</span></div>}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
