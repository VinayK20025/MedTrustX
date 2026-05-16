'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import {
  useThreatDetectionDashboard, useUpdateAlertStatus,
  useToggleDetectionRule, useAcknowledgeAnomaly,
} from '../hooks/useThreatDetection';
import {
  ShieldAlert, AlertTriangle, Search, Server, RefreshCw,
  Activity, Eye, CheckCircle, Lock, Crosshair, Cpu, Radio,
  TrendingUp, Clock, Target, Zap,
} from 'lucide-react';
import { cn } from '@/utils/cn';

type Tab = 'alerts' | 'anomalies' | 'rules' | 'engines';

const sevColor: Record<string, string> = {
  critical: 'border-red-500/40 text-red-400 bg-red-500/10',
  high:     'border-orange-500/40 text-orange-400 bg-orange-500/10',
  medium:   'border-yellow-500/40 text-yellow-400 bg-yellow-500/10',
  low:      'border-blue-500/40 text-blue-400 bg-blue-500/10',
  info:     'border-gray-500/40 text-gray-400 bg-gray-500/10',
};

const statusColor: Record<string, string> = {
  open:           'border-red-500/30 text-red-400 bg-red-500/10',
  investigating:  'border-orange-500/30 text-orange-400 bg-orange-500/10',
  contained:      'border-yellow-500/30 text-yellow-400 bg-yellow-500/10',
  resolved:       'border-success/30 text-success-light bg-success/10',
  false_positive: 'border-gray-500/30 text-gray-400 bg-gray-500/10',
};

const engineStatusColor: Record<string, string> = {
  online:   'text-success-light',
  degraded: 'text-warning-light',
  offline:  'text-danger-light',
};

const anomalyLabels: Record<string, string> = {
  lateral_movement:     'Lateral Movement',
  data_exfiltration:    'Data Exfiltration',
  privilege_escalation: 'Privilege Escalation',
  c2_communication:     'C2 Communication',
  brute_force:          'Brute Force',
  insider_threat:       'Insider Threat',
};

