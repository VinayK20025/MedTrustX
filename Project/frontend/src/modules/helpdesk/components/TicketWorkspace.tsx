'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SupportTicket } from '../types/helpdesk.types';
import { useUpdateTicket, useAssignTicket, useAddTicketNote } from '../hooks/useHelpdeskAnalytics';
import { MessageSquare, Send, CheckCircle2, UserPlus, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { ticket?: SupportTicket; }

export function TicketWorkspace({ ticket }: Props) {
  const { mutate: assignTicket } = useAssignTicket();
  const { mutate: updateTicket } = useUpdateTicket();
  const { mutate: addNote } = useAddTicketNote();
  const [noteText, setNoteText] = useState('');
  const [isInternal, setIsInternal] = useState(true);

  if (!ticket) return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center">
      <MessageSquare className="w-10 h-10 text-gray-600 mb-4" />
      <p className="text-gray-500 text-[15px]">Select a ticket from the queue</p>
    </Card>
  );

  const isBreached = new Date() > new Date(ticket.slaBreachAt);

  const handleSendNote = () => {
    if (!noteText.trim()) return;
    addNote({ id: ticket.id, msg: noteText, internal: isInternal });
    setNoteText('');
  };

  return (
    <Card className={cn("shadow-glass h-full flex flex-col relative overflow-hidden", isBreached ? "bg-[#1a0505] border-emergency/30" : "bg-[#0a0514] border-purple-500/25")}>
      <div className={cn("absolute top-0 left-0 w-full h-1.5", isBreached ? "bg-gradient-to-r from-red-600 to-emergency-500" : "bg-gradient-to-r from-purple-600 to-indigo-500")} />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        {isBreached && (
           <div className="mb-3 bg-emergency/20 border border-emergency/30 text-emergency-light p-2 rounded text-[11px] font-bold flex items-center justify-center gap-2 animate-pulse">
             <AlertTriangle className="w-4 h-4" /> SLA BREACH DETECTED - IMMEDIATE ACTION REQUIRED
           </div>
        )}
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-[18px] font-bold text-white">{ticket.title}</h3>
          <span className={cn("text-[10px] font-bold px-2 py-1 rounded", ticket.status === 'Resolved' ? "bg-success/20 text-success-light" : "bg-purple-500/20 text-purple-300")}>{ticket.status}</span>
        </div>
        <p className="text-[12px] text-gray-400">ID: <span className="text-gray-300 font-mono">{ticket.id}</span> • Reporter: <span className="text-gray-300">{ticket.reporter} ({ticket.department})</span></p>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">
        {/* Issue Details & Routing */}
        <div className="p-5 border-b border-white/5 space-y-4">
          <div>
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description</h4>
            <p className="text-[13px] text-gray-200 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/10">{ticket.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-white/5 border border-white/10 rounded-lg p-3">
               <span className="text-[10px] text-gray-500 uppercase block mb-1">Assigned To</span>
               <div className="flex items-center justify-between">
                 <span className="text-[13px] font-bold text-white">{ticket.assignedTo || 'Unassigned'}</span>
                 {!ticket.assignedTo && <Button size="sm" onClick={() => assignTicket({ id: ticket.id, team: 'IT Team' })} className="h-6 text-[10px] bg-purple-500/20 text-purple-300" leftIcon={<UserPlus className="w-3 h-3" />}>Route to IT</Button>}
               </div>
             </div>
             <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col justify-center">
               <Button onClick={() => updateTicket({ id: ticket.id, payload: { status: 'Resolved' } })} disabled={ticket.status === 'Resolved'} className={cn("w-full h-8 text-[11px] font-bold", ticket.status === 'Resolved' ? "bg-success/10 text-success-light border border-success/20" : "bg-white/10 hover:bg-white/20 text-white")} leftIcon={<CheckCircle2 className="w-3 h-3" />}>
                 {ticket.status === 'Resolved' ? 'Ticket Resolved' : 'Mark as Resolved'}
               </Button>
             </div>
          </div>
        </div>

        {/* Communication & Logs */}
        <div className="p-5 flex-1 flex flex-col">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Communication Logs</h4>
          <div className="flex-1 space-y-3 mb-4 overflow-y-auto max-h-[200px]">
            {ticket.logs.length === 0 ? (
              <p className="text-[12px] text-gray-500 italic">No notes added yet.</p>
            ) : (
              ticket.logs.map(log => (
                <div key={log.id} className={cn("p-3 rounded-lg border", log.isInternal ? "bg-yellow-500/5 border-yellow-500/10" : "bg-white/5 border-white/10")}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-gray-300">{log.user}</span>
                    <span className="text-[9px] text-gray-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[12px] text-gray-300">{log.message}</p>
                  {log.isInternal && <span className="text-[9px] text-yellow-600/70 font-bold uppercase mt-1 block">Internal Note</span>}
                </div>
              ))
            )}
          </div>

          {/* Input Box */}
          <div className="mt-auto bg-black/40 border border-white/10 rounded-lg p-2 flex flex-col gap-2">
            <textarea 
              placeholder="Type your response or internal note..." 
              className="w-full h-16 bg-transparent p-2 text-[13px] text-white focus:outline-none resize-none"
              value={noteText} onChange={(e) => setNoteText(e.target.value)}
            />
            <div className="flex justify-between items-center px-2 pb-1">
              <label className="flex items-center gap-2 text-[11px] text-gray-400 cursor-pointer">
                <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="accent-purple-500" />
                Internal Note (IT Only)
              </label>
              <Button onClick={handleSendNote} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white h-7 px-4 text-[11px]" leftIcon={<Send className="w-3 h-3" />}>Add Note</Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
