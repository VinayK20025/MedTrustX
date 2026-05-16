'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { DispatchAlert } from '../types/ambulance.types';
import { useUpdateDispatchStatus, useTriggerEmergencyHorn } from '../hooks/useAmbulanceAnalytics';
import { Navigation2, Mic, AlertTriangle, CheckCircle2, Siren, Radio } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { dispatch: DispatchAlert | null; }

export function AmbulanceNavigationWorkspace({ dispatch }: Props) {
  const { mutate: updateStatus } = useUpdateDispatchStatus();
  const { mutate: soundHorn } = useTriggerEmergencyHorn();

  if (!dispatch) {
    return (
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center">
        <Navigation2 className="w-16 h-16 text-gray-600 mb-4 opacity-50" />
        <h3 className="text-gray-400 font-bold text-lg">GPS Offline</h3>
        <p className="text-gray-500 text-[12px] mt-1">Awaiting dispatch coordinates...</p>
      </Card>
    );
  }

  return (
    <Card className="border-blue-500/20 shadow-glass bg-[#020504] h-full flex flex-col relative overflow-hidden">
      
      {/* MOCK GPS MAP BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #020504 0%, transparent 100%), repeating-linear-gradient(0deg, transparent, transparent 19px, #1e3a8a 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #1e3a8a 20px)' }}>
         {/* Blinking location dot */}
         <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6] animate-ping" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <CardHeader className="border-b border-white/[0.04] p-5 bg-black/60 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[16px] font-black text-white flex items-center gap-2">
                <Navigation2 className="w-5 h-5 text-blue-400" /> GPS Navigation Live
              </h3>
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-success-light animate-pulse" /> Transmitting Live Location to ER</p>
            </div>
            <Button onClick={() => soundHorn()} size="sm" className="bg-emergency/20 text-emergency-light border border-emergency/40 hover:bg-emergency/30 h-9" leftIcon={<Siren className="w-4 h-4" />}>ER Incoming Alert</Button>
          </div>
        </CardHeader>

        <CardBody className="p-0 flex-1 flex flex-col">
          {/* Main Map View Area (Transparent) */}
          <div className="flex-1 flex flex-col items-center justify-center p-6">
             {dispatch.priority === 'Critical' && (
                <div className="bg-emergency/10 border-2 border-emergency/40 p-4 rounded-full animate-bounce mb-8 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                  <AlertTriangle className="w-12 h-12 text-emergency-light" />
                </div>
             )}
             <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl text-center shadow-2xl max-w-sm w-full">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Current Instruction</span>
                <h2 className="text-[28px] font-black text-white leading-tight mb-2">Turn Left on<br/>Outer Ring Road</h2>
                <p className="text-[14px] text-emerald-400 font-bold">2.4 km remaining</p>
             </div>
          </div>

          {/* DRIVER ACTION BAR (Massive Touch Targets) */}
          <div className="bg-black/80 backdrop-blur-xl border-t border-white/[0.05] p-5">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center mb-3">Update Mission Status</p>
            
            <div className="grid grid-cols-1 gap-3">
              {dispatch.status === 'Pending Accept' && (
                <Button onClick={() => updateStatus({ id: dispatch.id, status: 'En Route to Pickup' })} className="w-full h-16 text-[16px] font-black bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 hover:bg-emerald-500/30">ACCEPT & START NAVIGATION</Button>
              )}
              
              {dispatch.status === 'En Route to Pickup' && (
                <Button onClick={() => updateStatus({ id: dispatch.id, status: 'At Scene' })} className="w-full h-16 text-[16px] font-black bg-blue-500/20 text-blue-400 border-2 border-blue-500/40 hover:bg-blue-500/30">REACHED PICKUP SCENE</Button>
              )}

              {dispatch.status === 'At Scene' && (
                <Button onClick={() => updateStatus({ id: dispatch.id, status: 'Patient Onboard' })} className="w-full h-16 text-[16px] font-black bg-orange-500/20 text-orange-400 border-2 border-orange-500/40 hover:bg-orange-500/30">PATIENT SECURED ONBOARD</Button>
              )}

              {dispatch.status === 'Patient Onboard' && (
                <Button onClick={() => updateStatus({ id: dispatch.id, status: 'Completed' })} className="w-full h-16 text-[16px] font-black bg-success/20 text-success-light border-2 border-success/40 hover:bg-success/30">ARRIVED AT HOSPITAL ER</Button>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-center">
              <Button size="sm" className="bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white rounded-full px-6" leftIcon={<Mic className="w-4 h-4" />}>Hold for Voice Command</Button>
            </div>
          </div>
        </CardBody>
      </div>
    </Card>
  );
}
