'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { SurgicalLog } from '../types/circulator.types';
import { FileClock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { logs: SurgicalLog[]; }

export function CirculatorDocumentationPanel({ logs }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><FileClock className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Surgical Event Logs</h3>
        </div>
        <Button size="sm" variant="ghost" leftIcon={<Plus className="w-3 h-3" />} className="text-gray-400 hover:text-white">
          Add Entry
        </Button>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="divide-y divide-white/[0.03]">
          {logs.map(log => (
            <div key={log.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[13px] font-bold text-white">{log.eventType}</h4>
                <span className="text-[10px] text-gray-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-[11px] text-gray-400 italic mb-2">"{log.notes}"</p>
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Logged By: {log.loggedBy}</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
