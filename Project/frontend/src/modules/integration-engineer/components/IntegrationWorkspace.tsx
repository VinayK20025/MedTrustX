'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { MessageSquare, GitMerge, Map, Code, CheckCircle, XCircle, RefreshCw, Trash2, ToggleRight, ToggleLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { IntegrationData } from '../types/integration.types';

const statusConfig: Record<string, { icon: React.ReactNode; text: string; bg: string; border: string }> = {
  Processed:    { icon: <CheckCircle className="w-3.5 h-3.5" />, text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  Failed:       { icon: <XCircle className="w-3.5 h-3.5" />, text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  Reprocessing: { icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />, text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  Pending:      { icon: <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />, text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
};

const codeSystemColors: Record<string, string> = {
  'LOINC': 'bg-teal-500/20 text-teal-300',
  'ICD-10': 'bg-rose-500/20 text-rose-300',
  'SNOMED-CT': 'bg-purple-500/20 text-purple-300',
};

interface IntegrationWorkspaceProps {
  data: IntegrationData;
  activeInterfaceId?: string;
  onRetry: (id: string) => void;
  onDiscard: (id: string) => void;
  onToggleRoute: (id: string, active: boolean) => void;
}

export const IntegrationWorkspace: React.FC<IntegrationWorkspaceProps> = ({ data, activeInterfaceId, onRetry, onDiscard, onToggleRoute }) => {
  const [activeTab, setActiveTab] = useState('messages');
  const filteredMessages = activeInterfaceId ? data.messages.filter(m => m.interfaceId === activeInterfaceId) : data.messages;
  const filteredMappings = activeInterfaceId ? data.mappings.filter(m => m.interfaceId === activeInterfaceId) : data.mappings;
  const failedMessages = data.messages.filter(m => m.status === 'Failed' || m.status === 'Reprocessing');
  const selectedIface = data.interfaces.find(i => i.id === activeInterfaceId);

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title={selectedIface?.name || 'Integration Workspace'}
        subtitle={selectedIface ? `${selectedIface.protocol} · ${selectedIface.sourceSystem} → ${selectedIface.targetSystem}` : 'Select an interface'}
        action={selectedIface && (
          <div className="flex gap-2">
            <span className={cn("text-xs px-2 py-1 rounded-lg border",
              selectedIface.avgLatencyMs <= selectedIface.sla
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            )}>Avg: {selectedIface.avgLatencyMs}ms</span>
          </div>
        )}
      />
      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'messages', label: 'Message Stream', icon: <MessageSquare className="w-4 h-4" />, count: filteredMessages.length },
            { id: 'errors', label: 'Error Queue', icon: <XCircle className="w-4 h-4" />, count: failedMessages.length },
            { id: 'mapping', label: 'Mapping Rules', icon: <Map className="w-4 h-4" />, count: filteredMappings.length },
            { id: 'routing', label: 'Routing Engine', icon: <GitMerge className="w-4 h-4" />, count: data.routing.length },
            { id: 'fhir', label: 'FHIR API', icon: <Code className="w-4 h-4" />, count: data.fhirEndpoints.length },
          ]}
        />

        {activeTab === 'messages' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Live Message Stream</h3>
              <span className="flex items-center gap-1.5 text-[10px] text-teal-400"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />Live</span>
            </div>
            {filteredMessages.map(msg => {
              const scfg = statusConfig[msg.status] || statusConfig.Pending;
              return (
                <div key={msg.id} className={cn("bg-surface rounded-xl border p-4", msg.status === 'Failed' ? "border-red-500/20 bg-red-500/5" : msg.status === 'Reprocessing' ? "border-indigo-500/20" : "border-white/10")}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono font-bold bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-indigo-300">{msg.type}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{msg.standard}</span>
                        {msg.patientId && <span className="text-[10px] text-gray-500">· {msg.patientId}</span>}
                      </div>
                      <p className="text-[10px] font-mono text-gray-400">{msg.id}</p>
                    </div>
                    <div className={cn("flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border", scfg.bg, scfg.border, scfg.text)}>
                      {scfg.icon}<span>{msg.status}</span>
                    </div>
                  </div>
                  {msg.errorReason && <div className="bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2 mt-2 mb-2"><p className="text-xs text-red-300 font-mono leading-relaxed">{msg.errorReason}</p></div>}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                      <span>{msg.sourceSystem} → {msg.targetSystem}</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      {msg.latencyMs > 0 && <span className="font-mono">{msg.latencyMs}ms</span>}
                    </div>
                    {msg.status === 'Failed' && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="text-[10px] border-indigo-500/20 text-indigo-400 h-6 px-2" onClick={() => onRetry(msg.id)}>
                          <RefreshCw className="w-3 h-3 mr-0.5" />Retry
                        </Button>
                        <Button size="sm" variant="outline" className="text-[10px] border-white/10 text-gray-400 h-6 px-2" onClick={() => onDiscard(msg.id)}>
                          <Trash2 className="w-3 h-3 mr-0.5" />Discard
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Failed Message Queue</h3>
            {failedMessages.length === 0 ? (
              <div className="text-center py-10"><CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" /><p className="text-sm text-emerald-400">No errors in queue</p></div>
            ) : failedMessages.map(msg => (
              <div key={msg.id} className="bg-surface rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-white font-mono">{msg.id}</p>
                    <p className="text-xs text-gray-400">{msg.type} · {msg.standard} · {msg.sourceSystem}</p>
                  </div>
                  <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">{msg.status}</span>
                </div>
                <div className="bg-black/20 rounded-lg px-3 py-2 border border-red-500/10 mb-3"><p className="text-xs font-mono text-red-300">{msg.errorReason}</p></div>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8" onClick={() => onRetry(msg.id)}>
                    <RefreshCw className="w-3 h-3 mr-1" />Retry Message
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/10 text-gray-400 text-xs h-8" onClick={() => onDiscard(msg.id)}>
                    <Trash2 className="w-3 h-3 mr-1" />Discard
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'mapping' && (
          <div>
            <h3 className="text-sm font-medium text-white mb-4">Field Mapping & Transformation Rules</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Source Field</th>
                    <th className="pb-3 px-4">FHIR Target</th>
                    <th className="pb-3 px-4">Transformation</th>
                    <th className="pb-3 px-4">Code System</th>
                    <th className="pb-3 pl-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredMappings.map(map => (
                    <tr key={map.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs text-indigo-300">{map.sourceField}</td>
                      <td className="py-3 px-4 font-mono text-xs text-teal-300">{map.targetField}</td>
                      <td className="py-3 px-4 text-xs text-gray-300">{map.transformation}</td>
                      <td className="py-3 px-4">{map.codeSystem ? <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold", codeSystemColors[map.codeSystem] || 'bg-white/10 text-gray-400')}>{map.codeSystem}</span> : <span className="text-gray-600 text-[10px]">—</span>}</td>
                      <td className="py-3 pl-4 text-right"><span className={cn("text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold", map.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : map.status === 'Draft' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-gray-500/10 text-gray-400 border-white/10")}>{map.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'routing' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Message Routing Rules</h3>
            {data.routing.map(route => (
              <div key={route.id} className="bg-surface rounded-xl border border-white/10 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div><p className="text-[10px] font-mono text-gray-500 mb-0.5">{route.id}</p><h4 className="text-sm font-medium text-white">{route.name}</h4></div>
                  <button onClick={() => onToggleRoute(route.id, !route.active)}>{route.active ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-gray-500" />}</button>
                </div>
                <div className="bg-black/20 rounded px-3 py-2 border border-white/5 mb-3"><p className="text-[10px] font-mono text-amber-300">{route.condition}</p></div>
                <div className="flex flex-wrap gap-2 mb-3 items-center">
                  {route.sourceSystems.map(s => <span key={s} className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[10px] text-gray-400">{s}</span>)}
                  <span className="text-gray-600 text-xs">→</span>
                  {route.destinations.map(d => <span key={d} className="bg-teal-500/10 border border-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded text-[10px]">{d}</span>)}
                </div>
                <p className="text-[10px] text-gray-500">Routed: <span className="text-white font-bold">{route.messagesRouted.toLocaleString()}</span> messages</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'fhir' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">FHIR R4 API Endpoints</h3>
            {data.fhirEndpoints.map(ep => (
              <div key={ep.id} className="bg-surface rounded-xl border border-white/10 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border font-mono", ep.method === 'GET' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20")}>{ep.method}</span>
                    <code className="text-sm font-mono text-teal-300">{ep.path}</code>
                    <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">{ep.resource}</span>
                  </div>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded border ml-2", ep.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20")}>{ep.status}</span>
                </div>
                {ep.callsToday > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {[['Calls Today', ep.callsToday.toLocaleString(), 'text-white'], ['Avg Latency', `${ep.avgLatencyMs}ms`, 'text-white'], ['Auth', ep.authMethod, 'text-purple-300']].map(([label, value, color]) => (
                      <div key={label as string} className="bg-black/20 rounded p-2 border border-white/5">
                        <p className="text-[10px] text-gray-500 mb-0.5">{label}</p>
                        <p className={cn("text-xs font-bold", color)}>{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