function fmtRel(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m/60)}h ago` : `${Math.floor(m/1440)}d ago`;
}

export function ThreatDetectionDashboard() {
  const { data, isLoading, refetch, isRefetching } = useThreatDetectionDashboard();
  const updateStatus   = useUpdateAlertStatus();
  const toggleRule     = useToggleDetectionRule();
  const ackAnomaly     = useAcknowledgeAnomaly();

  const [tab, setTab] = useState<Tab>('alerts');
  const [search, setSearch] = useState('');
  const [localContained, setLocalContained] = useState<Set<string>>(new Set());
  const [localAcked, setLocalAcked]         = useState<Set<string>>(new Set());
  const [localDisabled, setLocalDisabled]   = useState<Set<string>>(new Set());

  const m = data?.data?.metrics;
  const alerts    = data?.data?.alerts    ?? [];
  const anomalies = data?.data?.anomalies ?? [];
  const rules     = data?.data?.rules     ?? [];
  const engines   = data?.data?.engines   ?? [];

  const handleContain = (id: string) => {
    setLocalContained(p => new Set([...p, id]));
    updateStatus.mutate({ alertId: id, status: 'contained' });
  };

  const handleToggleRule = (id: string, currentStatus: string) => {
    setLocalDisabled(p => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    toggleRule.mutate(id);
  };

  const handleAck = (id: string) => {
    setLocalAcked(p => new Set([...p, id]));
    ackAnomaly.mutate(id);
  };

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'alerts',    label: 'Detection Alerts',  icon: ShieldAlert },
    { key: 'anomalies', label: 'Behavioral Anomalies', icon: Activity },
    { key: 'rules',     label: 'Detection Rules',   icon: Target },
    { key: 'engines',   label: 'Engine Status',     icon: Cpu },
  ];

  const kpis = [
    { label: 'Critical Open',       value: isLoading ? '…' : m?.criticalOpen,                  color: 'text-red-400',       bg: 'bg-red-500/10',     icon: ShieldAlert },
    { label: 'MTTD (min)',          value: isLoading ? '…' : m?.meanTimeToDetect,               color: 'text-orange-400',    bg: 'bg-orange-500/10',  icon: Clock },
    { label: 'MTTR (min)',          value: isLoading ? '…' : m?.meanTimeToRespond,              color: 'text-yellow-400',    bg: 'bg-yellow-500/10',  icon: TrendingUp },
    { label: 'Rule Coverage',       value: isLoading ? '…' : `${m?.rulesCoverage}%`,            color: 'text-indigo-400',    bg: 'bg-indigo-500/10',  icon: Target },
    { label: 'False Positive Rate', value: isLoading ? '…' : `${m?.falsePositiveRate}%`,        color: 'text-success-light', bg: 'bg-success/10',     icon: CheckCircle },
    { label: 'Engines Online',      value: isLoading ? '…' : `${m?.enginesOnline}/5`,           color: 'text-cyan-400',      bg: 'bg-cyan-500/10',    icon: Zap },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Crosshair className="w-7 h-7 text-red-400" /> Threat Detection Engine
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Real-time behavioral analytics · IDS/IPS · UEBA · ML anomaly scoring · MITRE ATT&amp;CK mapped
          </p>
        </div>
        <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5"
          onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((s, i) => (
          <Card key={i} className="p-4 border-white/[0.06] bg-surface-dark flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold leading-tight">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>{isLoading ? <Spinner size="sm" /> : String(s.value)}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${s.bg} group-hover:scale-110 transition-transform`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-1 p-1 bg-black/30 border border-white/[0.06] rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === t.key ? 'bg-red-700 text-white shadow-lg shadow-red-900/30' : 'text-gray-400 hover:text-white hover:bg-white/5')}>
            <t.icon className="w-4 h-4" /> {t.label}
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
                <thead className="bg-black/40 sticky top-0 border-b border-white/[0.04]">
                  <tr>
                    {['Severity', 'Detection', 'MITRE ATT&CK', 'Asset', 'Engine / Rule', 'ML Score', 'Status', ''].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest',
                        i === 0 ? 'pl-6 text-left' : i === 7 ? 'pr-6 text-right' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {alerts.filter(a =>
                    a.title.toLowerCase().includes(search.toLowerCase()) ||
                    a.mitre.technique.toLowerCase().includes(search.toLowerCase())
                  ).map(alert => {
                    const isContained = localContained.has(alert.id) || alert.status === 'contained' || alert.status === 'resolved';
                    const displayStatus = localContained.has(alert.id) ? 'contained' : alert.status;
                    return (
                      <tr key={alert.id} className={cn('transition-colors group', isContained ? 'opacity-50' : 'hover:bg-white/[0.02]')}>
                        <td className="py-4 pl-6">
                          <Badge variant="outline" className={cn('capitalize', sevColor[alert.severity])}>{alert.severity}</Badge>
                        </td>
                        <td className="py-4 px-4 max-w-[240px]">
                          <p className="font-bold text-white text-sm leading-tight">{alert.title}</p>
                          <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{alert.description}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-xs font-mono text-orange-400">{alert.mitre.id}</p>
                          <p className="text-[10px] text-gray-500">{alert.mitre.technique}</p>
                          <p className="text-[10px] text-gray-600 italic">{alert.mitre.tactic}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-300 text-sm">{alert.asset.hostname}</p>
                          <p className="text-xs text-gray-500 font-mono">{alert.asset.ip}</p>
                          <p className="text-[10px] text-gray-600 capitalize">{alert.asset.type}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-300 text-xs">{alert.source.engine}</p>
                          <p className="text-[10px] font-mono text-gray-500">{alert.source.ruleId}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className={cn('h-full rounded-full', alert.score >= 90 ? 'bg-red-500' : alert.score >= 70 ? 'bg-orange-500' : 'bg-yellow-500')}
                                style={{ width: `${alert.score}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-300">{alert.score}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className={cn('capitalize text-[10px]', statusColor[displayStatus])}>
                            {displayStatus.replace('_', ' ')}
                          </Badge>
                          {alert.assignee && <p className="text-[10px] text-gray-600 mt-1">→ {alert.assignee}</p>}
                        </td>
                        <td className="py-4 pr-6 text-right">
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!isContained && (
                              <Button size="sm" variant="outline" onClick={() => handleContain(alert.id)}
                                className="h-7 text-[11px] border-warning/30 text-warning-light hover:bg-warning/10">
                                Contain
                              </Button>
                            )}
                            <Button size="sm" variant="outline"
                              className="h-7 text-[11px] border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                              <Eye className="w-3 h-3 mr-1" /> Investigate
                            </Button>
                          </div>
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

      {/* ── ANOMALIES TAB ── */}
      {tab === 'anomalies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? <div className="flex justify-center p-16 col-span-2"><Spinner size="lg" /></div> :
            anomalies.filter(a =>
              a.entity.toLowerCase().includes(search.toLowerCase()) ||
              anomalyLabels[a.type]?.toLowerCase().includes(search.toLowerCase())
            ).map(a => {
              const acked = localAcked.has(a.id) || a.acknowledged;
              return (
                <Card key={a.id} className={cn('p-5 border-white/[0.06] bg-surface-dark hover:bg-white/[0.02] transition-colors', acked && 'opacity-50')}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2.5 rounded-xl border', a.riskScore >= 90 ? 'bg-red-500/10 border-red-500/30' : a.riskScore >= 75 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-yellow-500/10 border-yellow-500/30')}>
                        <Activity className={cn('w-5 h-5', a.riskScore >= 90 ? 'text-red-400' : a.riskScore >= 75 ? 'text-orange-400' : 'text-yellow-400')} />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{anomalyLabels[a.type]}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          <span className="font-mono text-indigo-400">{a.entity}</span>
                          <span className="ml-2 capitalize text-gray-600">({a.entityType})</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn('text-2xl font-bold', a.riskScore >= 90 ? 'text-red-400' : a.riskScore >= 75 ? 'text-orange-400' : 'text-yellow-400')}>{a.riskScore}</p>
                      <p className="text-[10px] text-gray-500">Risk Score</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{a.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-black/20 border border-white/[0.05] rounded-lg text-center">
                        <p className="text-[9px] text-gray-500 uppercase">Deviation</p>
                        <p className="text-sm font-bold text-fuchsia-400">{a.baselineDeviation}σ</p>
                      </div>
                      <p className="text-xs text-gray-600">{fmtRel(a.timestamp)}</p>
                    </div>
                    {!acked && (
                      <Button size="sm" variant="outline" onClick={() => handleAck(a.id)}
                        className="h-7 text-[11px] border-success/30 text-success-light hover:bg-success/10">
                        <CheckCircle className="w-3 h-3 mr-1" /> Acknowledge
                      </Button>
                    )}
                    {acked && <span className="text-[11px] text-gray-600">Acknowledged</span>}
                  </div>
                </Card>
              );
            })
          }
        </div>
      )}

      {/* ── RULES TAB ── */}
      {tab === 'rules' && (
        <Card className="border-white/[0.06] bg-surface-dark overflow-hidden min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 sticky top-0 border-b border-white/[0.04]">
                  <tr>
                    {['Rule', 'Engine', 'Category', 'Severity', 'Hit Count', 'FP Rate', 'Status', ''].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest',
                        i === 0 ? 'pl-6 text-left' : i === 7 ? 'pr-6 text-right' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {rules.filter(r =>
                    r.name.toLowerCase().includes(search.toLowerCase()) ||
                    r.engine.toLowerCase().includes(search.toLowerCase())
                  ).map(rule => {
                    const disabled = localDisabled.has(rule.id) ? rule.status !== 'active' : rule.status !== 'active';
                    const displayStatus = localDisabled.has(rule.id)
                      ? (rule.status === 'active' ? 'disabled' : 'active')
                      : rule.status;
                    return (
                      <tr key={rule.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 pl-6 max-w-[220px]">
                          <p className="font-bold text-white text-sm truncate">{rule.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{rule.description}</p>
                          <p className="text-[10px] text-gray-600 font-mono mt-0.5">v{rule.version} · {rule.author}</p>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-400 bg-indigo-500/10">{rule.engine}</Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-xs capitalize">{rule.category.replace('_', ' ')}</td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className={cn('capitalize text-[10px]', sevColor[rule.severity])}>{rule.severity}</Badge>
                        </td>
                        <td className="py-4 px-4 text-white font-bold">{rule.hitCount.toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <span className={cn('text-sm font-bold', rule.falsePositiveRate > 3 ? 'text-red-400' : rule.falsePositiveRate > 1 ? 'text-yellow-400' : 'text-success-light')}>
                            {rule.falsePositiveRate}%
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className={cn('capitalize text-[10px]',
                            displayStatus === 'active'   ? 'border-success/30 text-success-light bg-success/10' :
                            displayStatus === 'testing'  ? 'border-warning/30 text-warning-light bg-warning/10' :
                            'border-gray-500/30 text-gray-400 bg-gray-500/10')}>
                            {displayStatus}
                          </Badge>
                        </td>
                        <td className="py-4 pr-6 text-right">
                          <Button size="sm" variant="outline"
                            onClick={() => handleToggleRule(rule.id, rule.status)}
                            className={cn('h-7 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity',
                              displayStatus === 'active'
                                ? 'border-warning/30 text-warning-light hover:bg-warning/10'
                                : 'border-success/30 text-success-light hover:bg-success/10')}>
                            {displayStatus === 'active' ? 'Disable' : 'Enable'}
                          </Button>
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

      {/* ── ENGINES TAB ── */}
      {tab === 'engines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? <div className="flex justify-center p-16 col-span-3"><Spinner size="lg" /></div> :
            engines.filter(e => e.name.toLowerCase().includes(search.toLowerCase())).map(e => (
              <Card key={e.id} className="p-5 border-white/[0.06] bg-surface-dark hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl group-hover:scale-105 transition-transform">
                      <Cpu className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{e.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{e.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', e.status === 'online' ? 'bg-green-400 animate-pulse' : e.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400')} />
                    <span className={cn('text-xs font-semibold capitalize', engineStatusColor[e.status])}>{e.status}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Version',     value: e.version },
                    { label: 'Alerts/Day',  value: e.alertsToday },
                    { label: 'Events/sec',  value: e.eventsPerSec.toLocaleString() },
                  ].map((s, i) => (
                    <div key={i} className="p-2.5 bg-black/20 rounded-lg border border-white/[0.05] text-center">
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest">{s.label}</p>
                      <p className="text-sm font-bold text-white mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', e.status === 'online' ? 'bg-green-500' : e.status === 'degraded' ? 'bg-yellow-500 w-1/2' : 'bg-red-500 w-0')}
                    style={{ width: e.status === 'online' ? '100%' : e.status === 'degraded' ? '55%' : '0%' }} />
                </div>
                <p className="text-[10px] text-gray-600 mt-1.5">Engine health</p>
              </Card>
            ))
          }
        </div>
      )}
    </div>
  );
}
