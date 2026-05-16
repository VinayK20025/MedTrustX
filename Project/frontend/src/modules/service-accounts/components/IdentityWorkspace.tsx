'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Key, ShieldCheck, FileText, AlertTriangle, RotateCw, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { ServiceAccountData } from '../types/service-accounts.types';

interface IdentityWorkspaceProps {
  data: ServiceAccountData;
  activeAccountId?: string;
  onRotateCredential: (id: string) => void;
  onResolveAlert: (id: string) => void;
}

export const IdentityWorkspace: React.FC<IdentityWorkspaceProps> = ({ data, activeAccountId, onRotateCredential, onResolveAlert }) => {
  const [activeTab, setActiveTab] = useState('credentials');

  const accountCreds = activeAccountId ? data.credentials.filter(c => c.accountId === activeAccountId) : data.credentials;
  const accountPolicies = activeAccountId ? data.policies.filter(p => p.accountId === activeAccountId) : data.policies;
  const accountLogs = activeAccountId ? data.logs.filter(l => l.accountId === activeAccountId) : data.logs;
  const activeAlerts = activeAccountId ? data.alerts.filter(a => !a.resolved && a.accountId === activeAccountId) : data.alerts.filter(a => !a.resolved);

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader title="Machine Identity Hub" subtitle={activeAccountId ? `Managing Identity: ${activeAccountId}` : "Global API Access Overview"} />
      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'credentials', label: 'Credentials', icon: <Key className="w-4 h-4" /> },
            { id: 'policies', label: 'Access Policies', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'logs', label: 'API Access Logs', icon: <FileText className="w-4 h-4" /> },
            { id: 'alerts', label: 'Security Alerts', icon: <AlertTriangle className="w-4 h-4" />, count: activeAlerts.length },
          ]}
        />

        {/* CREDENTIALS */}
        {activeTab === 'credentials' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Key & Token Lifecycle</h3>
            {accountCreds.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No credentials found for this account.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accountCreds.map((cred, idx) => (
                  <div key={idx} className={cn("bg-surface rounded-xl border p-4",
                    cred.status === 'Expired' ? "border-red-500/30 bg-red-500/5" :
                    cred.status === 'Expiring Soon' ? "border-amber-500/30 bg-amber-500/5" :
                    "border-white/10"
                  )}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-indigo-400" />
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{cred.type}</p>
                          <h4 className="text-sm font-mono text-white mt-0.5">{cred.id}</h4>
                        </div>
                      </div>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-bold",
                        cred.status === 'Valid' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        cred.status === 'Expired' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        cred.status === 'Expiring Soon' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-gray-500/10 text-gray-400 border-gray-500/20"
                      )}>{cred.status}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div>
                        <p className="text-gray-500 mb-1">Expiry Date</p>
                        <p className={cn(new Date(cred.expiryDate) < new Date() ? "text-red-400" : "text-white")}>
                          {new Date(cred.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Last Rotated</p>
                        <p className="text-gray-300 font-mono">{new Date(cred.lastRotated).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                      <Button size="sm" variant="outline" className="h-7 text-[10px] px-3" onClick={() => onRotateCredential(cred.accountId)}>
                        <RotateCw className="w-3 h-3 mr-1.5" /> Rotate Secret
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACCESS POLICIES */}
        {activeTab === 'policies' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Least Privilege Authorization</h3>
            <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-medium">Policy ID</th>
                    {!activeAccountId && <th className="p-3 font-medium">Account</th>}
                    <th className="p-3 font-medium">Access Level</th>
                    <th className="p-3 font-medium">Allowed Resources</th>
                    <th className="p-3 font-medium">Least Privilege</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {accountPolicies.map((pol) => (
                    <tr key={pol.id} className={cn("transition-colors", !pol.isLeastPrivilege ? "bg-amber-500/5 hover:bg-amber-500/10" : "hover:bg-white/[0.02]")}>
                      <td className="p-3 text-xs font-mono text-gray-400">{pol.id}</td>
                      {!activeAccountId && <td className="p-3 text-xs font-mono text-indigo-300">{pol.accountId}</td>}
                      <td className="p-3 text-xs text-white">{pol.accessLevel}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {pol.resources.map(res => (
                            <span key={res} className="text-[9px] bg-white/5 border border-white/10 text-gray-300 px-1.5 py-0.5 rounded font-mono">
                              {res}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        {pol.isLeastPrivilege ? (
                          <span className="text-[10px] text-emerald-400 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</span>
                        ) : (
                          <span className="text-[10px] text-amber-400 font-bold flex items-center"><ShieldAlert className="w-3 h-3 mr-1" /> Over-permissioned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACCESS LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Live API Telemetry
            </h3>
            <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
              <div className="divide-y divide-white/5">
                {accountLogs.map(log => (
                  <div key={log.id} className="p-3 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
                    {log.status === 'Success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" /> :
                     log.status === 'Denied' ? <ShieldOff className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" /> :
                     <XCircle className="w-4 h-4 mt-0.5 text-red-400 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-white font-medium truncate">{log.sourceService} <span className="text-gray-500 mx-1">→</span> {log.targetService}</span>
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded border",
                            log.status === 'Success' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            log.status === 'Denied' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            "bg-red-500/10 text-red-400 border-red-500/20"
                          )}>{log.status}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <p className="text-[10px] text-indigo-300 font-mono truncate">{log.endpoint}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {!activeAccountId && <span className="text-[9px] text-gray-400 font-mono bg-white/5 px-1 rounded border border-white/10">ID: {log.accountId}</span>}
                        <span className="text-[10px] text-gray-500">Latency: <span className={log.latencyMs > 1000 ? "text-red-400" : "text-emerald-400"}>{log.latencyMs}ms</span></span>
                        <span className="text-[9px] text-gray-600 font-mono">Trace: {log.id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ALERTS */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {activeAlerts.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No active security alerts for this identity.</p>
            ) : (
              activeAlerts.map(alert => (
                <div key={alert.id} className={cn("bg-surface rounded-xl border p-4",
                  alert.severity === 'Critical' ? "border-red-500/30 bg-red-500/5" :
                  alert.severity === 'Warning' ? "border-amber-500/30 bg-amber-500/5" : "border-white/10"
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className={cn("w-4 h-4 shrink-0 mt-0.5",
                        alert.severity === 'Critical' ? "text-red-400" : "text-amber-400"
                      )} />
                      <div>
                        <h4 className="text-sm font-medium text-white">{alert.issue}</h4>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">Account: {alert.accountId}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-3">
                    <p className="text-[10px] text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
                    <Button size="sm" variant="outline" className="text-[10px] h-7 px-2" onClick={() => onResolveAlert(alert.id)}>
                      Acknowledge
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
