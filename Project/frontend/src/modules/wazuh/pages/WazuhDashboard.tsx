'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { useWazuhDashboard, useAcknowledgeAlert, useRestartAgent } from '../hooks/useWazuhAnalytics';
import { Shield, ShieldAlert, AlertTriangle, Search, Server, RefreshCw, CheckCircle, XCircle, Activity, FileText, Lock, Bug, Eye } from 'lucide-react';
import { cn } from '@/utils/cn';

type Tab = 'alerts' | 'agents' | 'vulnerabilities' | 'fim' | 'compliance';

const sevColors: Record<string, string> = {
  critical: 'border-red-500/40 text-red-400 bg-red-500/10',
  high:     'border-orange-500/40 text-orange-400 bg-orange-500/10',
  medium:   'border-yellow-500/40 text-yellow-400 bg-yellow-500/10',
  low:      'border-blue-500/40 text-blue-400 bg-blue-500/10',
};

const agentStatusColors: Record<string, string> = {
  active:           'border-success/30 text-success-light bg-success/10',
  disconnected:     'border-danger/30 text-danger-light bg-danger/10',
  never_connected:  'border-gray-500/30 text-gray-400 bg-gray-500/10',
  pending:          'border-warning/30 text-warning-light bg-warning/10',
};

function fmtRel(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return d < 60 ? `${d}m ago` : d < 1440 ? `${Math.floor(d/60)}h ago` : `${Math.floor(d/1440)}d ago`;
}

