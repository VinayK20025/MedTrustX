'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { StorageSlot, CustodyEvent } from '../types/mortuary.types';
import { useAuthorizeRelease, useConfirmRelease } from '../hooks/useMortuaryAnalytics';
import { Thermometer, Lock, UserCheck, ArrowRight, Clock, CheckCircle2, CircleDot, Send } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { slots: StorageSlot[]; custodyLog: CustodyEvent[]; selectedRecordId?: string; }

const slotColor: Record<string, string> = { Occupied: 'bg-blue-500/20 border-blue-500/40 text-blue-300', Available: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400', Maintenance: 'bg-gray-500/15 border-gray-500/30 text-gray-500' };

const actionIcon: Record<string, React.ElementType> = { Received: ArrowRight, 'ID Verified': CheckCircle2, Stored: Lock, 'Document Filed': CheckCircle2, 'Release Authorized': UserCheck, Released: Send };

export function MortuaryWorkspace({ slots, custodyLog, selectedRecordId }: Props) {
  const { mutate: authRelease } = useAuthorizeRelease();
  const { mutate: confirmRelease } = useConfirmRelease();
  const [tab, setTab] = useState<'storage' | 'custody' | 'release'>('storage');

  const selectedLog = selectedRecordId ? custodyLog.filter(e => e.recordId === selectedRecordId) : custodyLog;

  return (
    <Card className="border-gray-500/20 shadow-glass bg-[#030303] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gray-700 via-slate-500 to-gray-400" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-400" /> Mortuary Operations
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Cold storage management, chain-of-custody tracking, and controlled release authorization.</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20 overflow-x-auto">
        <button onClick={() => setTab('storage')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1 whitespace-nowrap', tab === 'storage' ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>Storage Grid</button>
        <button onClick={() => setTab('custody')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1 whitespace-nowrap', tab === 'custody' ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>Chain of Custody</button>
        <button onClick={() => setTab('release')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap', tab === 'release' ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>Release</button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {tab === 'storage' && (
          <div className="p-5">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Cold Storage Unit — Capacity 8 Slots</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {slots.map(s => (
                <div key={s.id} className={cn('border-2 rounded-xl p-4 text-center', slotColor[s.status])}>
                  <p className="text-[18px] font-black font-mono">{s.label}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-1">{s.status}</p>
                  {s.occupantTag && <p className="text-[9px] font-mono text-gray-400 mt-1">{s.occupantTag}</p>}
                  {s.tempCelsius !== undefined && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-[10px]">
                      <Thermometer className={cn('w-3 h-3', s.tempCelsius > 4 ? 'text-emergency-light' : 'text-cyan-400')} />
                      <span className={cn('font-mono font-bold', s.tempCelsius > 4 ? 'text-emergency-light' : 'text-cyan-400')}>{s.tempCelsius}°C</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Temperature Summary */}
            <div className="mt-5 bg-white/[0.02] border border-white/10 rounded-xl p-4">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Temperature Control</h4>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-cyan-400 font-bold">Target: 2.0°C ± 0.5°C</span>
                <span className="text-gray-500">|</span>
                <span className={cn('font-bold', slots.every(s => !s.tempCelsius || s.tempCelsius <= 4) ? 'text-success-light' : 'text-emergency-light')}>
                  {slots.every(s => !s.tempCelsius || s.tempCelsius <= 4) ? '✓ All within range' : '⚠ Temperature excursion detected'}
                </span>
              </div>
            </div>
          </div>
        )}

        {tab === 'custody' && (
          <div className="p-5">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
              {selectedRecordId ? `Chain of Custody — ${selectedRecordId}` : 'Full Custody Log'}
            </p>
            <div className="relative pl-6 space-y-0">
              {selectedLog.map((e, idx) => {
                const Icon = actionIcon[e.action] || CircleDot;
                const isLast = idx === selectedLog.length - 1;
                return (
                  <div key={e.id} className="relative pb-6">
                    {/* Timeline line */}
                    {!isLast && <div className="absolute left-[-16px] top-6 bottom-0 w-px bg-white/10" />}
                    {/* Timeline dot */}
                    <div className="absolute left-[-22px] top-1 w-3 h-3 rounded-full bg-blue-500/30 border border-blue-500/50 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    </div>
                    <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[12px] font-bold text-white">{e.action}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span>{e.performedBy}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(e.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedLog.length === 0 && (
              <div className="text-center py-10 opacity-40">
                <Lock className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-[11px] text-gray-500 font-bold">No custody events for this record.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'release' && (
          <div className="p-5 space-y-5">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Release Authorization & Handover</p>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recipient Name</label>
                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50" placeholder="Full name of authorized recipient..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Relationship / Authority</label>
                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50" placeholder="e.g., Son, Police Officer (Badge #)..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID Document Verified</label>
                <div className="flex gap-2">
                  {['Aadhaar', 'Passport', 'DL', 'Police ID'].map(doc => (
                    <button key={doc} className="px-3 py-2 rounded-lg text-[11px] font-bold border border-white/10 bg-white/[0.02] text-gray-400 hover:bg-white/[0.05] transition-colors">{doc}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button disabled={!selectedRecordId} onClick={() => selectedRecordId && authRelease(selectedRecordId)} className={cn('h-12 text-[13px] font-bold border', selectedRecordId ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 hover:bg-blue-500/30' : 'bg-white/5 text-gray-500 border-white/10 cursor-not-allowed')} leftIcon={<UserCheck className="w-4 h-4" />}>Authorize Release</Button>
              <Button disabled={!selectedRecordId} onClick={() => selectedRecordId && confirmRelease({ id: selectedRecordId, recipient: 'Authorized' })} className={cn('h-12 text-[13px] font-bold border', selectedRecordId ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-white/5 text-gray-500 border-white/10 cursor-not-allowed')} leftIcon={<Send className="w-4 h-4" />}>Confirm Handover</Button>
            </div>
            <p className="text-[9px] text-gray-600 text-center">Release will be logged with timestamp, staff ID, and recipient details for medico-legal record.</p>
          </div>
        )}

      </CardBody>
    </Card>
  );
}
