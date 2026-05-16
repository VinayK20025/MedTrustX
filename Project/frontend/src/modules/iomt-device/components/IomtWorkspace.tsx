'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Activity, ShieldCheck, Key, ShieldAlert, AlertTriangle, CheckCircle2, Lock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { IomtData } from '../types/iomt.types';

interface IomtWorkspaceProps {
  data: IomtData;
  activeDeviceId?: string;
  onRevokeCert: (id: string) => void;
  onResolveAlert: (id: string) => void;
}

export const IomtWorkspace: React.FC<IomtWorkspaceProps> = ({ data, activeDeviceId, onRevokeCert, onResolveAlert }) => {
  const [activeTab, setActiveTab] = useState('stream');

  const deviceStream = activeDeviceId ? data.liveData.filter(d => d.deviceId === activeDeviceId) : data.liveData;
  const deviceCert = activeDeviceId ? data.certificates.find(c => c.deviceId === activeDeviceId) : null;
  const deviceValidation = activeDeviceId ? data.validationChecks.filter(v => v.deviceId === activeDeviceId) : data.validationChecks;
  const activeAlerts = activeDeviceId ? data.alerts.filter(a => !a.resolved && a.deviceId === activeDeviceId) : data.alerts.filter(a => !a.resolved);

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader title="IoMT Telemetry & Security" subtitle={activeDeviceId ? `Monitoring Device: ${activeDeviceId}` : "Global Telemetry Overview"} />
      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'stream', label: 'Live Data Stream', icon: <Activity className="w-4 h-4" /> },
            { id: 'auth', label: 'Authentication', icon: <Key className="w-4 h-4" />, disabled: !activeDeviceId },
            { id: 'validation', label: 'Data Integrity', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'policies', label: 'Security Policies', icon: <Lock className="w-4 h-4" /> },
            { id: 'alerts', label: 'Incidents', icon: <AlertTriangle className="w-4 h-4" />, count: activeAlerts.length },
          ]}
        />

        {/* LIVE DATA STREAM */}
        {activeTab === 'stream' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              Real-time Telemetry
            </h3>
            {deviceStream.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No live data streaming for this selection.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {deviceStream.map((stream, idx) => (
                  <div key={idx} className={cn("bg-surface rounded-xl border p-4",
                    stream.integrityStatus === 'Corrupt' ? "border-red-500/30 bg-red-500/5" : "border-white/10"
                  )}>
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{stream.metricName}</p>
                      {stream.integrityStatus === 'Verified' ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="Payload Verified" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" title="Payload Corrupt" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <h2 className="text-2xl font-bold text-white">{stream.value}</h2>
                      <span className="text-xs text-gray-500">{stream.unit}</span>
                    </div>
                    {!activeDeviceId && (
                      <p className="text-[9px] text-indigo-300 font-mono mt-3 truncate">{stream.deviceId}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AUTHENTICATION */}
        {activeTab === 'auth' && deviceCert && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-white">mTLS Certificate Status</h3>
              <span className={cn("text-xs font-bold px-2 py-1 rounded border",
                deviceCert.status === 'Valid' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                deviceCert.status === 'Revoked' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                deviceCert.status === 'Expired' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                "bg-purple-500/10 text-purple-400 border-purple-500/20"
              )}>
                {deviceCert.status}
              </span>
            </div>
            
            <div className="bg-surface border border-white/10 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Certificate ID</p>
                  <p className="text-sm font-mono text-gray-300 mt-1">{deviceCert.certId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Issuer</p>
                  <p className="text-sm text-gray-300 mt-1">{deviceCert.issuer}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Encryption Cipher</p>
                  <p className="text-sm font-mono text-indigo-300 mt-1">{deviceCert.encryption}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Expiry Date</p>
                  <p className={cn("text-sm mt-1", new Date(deviceCert.expiryDate) < new Date() ? "text-red-400" : "text-gray-300")}>
                    {new Date(deviceCert.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {deviceCert.status === 'Valid' && (
                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => onRevokeCert(deviceCert.deviceId)}>
                    <XCircle className="w-4 h-4 mr-2" /> Revoke Certificate
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DATA INTEGRITY / VALIDATION */}
        {activeTab === 'validation' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Payload Validation Checks</h3>
            <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-medium">Check ID</th>
                    {!activeDeviceId && <th className="p-3 font-medium">Device</th>}
                    <th className="p-3 font-medium">Validation Type</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {deviceValidation.map((val) => (
                    <tr key={val.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 text-xs font-mono text-gray-500">{val.id}</td>
                      {!activeDeviceId && <td className="p-3 text-xs font-mono text-indigo-300">{val.deviceId}</td>}
                      <td className="p-3 text-xs text-gray-300">{val.checkType}</td>
                      <td className="p-3">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold flex items-center w-fit",
                          val.status === 'Verified' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                          {val.status === 'Verified' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                          {val.status}
                        </span>
                      </td>
                      <td className="p-3 text-[10px] text-gray-500 font-mono">
                        {new Date(val.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECURITY POLICIES */}
        {activeTab === 'policies' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Active Security Policies</h3>
            <div className="grid grid-cols-1 gap-3">
              {data.securityPolicies.map(policy => (
                <div key={policy.id} className="bg-surface rounded-xl border border-white/10 p-4 flex gap-4 items-start">
                  <div className={cn("p-2 rounded-lg border shrink-0", 
                    policy.status === 'Enforcing' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                    policy.status === 'Enabled' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                    "bg-gray-500/10 border-gray-500/20 text-gray-400"
                  )}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-white">{policy.policyName}</h4>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded border",
                        policy.status === 'Enforcing' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                        policy.status === 'Enabled' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        "bg-gray-500/10 text-gray-400 border-gray-500/20"
                      )}>{policy.status}</span>
                    </div>
                    <p className="text-xs text-gray-400">{policy.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALERTS */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {activeAlerts.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No active security incidents.</p>
            ) : (
              activeAlerts.map(alert => (
                <div key={alert.id} className={cn("bg-surface rounded-xl border p-4",
                  alert.severity === 'Critical' ? "border-red-500/30 bg-red-500/5" :
                  alert.severity === 'Warning' ? "border-amber-500/30 bg-amber-500/5" : "border-white/10"
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className={cn("w-4 h-4 shrink-0 mt-0.5",
                        alert.severity === 'Critical' ? "text-red-400" :
                        alert.severity === 'Warning' ? "text-amber-400" : "text-indigo-400"
                      )} />
                      <div>
                        <h4 className="text-sm font-medium text-white">{alert.issue}</h4>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">Device: {alert.deviceId}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-3">
                    <p className="text-[10px] text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
                    <Button size="sm" variant="outline" className="text-[10px] h-7 px-2" onClick={() => onResolveAlert(alert.id)}>
                      Resolve Incident
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
