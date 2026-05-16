'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { MaintenanceLog } from '../types/otTech.types';
import { ClipboardSignature, Plus } from 'lucide-react';

interface Props { logs: MaintenanceLog[]; }

export function OTTechMaintenancePanel({ logs }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><ClipboardSignature className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Maintenance Logs</h3>
        </div>
        <Button size="sm" variant="ghost" leftIcon={<Plus className="w-3 h-3" />} className="text-gray-400 hover:text-white">
          Log Repair
        </Button>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="divide-y divide-white/[0.03]">
          {logs.map(log => (
            <div key={log.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[13px] font-bold text-white">{log.deviceId}</h4>
                <span className="text-[10px] text-gray-500 font-mono">{new Date(log.date).toLocaleDateString()}</span>
              </div>
              
              <div className="bg-surface-dark border border-white/[0.04] p-3 rounded-lg mb-3 space-y-2">
                <p className="text-[10px] text-gray-400"><span className="text-emergency-light font-bold">Issue:</span> {log.issue}</p>
                <p className="text-[10px] text-gray-400"><span className="text-success-light font-bold">Resolution:</span> {log.resolution}</p>
              </div>

              <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                <span>Tech: {log.performedBy}</span>
                <span>Duration: {log.timeSpentMinutes} mins</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
