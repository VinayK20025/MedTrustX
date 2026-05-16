'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ImagingPatientQueue, ImagingDeviceStatus } from '../types/radiologyTech.types';
import { useStartScan } from '../hooks/useRadiologyTechAnalytics';
import { Power, Radio } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activePatient?: ImagingPatientQueue; devices: ImagingDeviceStatus[]; }

export function RadiologyTechExecutionPanel({ activePatient, devices }: Props) {
  const { mutate: startScan, isPending } = useStartScan();

  const targetDevice = activePatient ? devices.find(d => d.modality === activePatient.modality) : null;

  return (
    <Card className="border-emergency-500/30 shadow-glass bg-[#050505] h-full flex flex-col font-mono relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-emergency animate-pulse" />
      <CardHeader className="border-b border-white/[0.04] p-3 flex items-center justify-between bg-black/50">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emergency-light" />
          <h3 className="text-[13px] font-bold tracking-widest text-emergency-light">SCAN EXECUTION</h3>
        </div>
      </CardHeader>

      <CardBody className="p-6 flex-1 flex flex-col items-center justify-center relative">
        {!activePatient || !targetDevice ? (
          <div className="text-center text-gray-500 text-[12px] font-bold">Select a patient and protocol to arm scanner.</div>
        ) : (
          <>
            <div className="absolute top-4 right-4 text-right">
               <div className="text-[10px] text-gray-500 tracking-widest mb-1">TARGET DEVICE</div>
               <div className="text-[12px] font-bold text-white">{targetDevice.name}</div>
               <div className={cn("text-[10px] uppercase font-bold mt-1", targetDevice.status === 'Ready' ? 'text-success-light' : 'text-warning-light')}>{targetDevice.status}</div>
            </div>

            <div className="text-center mb-8">
               <div className="text-[14px] text-gray-400 tracking-widest mb-2">ARMED FOR</div>
               <div className="text-2xl font-black text-white">{activePatient.patientName}</div>
               <div className="text-[14px] text-orange-400 font-bold mt-2">{activePatient.modality} - {activePatient.bodyPart}</div>
            </div>

            <Button 
              onClick={() => startScan({ patientId: activePatient.id, protocolId: 'PROT-CT-1', deviceId: targetDevice.id })}
              disabled={isPending || targetDevice.status !== 'Ready'}
              className="w-48 h-48 rounded-full bg-emergency-600 hover:bg-emergency-500 border-4 border-emergency-800 shadow-[0_0_30px_rgba(239,68,68,0.3)] flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:bg-gray-800 disabled:border-gray-700"
            >
              <Power className="w-12 h-12 text-white" />
              <span className="text-[14px] font-black text-white tracking-widest mt-2">INITIATE<br/>SCAN</span>
            </Button>
            
            <p className="text-[10px] text-gray-500 mt-8 text-center max-w-xs">Ensure patient is correctly positioned and personnel are clear of the imaging room before initiating radiation exposure.</p>
          </>
        )}
      </CardBody>
    </Card>
  );
}
