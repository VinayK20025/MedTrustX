'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { Camera, FeedLayout } from '../types/cctv.types';
import { Grid2x2, Grid3x3, Maximize2, Camera as CameraIcon, WifiOff, ZapOff } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { cameras: Camera[]; focusedId?: string; onFocus: (id: string) => void; }

export function LiveFeedGrid({ cameras, focusedId, onFocus }: Props) {
  const [layout, setLayout] = useState<FeedLayout>(9);

  const gridClass: Record<FeedLayout, string> = {
    4: 'grid-cols-2',
    9: 'grid-cols-3',
    16: 'grid-cols-4',
  };

  const displayCameras = cameras.slice(0, layout);

  return (
    <Card className="border-white/[0.06] shadow-glass bg-[#030408] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-700" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CameraIcon className="w-4 h-4 text-purple-400" />
          <h3 className="text-[14px] font-bold text-white">Live Feed — Control Room</h3>
          <div className="flex items-center gap-1 ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Recording</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg p-1">
          {([4, 9, 16] as FeedLayout[]).map(l => (
            <button key={l} onClick={() => setLayout(l)}
              className={cn('px-3 py-1 rounded text-[10px] font-bold transition-colors flex items-center gap-1',
                layout === l ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              )}>
              {l === 4 ? <Grid2x2 className="w-3 h-3" /> : l === 9 ? <Grid3x3 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              {l}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardBody className="p-3 flex-1 overflow-hidden">
        <div className={cn('grid gap-2 h-full', gridClass[layout])}>
          {displayCameras.map(cam => (
            <div key={cam.id} onClick={() => onFocus(cam.id)}
              className={cn('relative rounded-xl overflow-hidden cursor-pointer group border transition-all',
                focusedId === cam.id ? 'border-purple-500/60 ring-1 ring-purple-500/40' :
                cam.status === 'Alert' ? 'border-emergency/50 hover:border-emergency/80' :
                cam.status === 'Offline' ? 'border-white/5 opacity-50' :
                'border-white/[0.06] hover:border-white/20'
              )}>
              {/* Simulated feed background */}
              <div className={cn('absolute inset-0 bg-gradient-to-br', cam.gradientClass)} />

              {/* Scan-line overlay for realism */}
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)' }} />

              {/* Alert overlay pulse */}
              {cam.status === 'Alert' && (
                <div className="absolute inset-0 border-2 border-emergency/70 rounded-xl animate-pulse pointer-events-none" />
              )}

              {/* Offline overlay */}
              {cam.status === 'Offline' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-1">
                  <WifiOff className="w-5 h-5 text-gray-500" />
                  <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">No Signal</span>
                </div>
              )}

              {/* Status badge top-left */}
              <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded">
                <div className={cn('w-1.5 h-1.5 rounded-full',
                  cam.status === 'Online' ? 'bg-emerald-400' :
                  cam.status === 'Alert' ? 'bg-emergency-light animate-pulse' : 'bg-gray-600'
                )} />
                <span className="text-[8px] text-white/80 font-bold uppercase">{cam.status}</span>
              </div>

              {/* Camera ID top-right */}
              <div className="absolute top-1.5 right-1.5 bg-black/60 px-1.5 py-0.5 rounded">
                <span className="text-[8px] text-gray-400 font-mono">{cam.id}</span>
              </div>

              {/* Name bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-2 py-2">
                <p className={cn('text-[10px] font-bold truncate', cam.status === 'Alert' ? 'text-emergency-light' : 'text-white')}>{cam.name}</p>
                <p className="text-[8px] text-gray-500">{cam.zone}</p>
              </div>

              {/* Expand on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                <Maximize2 className="w-6 h-6 text-white/80" />
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
