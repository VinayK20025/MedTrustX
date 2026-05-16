'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SecurityIncident, GuardStatus } from '../types/security.types';
import { useDispatchGuard, useResolveSecurityIncident } from '../hooks/useSecurityAnalytics';
import { Video, AlertTriangle, CheckCircle2, UserCheck, ShieldAlert, Wifi } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { CameraFeed } from '../types/security.types';

interface Props { incidents: SecurityIncident[]; cameras: CameraFeed[]; guards: GuardStatus[]; }

export function SurveillanceWorkspace({ incidents, cameras, guards }: Props) {
  const { mutate: dispatch } = useDispatchGuard();
  const { mutate: resolve } = useResolveSecurityIncident();

  return (
    <Card className="border-red-500/20 shadow-glass bg-[#06030a] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-700 via-orange-600 to-red-700" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-bold text-white flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-400" /> Security Command Workspace</h3>
          <p className="text-[11px] text-gray-500 mt-1 font-mono">Live surveillance feeds & active incident response.</p>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">
        {/* Live Incidents */}
        {incidents.length > 0 && (
          <div className="p-5 border-b border-white/5">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-emergency-light" /> Active Incidents ({incidents.length})
            </h4>
            <div className="space-y-3">
              {incidents.map(inc => (
                <div key={inc.id} className={cn("border rounded-xl p-4 flex flex-col gap-3", inc.severity === 'High' ? "bg-emergency/[0.06] border-emergency/25" : "bg-warning/[0.04] border-warning/20")}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono text-gray-400">{inc.id} • {inc.location}</span>
                      <h5 className={cn("text-[14px] font-black mt-0.5", inc.severity === 'High' ? "text-emergency-light" : "text-warning-light")}>{inc.type}</h5>
                    </div>
                    <span className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider", inc.severity === 'High' ? "bg-emergency/20 text-emergency-light" : "bg-warning/20 text-warning-light")}>{inc.severity}</span>
                  </div>
                  <p className="text-[12px] text-gray-300">{inc.description}</p>
                  {inc.assignedGuard && (
                    <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                      <UserCheck className="w-3.5 h-3.5" /> <span className="font-bold">{inc.assignedGuard}</span> is responding
                    </div>
                  )}
                  <div className="flex gap-2 mt-1">
                    {!inc.assignedGuard && (
                      <Button size="sm" onClick={() => dispatch({ incidentId: inc.id, guardId: guards[0]?.id })} className="h-7 text-[10px] bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30" leftIcon={<UserCheck className="w-3 h-3" />}>Dispatch Guard</Button>
                    )}
                    <Button size="sm" onClick={() => resolve(inc.id)} className="h-7 text-[10px] bg-success/20 hover:bg-success/30 text-success-light border border-success/30" leftIcon={<CheckCircle2 className="w-3 h-3" />}>Mark Resolved</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CCTV Grid */}
        <div className="p-5 flex-1">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Live Camera Feeds</h4>
          <div className="grid grid-cols-3 gap-3">
            {cameras.map(cam => (
              <div key={cam.id} className={cn("rounded-xl overflow-hidden border relative group cursor-pointer", cam.status === 'Alert' ? "border-emergency/50" : cam.status === 'Offline' ? "border-white/10" : "border-white/10")}>
                {/* Simulated CCTV Feed */}
                <div className={cn("h-24 bg-gradient-to-br relative", cam.thumbnailColor)}>
                  {cam.status === 'Alert' && <div className="absolute inset-0 border-2 border-emergency/70 rounded-xl animate-pulse" />}
                  {cam.status === 'Offline' ? (
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-1">
                      <Video className="w-5 h-5 text-gray-600" />
                      <span className="text-[8px] text-gray-600 font-bold uppercase">OFFLINE</span>
                    </div>
                  ) : (
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                      <div className={cn("w-1.5 h-1.5 rounded-full", cam.status === 'Alert' ? "bg-red-500 animate-pulse" : "bg-emerald-400")} />
                      <span className="text-[8px] text-white/70 font-bold uppercase">{cam.status}</span>
                    </div>
                  )}
                  {/* Scan lines overlay for realism */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)' }} />
                </div>
                <div className="px-2 py-1.5 bg-black/60">
                  <p className={cn("text-[10px] font-bold", cam.status === 'Alert' ? "text-emergency-light" : "text-white")}>{cam.name}</p>
                  <p className="text-[9px] text-gray-500">{cam.zone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
