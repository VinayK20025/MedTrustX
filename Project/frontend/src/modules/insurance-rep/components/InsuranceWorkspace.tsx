'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PreAuthRequest, InsuranceClaim } from '../types/insurance-rep.types';
import { useApprovePreAuth, useRejectPreAuth, useApproveClaim } from '../hooks/useInsuranceRepAnalytics';
import { ShieldCheck, CheckCircle2, XCircle, HelpCircle, Clock, IndianRupee, FileCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { preAuths: PreAuthRequest[]; claims: InsuranceClaim[]; }

export function InsuranceWorkspace({ preAuths, claims }: Props) {
  const { mutate: approve } = useApprovePreAuth();
  const { mutate: reject } = useRejectPreAuth();
  const { mutate: approveClaim } = useApproveClaim();
  const [tab, setTab] = useState<'preauth' | 'claims'>('preauth');

  return (
    <Card className="border-green-500/20 shadow-glass bg-[#020502] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-800 via-emerald-500 to-teal-400" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-400" /> Financial Authorization Center
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Pre-authorization decisions, claims review, and settlement processing.</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        <button onClick={() => setTab('preauth')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'preauth' ? 'text-green-400 border-green-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
          Pre-Authorization
          {preAuths.filter(p => p.status === 'Pending').length > 0 && (
            <span className="ml-1.5 bg-warning/20 text-warning-light text-[9px] font-bold px-1.5 py-0.5 rounded-full">{preAuths.filter(p => p.status === 'Pending').length}</span>
          )}
        </button>
        <button onClick={() => setTab('claims')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors', tab === 'claims' ? 'text-green-400 border-green-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
          Claims
          {claims.filter(c => c.status === 'Under Review').length > 0 && (
            <span className="ml-1.5 bg-blue-500/20 text-blue-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{claims.filter(c => c.status === 'Under Review').length}</span>
          )}
        </button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {tab === 'preauth' && (
          <div className="p-5 space-y-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Pre-Authorization Requests</p>
            {preAuths.map(pa => (
              <div key={pa.id} className={cn('border rounded-xl p-4',
                pa.status === 'Pending' ? 'bg-warning/10 border-warning/30' :
                pa.status === 'Query Raised' ? 'bg-blue-500/10 border-blue-500/30' :
                pa.status === 'Approved' ? 'bg-success/10 border-success/30' : 'bg-emergency/10 border-emergency/30'
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400">{pa.id} • Case {pa.caseId}</span>
                    <h4 className="text-[14px] font-bold text-white mt-1">{pa.treatment}</h4>
                  </div>
                  <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded',
                    pa.status === 'Pending' ? 'bg-warning/20 text-warning-light' :
                    pa.status === 'Query Raised' ? 'bg-blue-500/20 text-blue-300' :
                    pa.status === 'Approved' ? 'bg-success/20 text-success-light' : 'bg-emergency/20 text-emergency-light'
                  )}>{pa.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-black/30 rounded-lg p-3 mb-3">
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Estimated Amount</p>
                    <p className="text-[18px] font-black font-mono text-white flex items-center gap-0.5"><IndianRupee className="w-4 h-4" />{pa.estimatedAmount.toLocaleString()}</p>
                  </div>
                  {pa.turnaroundHrs !== undefined && (
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest">Pending Since</p>
                      <p className={cn('text-[18px] font-black font-mono flex items-center gap-1', pa.turnaroundHrs > 8 ? 'text-warning-light' : 'text-gray-300')}>
                        <Clock className="w-4 h-4" /> {pa.turnaroundHrs}h
                      </p>
                    </div>
                  )}
                </div>

                {(pa.status === 'Pending' || pa.status === 'Query Raised') && (
                  <div className="flex gap-2">
                    <Button onClick={() => approve(pa.id)} className="flex-1 h-10 bg-success/20 text-success-light border border-success/40 hover:bg-success/30 text-[12px]" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>Approve</Button>
                    <Button onClick={() => reject(pa.id)} className="flex-1 h-10 bg-emergency/20 text-emergency-light border border-emergency/40 hover:bg-emergency/30 text-[12px]" leftIcon={<XCircle className="w-3.5 h-3.5" />}>Reject</Button>
                    <Button className="h-10 bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 text-[12px] px-3" leftIcon={<HelpCircle className="w-3.5 h-3.5" />}>Query</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'claims' && (
          <div className="p-5 space-y-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Claims Under Processing</p>
            {claims.map(cl => (
              <div key={cl.id} className={cn('border rounded-xl p-4',
                cl.status === 'Under Review' ? 'bg-blue-500/10 border-blue-500/30' :
                cl.status === 'Approved' ? 'bg-success/10 border-success/30' : 'bg-white/[0.02] border-white/10'
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400">{cl.id} • Case {cl.caseId}</span>
                  </div>
                  <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded',
                    cl.status === 'Approved' ? 'bg-success/20 text-success-light' :
                    cl.status === 'Under Review' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/10 text-gray-400'
                  )}>{cl.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-black/30 rounded-lg p-3 mb-3">
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Claimed</p>
                    <p className="text-[18px] font-black font-mono text-white flex items-center gap-0.5"><IndianRupee className="w-4 h-4" />{cl.claimAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Approved</p>
                    <p className="text-[18px] font-black font-mono text-emerald-400 flex items-center gap-0.5"><IndianRupee className="w-4 h-4" />{cl.approvedAmount ? cl.approvedAmount.toLocaleString() : '—'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] mb-3">
                  <span className="text-gray-500">{new Date(cl.submittedAt).toLocaleDateString()}</span>
                  {cl.docsComplete ? (
                    <span className="text-success-light font-bold flex items-center gap-1"><FileCheck className="w-3 h-3" /> Docs Complete</span>
                  ) : (
                    <span className="text-warning-light font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> Docs Incomplete</span>
                  )}
                </div>

                {cl.status === 'Under Review' && (
                  <Button onClick={() => approveClaim(cl.id)} className="w-full h-10 bg-success/20 text-success-light border border-success/40 hover:bg-success/30 text-[12px]" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>Approve for Settlement</Button>
                )}
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
