'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AuditSummary } from '../types/cmo.types';
import { FileSearch } from 'lucide-react';

interface AuditPanelProps {
  data: AuditSummary;
}

export function AuditPanel({ data }: AuditPanelProps) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Audit & Compliance</h3>
          <p className="text-xs text-gray-400 mt-0.5">Clinical governance summary</p>
        </div>
        <FileSearch className="w-5 h-5 text-indigo-400 opacity-50" />
      </CardHeader>
      
      <CardBody className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] mb-6">
          <div className="text-center w-full">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Protocol Compliance</p>
            <p className={`text-3xl font-black font-mono ${data.complianceScore >= 90 ? 'text-success-light' : 'text-warning-light'}`}>
              {data.complianceScore}%
            </p>
          </div>
          <div className="w-px h-10 bg-white/10 mx-4" />
          <div className="text-center w-full">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Pending Audits</p>
            <p className="text-3xl font-black text-indigo-400 font-mono">
              {data.pendingAudits}
            </p>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">Recent Protocol Flags</p>
          <div className="space-y-2">
            {data.recentFlags.map((flag) => (
              <div key={flag.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors cursor-pointer group">
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{flag.type}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{flag.ward} • {new Date(flag.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs h-7 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
