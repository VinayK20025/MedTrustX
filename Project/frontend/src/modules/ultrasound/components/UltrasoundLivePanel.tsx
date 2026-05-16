'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { UltrasoundQueue, LiveScanState } from '../types/ultrasound.types';
import { useCaptureFrame, useToggleScan } from '../hooks/useUltrasoundAnalytics';
import { Camera, Pause, Play, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activePatient?: UltrasoundQueue; liveState: LiveScanState; }

export function UltrasoundLivePanel({ activePatient, liveState }: Props) {
  const { mutate: toggleScan, isPending: isToggling } = useToggleScan();
  const { mutate: captureFrame, isPending: isCapturing } = useCaptureFrame();

  if (!activePatient) return null;

  return (
    <Card className="border-teal-500/30 shadow-glass bg-[#050505] h-full flex flex-col font-mono relative overflow-hidden">
      <div className={cn("absolute top-0 left-0 w-1 h-full", liveState.isScanning ? "bg-teal-500 animate-pulse" : "bg-gray-600")} />
      <CardHeader className="border-b border-white/[0.04] p-3 flex items-center justify-between bg-black/50">
        <div className="flex items-center gap-2">
          <Activity className={cn("w-4 h-4", liveState.isScanning ? "text-teal-400" : "text-gray-500")} />
          <h3 className={cn("text-[13px] font-bold tracking-widest", liveState.isScanning ? "text-teal-400" : "text-gray-500")}>
             {liveState.isScanning ? 'LIVE ACQUISITION' : 'SCAN FROZEN'}
          </h3>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-gray-500">
           <span className="text-white">{activePatient.patientName}</span>
           <span>Frames: {liveState.capturedFrames}</span>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col relative">
        {/* Live Canvas Area (Simulated Ultrasound Feed) */}
        <div className="flex-1 bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden cursor-crosshair group">
           
           {/* Simulated Ultrasound Cone */}
           <div className={cn("w-[400px] h-[300px] bg-gradient-to-b from-gray-700 via-gray-900 to-black rounded-t-full relative opacity-60 mix-blend-screen transition-opacity", !liveState.isScanning && "opacity-20")}>
              {liveState.isScanning && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse mix-blend-overlay" />}
           </div>

           {/* Telemetry Overlays */}
           <div className="absolute top-4 left-4 text-[10px] text-teal-500/70 font-mono leading-relaxed pointer-events-none">
              <p>TIS: 0.2 TIB: 0.2</p>
              <p>MI: 0.9</p>
              <p>FR: 32Hz</p>
           </div>
           
           <div className="absolute top-4 right-4 text-[10px] text-teal-500/70 font-mono text-right leading-relaxed pointer-events-none">
              <p>Mode: {liveState.currentMode}</p>
              <p>Depth: {liveState.depthCm} cm</p>
              <p>Gain: {liveState.gainPercent}%</p>
           </div>
        </div>

        {/* Hardware Controls */}
        <div className="p-4 bg-black/60 border-t border-white/[0.04] flex items-center justify-between">
           <Button 
             onClick={() => toggleScan(!liveState.isScanning)}
             disabled={isToggling}
             className={cn("w-32 font-bold", liveState.isScanning ? "bg-warning-600 hover:bg-warning-500 text-white border-none" : "bg-teal-600 hover:bg-teal-500 text-white border-none")}
             leftIcon={liveState.isScanning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
           >
             {liveState.isScanning ? 'Freeze' : 'Unfreeze'}
           </Button>

           <Button 
             onClick={() => captureFrame(activePatient.id)}
             disabled={isCapturing || !liveState.isScanning}
             className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 border-none shadow-[0_0_10px_rgba(255,255,255,0.1)] active:scale-95"
             leftIcon={<Camera className="w-4 h-4" />}
           >
             Capture Frame
           </Button>
        </div>
      </CardBody>
    </Card>
  );
}
