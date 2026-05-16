'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ConsultCase } from '../types/remote-consultant.types';
import { useRequestMoreInfo } from '../hooks/useConsultantAnalytics';
import { FileSearch, TestTube, Image, FileText, ClipboardList, AlertTriangle, Eye, MessageSquare } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { caseData?: ConsultCase; }

const reportIcon: Record<string, React.ElementType> = { Lab: TestTube, Radiology: Image, Pathology: FileSearch, 'Clinical Notes': FileText };

export function CaseWorkspace({ caseData }: Props) {
  const { mutate: requestInfo } = useRequestMoreInfo();
  const [tab, setTab] = useState<'summary' | 'reports'>('summary');

  return (
    <Card className="border-amber-500/20 shadow-glass bg-[#040302] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-800 via-orange-500 to-yellow-400" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-amber-400" /> Case Review Workspace
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Structured case analysis, diagnostic review, and evidence-based expert opinion.</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        <button onClick={() => setTab('summary')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'summary' ? 'text-amber-400 border-amber-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>Case Summary</button>
        <button onClick={() => setTab('reports')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors', tab === 'reports' ? 'text-amber-400 border-amber-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
          Reports & Imaging
          {caseData && <span className="ml-1.5 bg-white/10 text-gray-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{caseData.reports.length}</span>}
        </button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {tab === 'summary' && (
          <div className="p-5 flex flex-col gap-5">
            {!caseData ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-40 py-20">
                <FileSearch className="w-12 h-12 text-amber-500 mb-3" />
                <p className="text-gray-400 font-bold">Select a case to begin review.</p>
              </div>
            ) : (
              <>
                {/* Patient Header */}
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{caseData.id} • {caseData.specialty}</span>
                      <h3 className="text-[22px] font-black text-white mt-1">{caseData.patientName}</h3>
                      <p className="text-[12px] text-gray-400 mt-0.5">{caseData.age}y {caseData.gender} • Referred by {caseData.referredBy}</p>
                    </div>
                    <span className={cn('text-[10px] font-bold uppercase px-2 py-1 rounded border',
                      caseData.priority === 'Urgent' ? 'bg-emergency/20 text-emergency-light border-emergency/30' :
                      caseData.priority === 'High' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    )}>{caseData.priority}</span>
                  </div>
                </div>

                {/* Clinical Summary */}
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ClipboardList className="w-3.5 h-3.5" /> Clinical Summary
                  </h4>
                  <p className="text-[14px] text-gray-200 leading-relaxed">{caseData.summary}</p>
                </div>

                {/* Key Findings Highlights */}
                {caseData.reports.some(r => r.highlight) && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
                    <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5" /> Key Findings
                    </h4>
                    <div className="space-y-2">
                      {caseData.reports.filter(r => r.highlight).map(r => (
                        <div key={r.id} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                          <div>
                            <span className="text-[11px] text-gray-400">{r.title}:</span>
                            <span className="text-[12px] text-white font-bold ml-1">{r.highlight}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => requestInfo({ caseId: caseData.id, message: 'Additional information requested' })} className="h-10 bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 text-[12px]" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>Request More Info</Button>
                  <Button className="h-10 bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 text-[12px]" leftIcon={<Eye className="w-3.5 h-3.5" />}>View Full EHR</Button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'reports' && caseData && (
          <div className="p-5 space-y-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Diagnostic Reports & Imaging</p>
            {caseData.reports.map(r => {
              const Icon = reportIcon[r.type] || FileText;
              return (
                <div key={r.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.05] transition-all">
                  <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[13px] font-bold text-white block">{r.title}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded">{r.type}</span>
                      <span className="text-[10px] text-gray-500">{r.date}</span>
                    </div>
                    {r.highlight && <p className="text-[11px] text-amber-300 mt-1 font-bold">{r.highlight}</p>}
                  </div>
                  <Eye className="w-4 h-4 text-gray-500 group-hover:text-white shrink-0" />
                </div>
              );
            })}

            {/* Imaging viewer placeholder */}
            <div className="bg-black/60 border border-dashed border-white/10 rounded-xl p-8 text-center mt-4">
              <Image className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-[12px] text-gray-500 font-bold">DICOM Viewer</p>
              <p className="text-[10px] text-gray-600 mt-1">Click a radiology report above to load imaging with annotation tools.</p>
            </div>
          </div>
        )}

      </CardBody>
    </Card>
  );
}