export function WazuhDashboard() {
  const { data, isLoading, refetch, isRefetching } = useWazuhDashboard();
  const ackMutation = useAcknowledgeAlert();
  const restartMutation = useRestartAgent();

  const [tab, setTab] = useState<Tab>('alerts');
  const [search, setSearch] = useState('');
  const [localAcked, setLocalAcked] = useState<Set<string>>(new Set());

  const kpis = data?.data?.kpis;
  const alerts = data?.data?.alerts ?? [];
  const agents = data?.data?.agents ?? [];
  const vulns = data?.data?.vulnerabilities ?? [];
  const fim = data?.data?.fimEvents ?? [];
  const sca = data?.data?.scaResults ?? [];

  const handleAck = (id: string) => {
    setLocalAcked(prev => new Set([...prev, id]));
    ackMutation.mutate(id);
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'alerts',          label: 'SIEM Alerts',     icon: ShieldAlert },
    { key: 'agents',          label: 'Agents',          icon: Server },
    { key: 'vulnerabilities', label: 'Vulnerabilities', icon: Bug },
    { key: 'fim',             label: 'FIM Events',      icon: FileText },
    { key: 'compliance',      label: 'SCA / Compliance',icon: Lock },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-red-400" /> Wazuh SIEM / XDR
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Unified threat detection · FIM · Vulnerability management · Compliance (CIS/HIPAA)</p>
        </div>
        <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Agents',       value: isLoading ? '…' : `${kpis?.activeAgents}/${kpis?.totalAgents}`, color: 'text-indigo-400',    bg: 'bg-indigo-500/10', icon: Server },
          { label: 'Critical Alerts',     value: isLoading ? '…' : kpis?.criticalAlerts,                         color: 'text-red-400',       bg: 'bg-red-500/10',    icon: ShieldAlert },
          { label: 'Open Vulns',          value: isLoading ? '…' : kpis?.openVulnerabilities,                    color: 'text-orange-400',    bg: 'bg-orange-500/10', icon: Bug },
          { label: 'Compliance Score',    value: isLoading ? '…' : `${kpis?.complianceScore}%`,                  color: 'text-success-light', bg: 'bg-success/10',    icon: Lock },
        ].map((s, i) => (
          <Card key={i} className="p-5 border-white/[0.06] bg-surface-dark flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{isLoading ? <Spinner size="sm" /> : s.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${s.bg} group-hover:scale-110 transition-transform`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-1 p-1 bg-black/30 border border-white/[0.06] rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === t.key ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5')}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab}…`}
          className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-red-500/50" />
      </div>

      {/* ── ALERTS TAB ── */}
      {tab === 'alerts' && (
        <Card className="border-white/[0.06] bg-surface-dark overflow-hidden min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>{['Severity', 'Rule / Description', 'Agent', 'MITRE ATT&CK', 'Time', 'Action'].map((h,i) => (
                    <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i===0?'pl-6 text-left':i===5?'pr-6 text-right':'px-4 text-left')}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {alerts.filter(a => a.rule.description.toLowerCase().includes(search.toLowerCase())).map(alert => {
                    const acked = localAcked.has(alert.id) || alert.acknowledged;
                    return (
                      <tr key={alert.id} className={cn('transition-colors group', acked ? 'opacity-40' : 'hover:bg-white/[0.02]')}>
                        <td className="py-4 pl-6">
                          <Badge variant="outline" className={cn('capitalize', sevColors[alert.severity])}>{alert.severity}</Badge>
                          <p className="text-[10px] text-gray-600 mt-1">L{alert.rule.level}</p>
                        </td>
                        <td className="py-4 px-4 max-w-[280px]">
                          <p className="text-white font-semibold text-sm truncate">{alert.rule.description}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">Rule: {alert.rule.id}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-300 text-sm">{alert.agent.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{alert.agent.ip}</p>
                        </td>
                        <td className="py-4 px-4">
                          {alert.rule.mitre ? (
                            <div>
                              <p className="text-xs text-orange-400 font-mono">{alert.rule.mitre.id}</p>
                              <p className="text-[10px] text-gray-500">{alert.rule.mitre.technique}</p>
                            </div>
                          ) : <span className="text-gray-600 text-xs">—</span>}
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-500">{fmtRel(alert.timestamp)}</td>
                        <td className="py-4 pr-6 text-right">
                          {!acked && (
                            <Button size="sm" variant="outline" onClick={() => handleAck(alert.id)}
                              className="h-7 text-[11px] border-success/30 text-success-light hover:bg-success/10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <CheckCircle className="w-3 h-3 mr-1" /> Ack
                            </Button>
                          )}
                          {acked && <span className="text-[11px] text-gray-600">Acknowledged</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── AGENTS TAB ── */}
      {tab === 'agents' && (
        <Card className="border-white/[0.06] bg-surface-dark overflow-hidden min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>{['Agent', 'OS / IP', 'Group', 'Version', 'Risk', 'Status', 'Action'].map((h,i) => (
                    <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i===0?'pl-6 text-left':i===6?'pr-6 text-right':'px-4 text-left')}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {agents.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.ip.includes(search)).map(agent => (
                    <tr key={agent.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                            <Server className="w-4 h-4 text-indigo-400" />
                          </div>
                          <p className="font-bold text-white text-sm">{agent.name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-300 text-sm">{agent.os}</p>
                        <p className="text-xs text-gray-500 font-mono">{agent.ip}</p>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm">{agent.group}</td>
                      <td className="py-4 px-4 font-mono text-xs text-gray-500">{agent.version}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden w-16">
                            <div className={cn('h-full rounded-full', agent.riskScore >= 80 ? 'bg-red-500' : agent.riskScore >= 60 ? 'bg-orange-500' : 'bg-green-500')}
                              style={{ width: `${agent.riskScore}%` }} />
                          </div>
                          <span className="text-xs text-gray-400">{agent.riskScore}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('capitalize', agentStatusColors[agent.status])}>{agent.status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <Button size="sm" variant="outline" onClick={() => restartMutation.mutate(agent.id)}
                          className="h-7 text-[11px] border-white/10 text-gray-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <RefreshCw className="w-3 h-3 mr-1" /> Restart
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── VULNERABILITIES TAB ── */}
      {tab === 'vulnerabilities' && (
        <Card className="border-white/[0.06] bg-surface-dark overflow-hidden min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>{['CVE', 'Package / Version', 'Fix', 'CVSS3', 'Agent', 'Status'].map((h,i) => (
                    <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i===0?'pl-6 text-left':'px-4 text-left')}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {vulns.filter(v => v.cve.toLowerCase().includes(search.toLowerCase()) || v.package.includes(search)).map(v => (
                    <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 pl-6">
                        <Badge variant="outline" className={cn('font-mono', sevColors[v.severity])}>{v.cve}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-white font-bold text-sm">{v.package}</p>
                        <p className="text-xs text-gray-500 font-mono">{v.version}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-success-light font-mono">{v.fixedVersion ?? '—'}</td>
                      <td className="py-4 px-4">
                        <span className={cn('text-sm font-bold', v.cvss3Score >= 9 ? 'text-red-400' : v.cvss3Score >= 7 ? 'text-orange-400' : 'text-yellow-400')}>
                          {v.cvss3Score}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm">{v.agentName}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('capitalize', v.status === 'open' ? sevColors.high : v.status === 'mitigated' ? 'text-success-light bg-success/10 border-success/30' : 'text-gray-400 bg-gray-500/10 border-gray-500/30')}>
                          {v.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── FIM TAB ── */}
      {tab === 'fim' && (
        <Card className="border-white/[0.06] bg-surface-dark overflow-hidden min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>{['Event', 'File Path', 'Agent', 'User', 'Hash Change', 'Time'].map((h,i) => (
                    <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i===0?'pl-6 text-left':'px-4 text-left')}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {fim.filter(f => f.file.toLowerCase().includes(search.toLowerCase())).map(f => (
                    <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 pl-6">
                        <Badge variant="outline" className={cn('capitalize', f.eventType === 'modified' ? sevColors.high : f.eventType === 'added' ? sevColors.medium : sevColors.critical)}>
                          {f.eventType}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-indigo-300 max-w-[240px] truncate">{f.file}</td>
                      <td className="py-4 px-4 text-gray-400 text-sm">{f.agentName}</td>
                      <td className="py-4 px-4 font-mono text-xs text-fuchsia-400">{f.user}</td>
                      <td className="py-4 px-4 text-xs text-gray-500 font-mono">
                        {f.md5Before ? <span><span className="text-red-400">{f.md5Before.slice(0,8)}</span> → <span className="text-green-400">{f.md5After?.slice(0,8)}</span></span> : <span className="text-green-400">{f.md5After?.slice(0,8)}</span>}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500">{fmtRel(f.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── COMPLIANCE / SCA TAB ── */}
      {tab === 'compliance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sca.filter(s => s.policyName.toLowerCase().includes(search.toLowerCase())).map(s => (
            <Card key={s.id} className="p-5 border-white/[0.06] bg-surface-dark hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-bold text-white">{s.policyName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.agentName} · Last scan {fmtRel(s.lastScan)}</p>
                </div>
                <div className={cn('text-2xl font-bold', s.score >= 90 ? 'text-success-light' : s.score >= 75 ? 'text-warning-light' : 'text-danger-light')}>
                  {s.score}%
                </div>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                <div className={cn('h-full rounded-full transition-all', s.score >= 90 ? 'bg-green-500' : s.score >= 75 ? 'bg-yellow-500' : 'bg-red-500')}
                  style={{ width: `${s.score}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Passed', value: s.passed, color: 'text-success-light' },
                  { label: 'Failed', value: s.failed, color: 'text-danger-light' },
                  { label: 'N/A',    value: s.notApplicable, color: 'text-gray-500' },
                ].map(stat => (
                  <div key={stat.label} className="p-3 bg-black/20 rounded-lg border border-white/[0.05] text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{stat.label}</p>
                    <p className={`text-lg font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
