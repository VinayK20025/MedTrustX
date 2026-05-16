'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { SupportTicket } from '../types/helpdesk.types';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { tickets: SupportTicket[]; }

export function SlaStatusPanel({ tickets }: Props) {
  const now = new Date();
  
  // Calculate SLA metrics
  const activeTickets = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed');
  const breachedTickets = activeTickets.filter(t => now > new Date(t.slaBreachAt));
  const atRiskTickets = activeTickets.filter(t => {
    const breachTime = new Date(t.slaBreachAt).getTime();
    const timeRemaining = breachTime - now.getTime();
    return timeRemaining > 0 && timeRemaining < 3600000; // Less than 1 hour remaining
  });

  return (
    <Card className={cn("shadow-glass h-full flex flex-col", breachedTickets.length > 0 ? "border-emergency/30" : "border-white/[0.06]")}>
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {breachedTickets.length > 0 ? <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" /> : <Clock className="w-4 h-4 text-purple-400" />}
          <h3 className={cn("text-[13px] font-bold tracking-widest uppercase", breachedTickets.length > 0 ? "text-emergency-light" : "text-purple-400")}>SLA Tracking</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 overflow-y-auto flex flex-col gap-6">
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[24px] font-black text-emergency-light mb-1">{breachedTickets.length}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Breached</span>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[24px] font-black text-warning-light mb-1">{atRiskTickets.length}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">At Risk (&lt;1h)</span>
          </div>
        </div>

        {breachedTickets.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">SLA Breaches</h4>
            <div className="space-y-2">
              {breachedTickets.map(t => (
                <div key={t.id} className="bg-emergency/10 border border-emergency/20 rounded p-2 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono block">{t.id}</span>
                    <span className="text-[12px] font-bold text-emergency-light">{t.title}</span>
                  </div>
                  <AlertTriangle className="w-4 h-4 text-emergency-light" />
                </div>
              ))}
            </div>
          </div>
        )}

        {breachedTickets.length === 0 && atRiskTickets.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center opacity-50">
             <ShieldCheck className="w-12 h-12 text-emerald-500 mb-3" />
             <p className="text-[13px] font-bold text-white">All SLAs Met</p>
             <p className="text-[11px] text-gray-400">No active tickets are at risk.</p>
          </div>
        )}

      </CardBody>
    </Card>
  );
}
