'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { TpaDocument, TpaCommunication } from '../types/tpa.types';
import { FileCheck, MessageSquare, Phone, Mail, Globe, Clock, CheckCircle2, AlertTriangle, Upload } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { documents: TpaDocument[]; logs: TpaCommunication[]; }

const docStatusStyle: Record<TpaDocument['status'], { icon: React.ReactNode; text: string }> = {
  Verified: { icon: <CheckCircle2 className="w-3.5 h-3.5 text-success-light" />, text: 'text-success-light' },
  Uploaded: { icon: <Clock className="w-3.5 h-3.5 text-blue-400" />, text: 'text-blue-300' },
  Missing:  { icon: <AlertTriangle className="w-3.5 h-3.5 text-warning-light" />, text: 'text-warning-light' },
};

const logTypeIcon: Record<TpaCommunication['type'], React.ReactNode> = {
  Call: <Phone className="w-3 h-3" />,
  Email: <Mail className="w-3 h-3" />,
  Portal: <Globe className="w-3 h-3" />,
  Note: <MessageSquare className="w-3 h-3" />,
};

export function TpaStatusPanel({ documents, logs }: Props) {
  const missingDocs = documents.filter(d => d.status === 'Missing');

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Document Checklist */}
      <Card className={cn("shadow-glass flex-[0.8] flex flex-col", missingDocs.length > 0 ? "border-warning/25" : "border-white/[0.06]")}>
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <h3 className="text-[12px] font-bold tracking-widest text-emerald-400">DOCUMENTS</h3>
          </div>
          {missingDocs.length > 0 && <span className="text-[9px] bg-warning/20 text-warning-light px-2 py-0.5 rounded font-bold uppercase">{missingDocs.length} Missing</span>}
        </CardHeader>
        <CardBody className="p-0 flex-1 overflow-y-auto">
          <div className="divide-y divide-white/[0.03]">
            {documents.map(d => {
              const st = docStatusStyle[d.status];
              return (
                <div key={d.id} className={cn("p-3 flex items-center justify-between", d.status === 'Missing' && "bg-warning/[0.03]")}>
                  <div>
                    <h4 className="text-[11px] font-bold text-white">{d.name}</h4>
                    <p className="text-[9px] text-gray-500 font-mono mt-0.5">{d.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[9px] font-bold flex items-center gap-1", st.text)}>{st.icon} {d.status}</span>
                    {d.status === 'Missing' && (
                      <Button size="sm" className="h-6 w-6 p-0 bg-white/5 hover:bg-white/10 text-gray-300 rounded"><Upload className="w-3 h-3" /></Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Communication Logs */}
      <Card className="border-white/[0.06] shadow-glass flex-1 flex flex-col">
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
          <h3 className="text-[12px] font-bold tracking-widest text-indigo-400">COMMUNICATION</h3>
        </CardHeader>
        <CardBody className="p-0 flex-1 overflow-y-auto">
          <div className="divide-y divide-white/[0.03]">
            {logs.map(log => (
              <div key={log.id} className={cn("p-3", log.direction === 'Inbound' ? "bg-indigo-500/[0.03]" : "")}>
                <div className="flex justify-between items-start mb-1.5">
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 w-fit", 
                    log.direction === 'Inbound' ? "bg-indigo-500/20 text-indigo-300" : "bg-white/10 text-gray-300"
                  )}>
                    {logTypeIcon[log.type]} {log.direction}
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-[11px] text-white leading-relaxed">{log.summary}</p>
                <p className="text-[9px] text-gray-600 font-mono mt-1">by {log.user}</p>
              </div>
            ))}
          </div>
        </CardBody>
        <div className="p-2 border-t border-white/5">
          <Button className="w-full h-8 bg-white/5 hover:bg-white/10 text-gray-300 text-[11px]">Add Log</Button>
        </div>
      </Card>
    </div>
  );
}
