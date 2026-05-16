'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { EmergencyCall, AmbulanceUnit } from '../types/amb-coordinator.types';
import { useAssignAmbulance } from '../hooks/useAmbCoordinatorAnalytics';
import { Map, MapPin, Radio, Siren } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { call: EmergencyCall | null; fleet: AmbulanceUnit[]; }

export function LiveDispatchMap({ call, fleet }: Props) {
  const { mutate: assignUnit } = useAssignAmbulance();

  const availableUnits = fleet.filter(u => u.status === 'Available');

  return (
    <Card className="border-blue-500/20 shadow-glass bg-[#020504] h-full flex flex-col relative overflow-hidden">
      
      {/* MOCK GPS MAP BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #020504 0%, transparent 100%), repeating-linear-gradient(0deg, transparent, transparent 19px, #1e3a8a 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #1e3a8a 20px)' }}>
         {/* Blinking hospital base */}
         <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-emerald-500 rounded-full shadow-[0_0_25px_#10b981] opacity-50 flex items-center justify-center text-white text-[10px] font-bold">H</div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <CardHeader className="border-b border-white/[0.04] p-4 bg-black/60 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[14px] font-black text-white flex items-center gap-2">
                <Map className="w-4 h-4 text-blue-400" /> Command Center Live Map
              </h3>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-success-light bg-success/10 px-2 py-0.5 rounded border border-success/20 animate-pulse">
               <Radio className="w-3 h-3" /> Live Tracking
            </span>
          </div>
        </CardHeader>

        <CardBody className="p-0 flex-1 flex flex-col justify-between">

          {/* Map View Area (Transparent) */}
          <div className="flex-1 relative">
             {call && call.status === 'Pending Dispatch' && (
                <div className="absolute top-1/3 left-1/3 bg-emergency/20 border-2 border-emergency/40 p-2 rounded-full animate-bounce shadow-[0_0_30px_rgba(239,68,68,0.3)] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emergency-light" />
                  <span className="text-[10px] font-bold text-emergency-light whitespace-nowrap bg-black/80 px-2 py-0.5 rounded">{call.location}</span>
                </div>
             )}
          </div>

          {/* DISPATCH ACTION BAR */}
          {call && (
             <div className="bg-black/80 backdrop-blur-xl border-t border-white/[0.05] p-5">
               <div className="mb-4">
                 <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Target Mission Details</span>
                 <h2 className="text-[18px] font-black text-white">{call.condition} at {call.location}</h2>
               </div>
               
               {call.status === 'Pending Dispatch' ? (
                 <>
                   <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Available Units (Auto-Suggested)</p>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     {availableUnits.map(unit => (
                       <Button key={unit.id} onClick={() => assignUnit({ callId: call.id, unitId: unit.id })} className="h-12 bg-white/5 border border-white/10 hover:bg-white/10 text-white flex flex-col items-start px-3 py-1">
                          <span className="text-[12px] font-black">{unit.callSign}</span>
                          <span className="text-[9px] text-gray-400">{unit.currentLocation}</span>
                       </Button>
                     ))}
                   </div>
                 </>
               ) : (
                 <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Siren className="w-5 h-5 text-blue-400" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Unit Dispatched</p>
                          <p className="text-[14px] font-bold text-white">Ambulance is En Route to scene.</p>
                       </div>
                    </div>
                    <Button className="bg-white/5 border-white/10 hover:bg-white/10 text-white">View Telemetry</Button>
                 </div>
               )}
             </div>
          )}
        </CardBody>
      </div>
    </Card>
  );
}
