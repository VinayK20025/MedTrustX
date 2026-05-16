'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Database, UserCheck, Siren, ClipboardCheck, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { DpoData, DataSubjectRequest } from '../types/dpo.types';

interface PrivacyWorkspaceProps {
  data: DpoData;
  activeRequestId?: string;
  onUpdateRequest: (id: string, status: string) => void;
  onUpdateBreach: (id: string, status: string) => void;
}

const RequestLifecycle: React.FC<{ request: DataSubjectRequest }> = ({ request }) => {
  const stages = ['Pending', 'Under Review', 'Completed'];
  const currentIdx = stages.indexOf(request.status === 'Rejected' ? 'Completed' : request.status);

  return (
    <div className="flex items-center gap-0 mt-4">
      {stages.map((stage, i) => (
        <React.Fragment key={stage}>
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold",
              i < currentIdx ? "bg-emerald-500 border-emerald-500 text-white" :
              i === currentIdx ? "bg-indigo-600 border-indigo-500 text-white" :
              "bg-white/5 border-white/20 text-gray-500"
            )}>
              {i < currentIdx ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn("text-[10px] whitespace-nowrap", i <= currentIdx ? "text-white" : "text-gray-500")}>{stage}</span>
          </div>
          {i < stages.length - 1 && (
            <div className={cn("flex-1 h-0.5 mx-1 mb-4", i < currentIdx ? "bg-emerald-500" : "bg-white/10")} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export const PrivacyWorkspace: React.FC<PrivacyWorkspaceProps> = ({ data, activeRequestId, onUpdateRequest, onUpdateBreach }) => {
  const [activeTab, setActiveTab] = useState('data-map');
  const selectedRequest = data.requests.find(r => r.id === activeRequestId) || data.requests[0];

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Privacy Governance Workspace"
        subtitle="GDPR / Data Privacy Management"
        action={
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
            <Shield className="w-3.5 h-3.5" />
            Compliance Score: {data.metrics.complianceScore}%
          </div>
        }
      />

      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'data-map', label: 'Data Map', icon: <Database className="w-4 h-4" />, count: data.processingActivities.length },
            { id: 'consent', label: 'Consent Records', icon: <UserCheck className="w-4 h-4" /> },
            { id: 'requests', label: 'DSR Lifecycle', icon: <ClipboardCheck className="w-4 h-4" /> },
            { id: 'breaches', label: 'Breach Management', icon: <Siren className="w-4 h-4" />, count: data.breaches.filter(b => b.status !== 'Closed').length },
            { id: 'dpia', label: 'DPIAs', icon: <AlertTriangle className="w-4 h-4" /> },
          ]}
        />

        {/* DATA MAP */}
        {activeTab === 'data-map' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Article 30 — Processing Activities Register</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 pr-4">System</th>
                    <th className="pb-3 px-4">Purpose</th>
                    <th className="pb-3 px-4">Data Type</th>
                    <th className="pb-3 px-4">Legal Basis</th>
                    <th className="pb-3 px-4">Retention</th>
                    <th className="pb-3 pl-4 text-right">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {data.processingActivities.map(pa => (
                    <tr key={pa.id} className="text-sm text-gray-300 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 font-medium text-white">{pa.system}</td>
                      <td className="py-3 px-4 text-xs text-gray-400">{pa.purpose}</td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded border uppercase",
                          pa.dataType === 'PHI' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                          pa.dataType === 'Financial' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        )}>{pa.dataType}</span>
                      </td>
                      <td className="py-3 px-4 text-xs">{pa.legalBasis}</td>
                      <td className="py-3 px-4 text-xs text-gray-400">{pa.retentionPeriod}</td>
                      <td className="py-3 pl-4 text-right">
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded border uppercase",
                          pa.riskLevel === 'High' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                          pa.riskLevel === 'Medium' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-teal-500/10 text-teal-400 border-teal-500/20"
                        )}>{pa.riskLevel}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONSENT */}
        {activeTab === 'consent' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Consent Records</h3>
            <div className="grid grid-cols-1 gap-3">
              {data.consentRecords.map(con => (
                <div key={con.id} className="bg-surface rounded-xl border border-white/10 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{con.patientName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{con.mrn} — {con.scope}</p>
                    <p className="text-[10px] text-gray-600 mt-1">Consented: {new Date(con.consentDate).toLocaleDateString()}</p>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded border uppercase ml-4 shrink-0",
                    con.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    con.status === 'Withdrawn' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                    "bg-gray-500/10 text-gray-400 border-gray-500/20"
                  )}>{con.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DSR LIFECYCLE */}
        {activeTab === 'requests' && selectedRequest && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Request Lifecycle — {selectedRequest.id}</h3>
              <Button size="sm" variant="primary" className="bg-indigo-600 hover:bg-indigo-500 text-white h-8 text-xs"
                onClick={() => onUpdateRequest(selectedRequest.id, 'Completed')}>
                Mark Complete
              </Button>
            </div>

            <RequestLifecycle request={selectedRequest} />

            <div className="bg-surface rounded-xl border border-white/10 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-400">Subject</p><p className="font-medium text-white mt-1">{selectedRequest.subjectName}</p></div>
                <div><p className="text-xs text-gray-400">Request Type</p><p className="font-medium text-white mt-1">{selectedRequest.type}</p></div>
                <div><p className="text-xs text-gray-400">Submitted</p><p className="text-gray-300 mt-1">{new Date(selectedRequest.submittedDate).toLocaleDateString()}</p></div>
                <div><p className="text-xs text-gray-400">GDPR Deadline</p>
                  <p className={cn("font-medium mt-1", new Date(selectedRequest.dueDate) < new Date() ? "text-rose-400" : "text-amber-400")}>
                    {new Date(selectedRequest.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div><p className="text-xs text-gray-400">Assigned To</p><p className="text-gray-300 mt-1">{selectedRequest.assignedTo}</p></div>
              </div>
              {selectedRequest.notes && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-gray-300">
                  <p className="text-gray-400 mb-1 font-medium">Notes</p>
                  {selectedRequest.notes}
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.06] pt-4">
              <p className="text-xs text-gray-400 mb-2">All Open Requests</p>
              <div className="space-y-2">
                {data.requests.map(r => (
                  <div key={r.id} className={cn("p-3 rounded-lg border text-sm flex justify-between items-center cursor-pointer hover:bg-white/[0.02] transition-colors",
                    selectedRequest.id === r.id ? "border-indigo-500/40 bg-indigo-500/5" : "border-white/10"
                  )}>
                    <span className="text-white font-medium">{r.id} — {r.subjectName}</span>
                    <span className="text-[10px] text-gray-400">{r.type} • {r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BREACHES */}
        {activeTab === 'breaches' && (
          <div className="space-y-4">
            {data.breaches.map(breach => (
              <div key={breach.id} className={cn(
                "bg-surface rounded-xl border p-4",
                breach.severity === 'High' || breach.severity === 'Critical' ? "border-rose-500/20 bg-rose-500/5" : "border-white/10"
              )}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded mt-0.5", breach.severity === 'High' ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400")}>
                      <Siren className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{breach.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Detected: {new Date(breach.dateDetected).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border uppercase",
                      breach.severity === 'High' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>{breach.severity}</span>
                    <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-400">{breach.status}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 mb-4 leading-relaxed">{breach.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs mb-4">
                  <div className="bg-black/20 p-2 rounded border border-white/5">
                    <p className="text-gray-500 mb-0.5">Affected Records</p>
                    <p className="font-bold text-white">{breach.affectedRecords}</p>
                  </div>
                  <div className="bg-black/20 p-2 rounded border border-white/5">
                    <p className="text-gray-500 mb-0.5">Authority Notified</p>
                    <p className={cn("font-bold", breach.reportedToAuthority ? "text-emerald-400" : "text-rose-400")}>
                      {breach.reportedToAuthority ? "Yes ✓" : "Not Yet ✗"}
                    </p>
                  </div>
                  <div className="bg-black/20 p-2 rounded border border-white/5">
                    <p className="text-gray-500 mb-0.5">Systems Affected</p>
                    <p className="text-gray-300">{breach.affectedSystems.length} system(s)</p>
                  </div>
                </div>

                {breach.status !== 'Closed' && (
                  <Button size="sm" variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 h-8 text-xs"
                    onClick={() => onUpdateBreach(breach.id, 'Contained')}>
                    Mark Contained
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* DPIAs */}
        {activeTab === 'dpia' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Data Protection Impact Assessments</h3>
            {data.dpias.map(dpia => (
              <div key={dpia.id} className="bg-surface rounded-xl border border-white/10 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[10px] font-mono text-gray-500 mb-1">{dpia.id}</p>
                    <h4 className="text-sm font-medium text-white">{dpia.projectName}</h4>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border uppercase",
                      dpia.status === 'Approved' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      dpia.status === 'Under Review' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-white/5 text-gray-400 border-white/10"
                    )}>{dpia.status}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded",
                      dpia.riskLevel === 'High' ? "text-rose-400" : dpia.riskLevel === 'Medium' ? "text-amber-400" : "text-teal-400"
                    )}>{dpia.riskLevel} Risk</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-3">{dpia.description}</p>
                <div className="flex items-center gap-4 text-[10px] text-gray-500">
                  <span>Started: {new Date(dpia.startDate).toLocaleDateString()}</span>
                  <span>Reviewer: {dpia.dpoReviewer}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
