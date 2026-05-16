'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { useGatewayDashboard, useTogglePlugin, useBlockConsumer, useAcknowledgeGatewayAlert } from '../hooks/useGatewayAnalytics';
import { Shield, Server, Activity, Search, RefreshCw, Plug, Users, Layers, AlertTriangle, CheckCircle, XCircle, Clock, Globe, Lock, Zap, ToggleRight, ToggleLeft } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { KongGatewayData } from '../types/gateway.types';

type Tab = 'services' | 'plugins' | 'upstreams' | 'consumers' | 'alerts';

const healthColor: Record<string, string> = { healthy: 'text-success-light', unhealthy: 'text-danger-light', dns_error: 'text-warning-light' };
const tierColor: Record<string, string> = { internal: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', premium: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30', standard: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', free: 'bg-gray-500/10 text-gray-400 border-gray-500/30' };

function fmtRel(iso: string) { const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000); return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m/60)}h ago` : `${Math.floor(m/1440)}d ago`; }

export function KongDashboard() {
  const { data, isLoading, refetch, isRefetching } = useGatewayDashboard();
  const togglePlugin = useTogglePlugin();
  const blockConsumer = useBlockConsumer();
  const ackAlert = useAcknowledgeGatewayAlert();
  const [tab, setTab] = useState<Tab>('services');
  const [search, setSearch] = useState('');
  const [localToggled, setLocalToggled] = useState<Set<string>>(new Set());
  const [localBlocked, setLocalBlocked] = useState<Set<string>>(new Set());
  const [localAcked, setLocalAcked] = useState<Set<string>>(new Set());

  const gw = data?.data as KongGatewayData | undefined;
  const m = gw?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'services',  label: 'Services',  icon: Server },
    { key: 'plugins',   label: 'Plugins',   icon: Plug },
    { key: 'upstreams', label: 'Upstreams', icon: Layers },
    { key: 'consumers', label: 'Consumers', icon: Users },
    { key: 'alerts',    label: 'Alerts',    icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Globe className="w-7 h-7 text-emerald-400" /> Kong API Gateway
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Service mesh · Rate limiting · mTLS · Plugin orchestration · Zero Trust API control</p>
        </div>
        <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Sync
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Requests Today', value: isLoading ? '…' : `${((m?.requestsToday ?? 0)/1000).toFixed(1)}K`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Activity },
          { label: 'Avg Latency',    value: isLoading ? '…' : `${m?.avgLatencyMs}ms`,                          color: 'text-amber-400',   bg: 'bg-amber-500/10',   icon: Clock },
          { label: 'Error Rate',     value: isLoading ? '…' : `${m?.errorRate}%`,                               color: 'text-red-400',     bg: 'bg-red-500/10',     icon: XCircle },
          { label: 'Blocked Req',    value: isLoading ? '…' : m?.blockedRequests,                                color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  icon: Shield },
        ].map((s, i) => (
          <Card key={i} className="p-5 border-white/[0.06] bg-surface-dark flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{isLoading ? <Spinner size="sm" /> : String(s.value)}</p>
            </div>
            <div className={`p-3 rounded-xl ${s.bg} group-hover:scale-110 transition-transform`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
          </Card>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-1 p-1 bg-black/30 border border-white/[0.06] rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === t.key ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30' : 'text-gray-400 hover:text-white hover:bg-white/5')}>
            <t.icon className="w-4 h-4" /> {t.label}
            {t.key === 'alerts' && (gw?.alerts.filter(a => a.status === 'Firing').length ?? 0) > 0 && (
              <span className="ml-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{gw?.alerts.filter(a => a.status === 'Firing').length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab}…`}
          className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50" />
      </div>

      {/* SERVICES */}
      {tab === 'services' && (
        <Card className="border-white/[0.06] bg-surface-dark overflow-hidden min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 sticky top-0 border-b border-white/[0.04]">
                  <tr>{['Service', 'Upstream', 'Protocol', 'Routes', 'Req/min', 'P99 Latency', 'Error Rate', 'Status'].map((h,i) => (
                    <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i===0?'pl-6 text-left':'px-4 text-left')}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {(gw?.kongServices ?? []).filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(svc => (
                    <tr key={svc.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"><Server className="w-4 h-4 text-emerald-400" /></div>
                          <div>
                            <p className="font-bold text-white text-sm">{svc.name}</p>
                            <p className="text-[10px] text-gray-500 flex gap-1 flex-wrap mt-0.5">{svc.tags.map(t => <span key={t} className="bg-white/5 px-1.5 py-0.5 rounded">{t}</span>)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-cyan-300">{svc.host}:{svc.port}{svc.path !== '/' ? svc.path : ''}</td>
                      <td className="py-4 px-4"><Badge variant="outline" className="text-[10px] uppercase border-white/10 text-gray-400">{svc.protocol}</Badge></td>
                      <td className="py-4 px-4 text-white font-bold">{svc.routeCount}</td>
                      <td className="py-4 px-4 text-white font-bold">{svc.requestsPerMin.toLocaleString()}</td>
                      <td className="py-4 px-4"><span className={cn('font-bold', svc.latencyP99 > 500 ? 'text-red-400' : svc.latencyP99 > 200 ? 'text-amber-400' : 'text-success-light')}>{svc.latencyP99}ms</span></td>
                      <td className="py-4 px-4"><span className={cn('font-bold', svc.errorRate > 2 ? 'text-red-400' : svc.errorRate > 0.5 ? 'text-amber-400' : 'text-success-light')}>{svc.errorRate}%</span></td>
                      <td className="py-4 px-4"><Badge variant="outline" className={cn('text-[10px]', svc.enabled ? 'border-success/30 text-success-light bg-success/10' : 'border-gray-500/30 text-gray-400')}>{svc.enabled ? 'Enabled' : 'Disabled'}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* PLUGINS */}
      {tab === 'plugins' && (
        <Card className="border-white/[0.06] bg-surface-dark overflow-hidden min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 sticky top-0 border-b border-white/[0.04]">
                  <tr>{['Plugin', 'Scope', 'Priority', 'Applied Today', 'Blocked', 'Status', ''].map((h,i) => (
                    <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i===0?'pl-6 text-left':i===6?'pr-6 text-right':'px-4 text-left')}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {(gw?.plugins ?? []).filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => {
                    const isEnabled = localToggled.has(p.id) ? p.status !== 'enabled' : p.status === 'enabled';
                    return (
                      <tr key={p.id} className={cn('transition-colors group', !isEnabled && 'opacity-50')}>
                        <td className="py-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg"><Plug className="w-4 h-4 text-fuchsia-400" /></div>
                            <p className="font-bold text-white text-sm font-mono">{p.name}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="text-[10px] border-white/10 text-gray-300">{p.scope}</Badge>
                          {p.scopeTarget && <p className="text-[10px] text-gray-500 font-mono mt-0.5">{p.scopeTarget}</p>}
                        </td>
                        <td className="py-4 px-4 text-gray-400 font-mono text-xs">{p.priority}</td>
                        <td className="py-4 px-4 text-white font-bold">{p.appliedToday.toLocaleString()}</td>
                        <td className="py-4 px-4"><span className={cn('font-bold', p.blockedToday > 0 ? 'text-red-400' : 'text-gray-500')}>{p.blockedToday}</span></td>
                        <td className="py-4 px-4">{isEnabled ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-gray-500" />}</td>
                        <td className="py-4 pr-6 text-right">
                          <Button size="sm" variant="outline" onClick={() => { setLocalToggled(prev => new Set([...prev, p.id])); togglePlugin.mutate({ pluginId: p.id, enabled: !isEnabled }); }}
                            className={cn('h-7 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity', isEnabled ? 'border-warning/30 text-warning-light hover:bg-warning/10' : 'border-success/30 text-success-light hover:bg-success/10')}>
                            {isEnabled ? 'Disable' : 'Enable'}
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

      {/* UPSTREAMS */}
      {tab === 'upstreams' && (
        <div className="space-y-4">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> :
            (gw?.upstreams ?? []).filter(u => u.name.toLowerCase().includes(search.toLowerCase())).map(ups => (
              <Card key={ups.id} className="p-5 border-white/[0.06] bg-surface-dark">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl"><Layers className="w-5 h-5 text-cyan-400" /></div>
                    <div>
                      <p className="font-bold text-white">{ups.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Algorithm: <span className="font-mono text-cyan-400">{ups.algorithm}</span> · Slots: {ups.slots.toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn('text-[10px]', ups.healthCheckEnabled ? 'border-success/30 text-success-light bg-success/10' : 'border-gray-500/30 text-gray-400')}>
                    {ups.healthCheckEnabled ? `HC every ${ups.healthCheckInterval}s` : 'No HC'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ups.targets.map(tgt => (
                    <div key={tgt.id} className={cn('p-3 rounded-lg border', tgt.status === 'healthy' ? 'border-success/20 bg-success/5' : 'border-red-500/20 bg-red-500/5')}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-mono text-sm text-white">{tgt.target}</p>
                        <div className="flex items-center gap-1.5">
                          <div className={cn('w-2 h-2 rounded-full', tgt.status === 'healthy' ? 'bg-green-400 animate-pulse' : 'bg-red-400')} />
                          <span className={cn('text-[10px] font-semibold capitalize', healthColor[tgt.status])}>{tgt.status}</span>
                        </div>
                      </div>
                      <div className="flex gap-3 text-[10px] text-gray-500">
                        <span>Weight: <span className="text-white font-bold">{tgt.weight}</span></span>
                        <span>Latency: <span className={cn('font-bold', tgt.latencyMs > 500 ? 'text-red-400' : 'text-white')}>{tgt.latencyMs}ms</span></span>
                        <span>Success: <span className={cn('font-bold', tgt.successRate < 99 ? 'text-amber-400' : 'text-success-light')}>{tgt.successRate}%</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          }
        </div>
      )}

      {/* CONSUMERS */}
      {tab === 'consumers' && (
        <Card className="border-white/[0.06] bg-surface-dark overflow-hidden min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 sticky top-0 border-b border-white/[0.04]">
                  <tr>{['Consumer', 'Auth', 'Rate Limit Tier', 'Requests Today', 'Last Seen', 'Status', ''].map((h,i) => (
                    <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i===0?'pl-6 text-left':i===6?'pr-6 text-right':'px-4 text-left')}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {(gw?.consumers ?? []).filter(c => c.username.toLowerCase().includes(search.toLowerCase())).map(c => {
                    const blocked = localBlocked.has(c.id) || c.blocked;
                    return (
                      <tr key={c.id} className={cn('transition-colors group', blocked && 'opacity-50')}>
                        <td className="py-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2 rounded-lg border', blocked ? 'bg-red-500/10 border-red-500/20' : 'bg-indigo-500/10 border-indigo-500/20')}>
                              <Users className={cn('w-4 h-4', blocked ? 'text-red-400' : 'text-indigo-400')} />
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{c.username}</p>
                              {c.customId && <p className="text-[10px] text-gray-500 font-mono">{c.customId}</p>}
                              <div className="flex gap-1 mt-0.5">{c.tags.map(t => <span key={t} className="text-[9px] bg-white/5 px-1 py-0.5 rounded text-gray-500">{t}</span>)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4"><Badge variant="outline" className="text-[10px] font-mono border-white/10 text-gray-300">{c.authType}</Badge></td>
                        <td className="py-4 px-4"><Badge variant="outline" className={cn('text-[10px] capitalize', tierColor[c.rateLimitTier])}>{c.rateLimitTier}</Badge></td>
                        <td className="py-4 px-4 text-white font-bold">{c.requestsToday.toLocaleString()}</td>
                        <td className="py-4 px-4 text-xs text-gray-500">{fmtRel(c.lastSeen)}</td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className={cn('text-[10px]', blocked ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-success/30 text-success-light bg-success/10')}>
                            {blocked ? 'Blocked' : 'Active'}
                          </Badge>
                        </td>
                        <td className="py-4 pr-6 text-right">
                          {!blocked && (
                            <Button size="sm" variant="outline" onClick={() => { setLocalBlocked(p => new Set([...p, c.id])); blockConsumer.mutate(c.id); }}
                              className="h-7 text-[11px] border-red-500/30 text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <XCircle className="w-3 h-3 mr-1" /> Block
                            </Button>
                          )}
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

      {/* ALERTS */}
      {tab === 'alerts' && (
        <div className="space-y-3">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> :
            (gw?.alerts ?? []).map(alert => {
              const acked = localAcked.has(alert.id) || alert.status !== 'Firing';
              return (
                <Card key={alert.id} className={cn('p-5 border-white/[0.06] bg-surface-dark', !acked && alert.severity === 'High' && 'border-orange-500/30 bg-orange-500/[0.03]', !acked && alert.severity === 'Critical' && 'border-red-500/30 bg-red-500/[0.03]')}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={cn('p-2.5 rounded-xl shrink-0', alert.severity === 'Critical' ? 'bg-red-500/10' : alert.severity === 'High' ? 'bg-orange-500/10' : 'bg-yellow-500/10')}>
                        <AlertTriangle className={cn('w-5 h-5', alert.severity === 'Critical' ? 'text-red-400' : alert.severity === 'High' ? 'text-orange-400' : 'text-yellow-400')} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm">{alert.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{alert.apiName} · {alert.type} · {new Date(alert.firedAt).toLocaleTimeString()}</p>
                        <p className="text-xs text-gray-400 mt-2">{alert.details}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant="outline" className={cn('text-[10px]', !acked ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-success/30 text-success-light bg-success/10')}>
                        {acked ? 'Acknowledged' : 'Firing'}
                      </Badge>
                      {!acked && (
                        <Button size="sm" variant="outline" onClick={() => { setLocalAcked(p => new Set([...p, alert.id])); ackAlert.mutate({ id: alert.id }); }}
                          className="h-7 text-[11px] border-success/30 text-success-light hover:bg-success/10">
                          <CheckCircle className="w-3 h-3 mr-1" /> Ack
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          }
        </div>
      )}
    </div>
  );
}
