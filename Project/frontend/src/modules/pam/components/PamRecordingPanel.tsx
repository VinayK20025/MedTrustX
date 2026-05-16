'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PAMRecording } from '../types/pam.types';
import { Video, Play, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { recordings: PAMRecording[]; }

export function PamRecordingPanel({ recordings }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><Video className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Session Recordings</h3>
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto max-h-[400px]">
        <div className="space-y-3">
          {recordings.map(rec => (
            <div key={rec.id} className="p-4 rounded-xl border border-white/[0.06] bg-surface-dark flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {rec.user} <span className="text-[10px] font-normal text-gray-500">on</span> {rec.targetSystem}
                  {rec.anomalyDetected && <span className="bg-warning/20 text-warning-light text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Anomaly</span>}
                </h4>
                <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-3">
                  <span>{new Date(rec.date).toLocaleDateString()}</span>
                  <span>{rec.duration}</span>
                  <span>{rec.size}</span>
                </div>
              </div>
              <Button size="sm" variant="primary" leftIcon={<Play className="w-3 h-3" />} className="h-8 text-xs bg-blue-600 hover:bg-blue-500 border-none">
                Play
              </Button>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
