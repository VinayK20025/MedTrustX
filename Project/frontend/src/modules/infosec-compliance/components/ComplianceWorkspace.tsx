'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { ShieldCheck, FileSearch, AlertTriangle, Siren, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { GrcData } from '../types/infosec.types';

interface ComplianceWorkspaceProps {
  data: GrcData;
  activeFrameworkId?: string;
}

export const ComplianceWorkspace: React.FC<ComplianceWorkspaceProps> = ({ data, activeFrameworkId }) => {
  const [activeTab, setActiveTab] = useState('controls');

  const selectedFramework = data.frameworks.find(f => f.id === activeFrameworkId) || data.frameworks[0];
  const controls = data.controls[selectedFramework?.id] || [];

  if (!selectedFramework) {
    return (
      <Card className="h-full flex items-center justify-center border-white/[0.06] shadow-glass bg-surface-dark">
        <div className="text-gray-500">Select a framework to view details</div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader 
        title={`${selectedFramework.name} (${selectedFramework.version})`}
        subtitle={`Last assessed: ${new Date(selectedFramework.lastAssessed).toLocaleDateString()}`}
        action={
          <Button size="sm" variant="primary" className="bg-indigo-600 hover:bg-indigo-500 text-white h-9">
            Generate Report
          </Button>
        }
      />

      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'controls', label: 'Controls & Policies', icon: <ShieldCheck className="w-4 h-4" />, count: controls.length },
            { id: 'audits', label: 'Active Audits', icon: <FileSearch className="w-4 h-4" />, count: data.audits.length },
            { id: 'risks', label: 'Risk Register', icon: <AlertTriangle className="w-4 h-4" />, count: data.risks.length },
            { id: 'incidents', label: 'Incidents', icon: <Siren className="w-4 h-4" /> }
          ]} 
        />

        {activeTab === 'controls' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-white">Mapped Controls</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {controls.map(control => (
                <div key={control.id} className="bg-surface rounded-xl border border-white/10 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs text-indigo-400 font-mono mb-1 block">{control.id} • {control.domain}</span>
                      <h4 className="text-sm font-medium text-white">{control.title}</h4>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded border font-bold",
                      control.status === 'Implemented' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                      control.status === 'Partial' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    )}>
                      {control.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 mb-3">{control.description}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={cn("flex items-center gap-1", control.evidenceLinked ? "text-emerald-400" : "text-amber-400")}>
                      <FileText className="w-3 h-3" />
                      {control.evidenceLinked ? "Evidence Linked" : "Missing Evidence"}
                    </span>
                    <span className="text-gray-500">Tested: {new Date(control.lastTested).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {controls.length === 0 && <p className="text-sm text-gray-500">No controls mapped to this framework.</p>}
            </div>
          </div>
        )}

        {activeTab === 'audits' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Audit Management</h3>
            {data.audits.map(audit => (
              <div key={audit.id} className="bg-surface rounded-xl border border-white/10 p-4 relative overflow-hidden">
                <div className={cn("absolute top-0 right-0 w-1 h-full", audit.type === 'External' ? 'bg-indigo-500' : 'bg-teal-500')} />
                <div className="flex justify-between items-start mb-2 pr-4">
                  <div>
                    <h4 className="text-sm font-medium text-white">{audit.scope}</h4>
                    <p className="text-xs text-gray-400 mt-1">{audit.type} Audit • {audit.auditor}</p>
                  </div>
                  <span className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-300">
                    {audit.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-4">
                  <span>Started: {new Date(audit.startDate).toLocaleDateString()}</span>
                  {audit.endDate && <span>Ended: {new Date(audit.endDate).toLocaleDateString()}</span>}
                  <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" /> {audit.findingsCount} Findings
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-white">Risk Register</h3>
              <Button size="sm" variant="outline" className="text-xs border-white/10 text-white h-8">Add Risk</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-medium">Risk Title</th>
                    <th className="pb-3 px-4 font-medium">Category</th>
                    <th className="pb-3 px-4 font-medium">Severity</th>
                    <th className="pb-3 px-4 font-medium">Owner</th>
                    <th className="pb-3 pl-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {data.risks.map(risk => (
                    <tr key={risk.id} className="text-sm text-gray-300">
                      <td className="py-3 pr-4 font-medium text-white">{risk.title}</td>
                      <td className="py-3 px-4 text-xs">{risk.category}</td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full border",
                          risk.severity === 'High' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : 
                          risk.severity === 'Medium' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                        )}>{risk.severity}</span>
                      </td>
                      <td className="py-3 px-4 text-xs">{risk.owner}</td>
                      <td className="py-3 pl-4 text-right">
                        <span className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10">{risk.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Security Events</h3>
            {data.incidents.map(inc => (
              <div key={inc.id} className="bg-surface rounded-xl border border-rose-500/20 p-4 bg-rose-500/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded bg-rose-500/20 text-rose-400"><Siren className="w-4 h-4" /></div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{inc.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Reported: {new Date(inc.dateReported).toLocaleString()}</p>
                  </div>
                </div>
                <div className="ml-11 mt-3 text-xs">
                  <span className="text-gray-400 block mb-1">Affected Systems:</span>
                  <div className="flex gap-2">
                    {inc.affectedSystems.map(sys => (
                      <span key={sys} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-300">{sys}</span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-rose-400 font-bold uppercase">{inc.severity} Severity</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-white uppercase font-medium tracking-wider">{inc.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
