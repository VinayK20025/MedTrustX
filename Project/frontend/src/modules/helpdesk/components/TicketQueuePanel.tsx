'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { SupportTicket, TicketPriority } from '../types/helpdesk.types';
import { Ticket, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { tickets: SupportTicket[]; selectedId?: string; onSelect: (id: string) => void; }

const priorityColor: Record<TicketPriority, string> = {
  Low: 'bg-gray-500/20 text-gray-400',
  Medium: 'bg-blue-500/20 text-blue-300',
  High: 'bg-orange-500/20 text-orange-400',
  Critical: 'bg-emergency/20 text-emergency-light border border-emergency/30',
};

export function TicketQueuePanel({ tickets, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-purple-500/15"><Ticket className="w-4 h-4 text-purple-400" /></div>
          <h3 className="text-[14px] font-bold text-white tracking-wide">Support Queue</h3>
        </div>
        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">{tickets.length} Pending</span>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {tickets.map(tkt => {
            const isBreached = new Date() > new Date(tkt.slaBreachAt);
            return (
              <div key={tkt.id} onClick={() => onSelect(tkt.id)}
                className={cn("p-4 cursor-pointer transition-all border-l-4 relative group",
                  selectedId === tkt.id ? "bg-purple-500/[0.08] border-l-purple-500" :
                  tkt.priority === 'Critical' ? "bg-emergency/[0.02] border-l-emergency hover:bg-emergency/[0.05]" :
                  "border-l-transparent hover:bg-white/[0.02]"
                )}>
                <div className="flex justify-between items-start mb-2">
                  <div className="pr-2">
                    <span className="text-[9px] text-gray-500 font-mono block mb-0.5">{tkt.id} • {tkt.category}</span>
                    <h4 className="text-[13px] font-bold text-white group-hover:text-purple-300 transition-colors">{tkt.title}</h4>
                  </div>
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', priorityColor[tkt.priority])}>{tkt.priority}</span>
                </div>
                
                <p className="text-[11px] text-gray-400 line-clamp-1 mb-2">{tkt.description}</p>
                
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[10px] text-gray-500">From: <span className="text-gray-300">{tkt.reporter}</span></span>
                  {isBreached ? (
                    <span className="flex items-center gap-1 text-[9px] text-emergency-light font-bold bg-emergency/10 px-2 py-0.5 rounded animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> SLA BREACH
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] text-gray-400 font-mono">
                      <Clock className="w-3 h-3" /> {new Date(tkt.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
