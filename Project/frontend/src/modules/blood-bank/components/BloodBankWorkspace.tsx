'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { BloodUnit, CrossmatchRequest } from '../types/blood-bank.types';
import { useIssueUnit, useDiscardUnit, useConfirmCrossmatch } from '../hooks/useBloodBankAnalytics';
import { Droplets, Thermometer, CheckCircle2, XCircle, AlertTriangle, Clock, Send, Trash2, FlaskConical, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props {
  units: BloodUnit[];
  crossmatches: CrossmatchRequest[];
  defaultTab?: 'units' | 'crossmatch';
}

const unitStatusColor: Record<string, string> = { Screening: 'text-blue-400', Available: 'text-success-light', Reserved: 'text-purple-400', Issued: 'text-cyan-400', Expired: 'text-gray-500', Discarded: 'text-emergency-light' };
const screenColor: Record<string, string> = { Pending: 'text-blue-400 bg-blue-500/15', Clear: 'text-success-light bg-success/15', Reactive: 'text-emergency-light bg-emergency/15' };

export function BloodBankWorkspace({ units, crossmatches, defaultTab = 'units' }: Props) {
  const { mutate: issueUnit } = useIssueUnit();
  const { mutate: discardUnit } = useDiscardUnit();
  const { mutate: confirmXM } = useConfirmCrossmatch();
  const [tab, setTab] = useState<'units' | 'crossmatch'>(defaultTab);

  return (
    <Card className="border-red-500/20 shadow-glass bg-[#050101] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-900 via-red-500 to-rose-400" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <Droplets className="w-5 h-5 text-red-400" /> Transfusion Services Engine
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Unit tracking, infection screening, crossmatch validation, and transfusion issuance.</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        <button onClick={() => setTab('units')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'units' ? 'text-red-400 border-red-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
          Blood Units
          <span className="ml-1.5 text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full">{units.length}</span>
        </button>
        <button onClick={() => setTab('crossmatch')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors', tab === 'crossmatch' ? 'text-red-400 border-red-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
          Crossmatch
          {crossmatches.filter(x => x.result === 'Pending').length > 0 && (
            <span className="ml-1.5 bg-warning/20 text-warning-light text-[9px] font-bold px-1.5 py-0.5 rounded-full">{crossmatches.filter(x => x.result === 'Pending').length}</span>
          )}
        </button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {tab === 'units' && (
          <div className="p-5 space-y-3">
            {units.map(u => {
              const daysToExpiry = Math.ceil((new Date(u.expiresAt).getTime() - Date.now()) / 86400000);
              const expiringSoon = daysToExpiry <= 3 && daysToExpiry > 0;
              return (
                <div key={u.id} className={cn('bg-white/[0.02] border rounded-xl p-4',
                  u.screeningResult === 'Reactive' ? 'border-emergency/40 bg-emergency/5' :
                  expiringSoon ? 'border-warning/40 bg-warning/5' : 'border-white/10'
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[20px] font-black text-white font-mono">{u.bloodGroup}</span>
                      <span className="text-[10px] font-bold text-gray-400 bg-black/30 px-2 py-0.5 rounded">{u.component}</span>
                    </div>
                    <span className={cn('text-[10px] font-bold uppercase tracking-wider', unitStatusColor[u.status])}>{u.status}</span>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-gray-400 mb-2 flex-wrap">
                    <span className="font-mono">{u.id}</span>
                    <span>Donor: {u.donorName}</span>
                    <span className="flex items-center gap-1">
                      <Thermometer className={cn('w-3 h-3', u.storageTemp > 6 ? 'text-emergency-light' : 'text-cyan-400')} />
                      <span className={cn('font-mono font-bold', u.storageTemp > 6 ? 'text-emergency-light' : 'text-cyan-400')}>{u.storageTemp}°C</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    {/* Screening Badge */}
                    <span className={cn('text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded', screenColor[u.screeningResult])}>
                      {u.screeningResult === 'Clear' && <ShieldCheck className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />}
                      {u.screeningResult === 'Reactive' && <XCircle className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />}
                      Screen: {u.screeningResult}
                    </span>

                    {/* Expiry */}
                    {daysToExpiry > 0 ? (
                      <span className={cn('text-[9px] font-bold flex items-center gap-1', expiringSoon ? 'text-warning-light' : 'text-gray-500')}>
                        <Clock className="w-2.5 h-2.5" /> Expires in {daysToExpiry}d
                      </span>
                    ) : u.status !== 'Discarded' && (
                      <span className="text-[9px] font-bold text-emergency-light flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> EXPIRED</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {u.status === 'Available' && u.screeningResult === 'Clear' && (
                      <Button onClick={() => issueUnit({ unitId: u.id, patientId: 'patient' })} size="sm" className="bg-success/10 text-success-light border-success/30 text-[10px] hover:bg-success/20" leftIcon={<Send className="w-3 h-3" />}>Issue</Button>
                    )}
                    {u.screeningResult === 'Reactive' && u.status !== 'Discarded' && (
                      <Button onClick={() => discardUnit({ unitId: u.id, reason: 'Reactive screening' })} size="sm" className="bg-emergency/10 text-emergency-light border-emergency/30 text-[10px] hover:bg-emergency/20" leftIcon={<Trash2 className="w-3 h-3" />}>Discard</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'crossmatch' && (
          <div className="p-5 space-y-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Compatibility Crossmatch Requests</p>
            {crossmatches.map(xm => (
              <div key={xm.id} className={cn('border rounded-xl p-4',
                xm.result === 'Compatible' ? 'bg-success/10 border-success/30' :
                xm.result === 'Incompatible' ? 'bg-emergency/10 border-emergency/30' : 'bg-blue-500/10 border-blue-500/30'
              )}>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono text-gray-400">{xm.id}</span>
                  <span className={cn('text-[10px] font-bold uppercase tracking-wider flex items-center gap-1',
                    xm.result === 'Compatible' ? 'text-success-light' : xm.result === 'Incompatible' ? 'text-emergency-light' : 'text-blue-400'
                  )}>
                    {xm.result === 'Compatible' && <CheckCircle2 className="w-3 h-3" />}
                    {xm.result === 'Incompatible' && <XCircle className="w-3 h-3" />}
                    {xm.result === 'Pending' && <FlaskConical className="w-3 h-3" />}
                    {xm.result}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-black/30 rounded-lg p-3 mb-3">
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Patient</p>
                    <p className="text-[14px] font-bold text-white">{xm.patientName}</p>
                    <p className="text-[12px] font-mono font-bold text-red-400">{xm.patientGroup}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Donor Unit</p>
                    <p className="text-[14px] font-bold text-white">{xm.unitId}</p>
                    <p className="text-[12px] font-mono font-bold text-red-400">{xm.donorGroup}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">{xm.requestedBy}</span>
                  {xm.result === 'Pending' && (
                    <div className="flex gap-2">
                      <Button onClick={() => confirmXM({ xmId: xm.id, result: 'Compatible' })} size="sm" className="bg-success/10 text-success-light border-success/30 text-[9px] h-6 hover:bg-success/20" leftIcon={<CheckCircle2 className="w-2.5 h-2.5" />}>Compatible</Button>
                      <Button onClick={() => confirmXM({ xmId: xm.id, result: 'Incompatible' })} size="sm" className="bg-emergency/10 text-emergency-light border-emergency/30 text-[9px] h-6 hover:bg-emergency/20" leftIcon={<XCircle className="w-2.5 h-2.5" />}>Incompatible</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
