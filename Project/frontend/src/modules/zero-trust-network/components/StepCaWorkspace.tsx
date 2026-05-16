'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import {
  Shield, ShieldCheck, KeyRound, AlertTriangle, Search,
  Activity, RotateCw, Plus, Server, Lock, FileText,
  ChevronRight, Clock, CheckCircle, XCircle, AlertCircle,
  Cpu, Globe, Terminal
} from 'lucide-react';
import { useAutoApi } from '@/hooks/useAutoApi';
import { cn } from '@/utils/cn';

/* ── Mock Data ─────────────────────────────────────────── */
const mockCerts = [
  { id: 'cert-1', commonName: 'api.medtrustx.internal',      san: ['api.medtrustx.internal','gateway.internal'], type: 'Server TLS',    status: 'Valid',    expiry: new Date(Date.now() + 8640000000).toISOString(),  issuer: 'MedTrust Intermediate CA', serialNo: '3A:F2:01:CC', fingerprint: 'SHA256:ab12...' },
  { id: 'cert-2', commonName: 'db-ehr-primary.local',        san: ['db-ehr-primary.local'],                       type: 'Client/Server', status: 'Valid',    expiry: new Date(Date.now() + 2592000000).toISOString(),  issuer: 'MedTrust Intermediate CA', serialNo: '1B:CC:90:EE', fingerprint: 'SHA256:cd34...' },
  { id: 'cert-3', commonName: 'iomt-monitor-4402',           san: ['iomt-monitor-4402'],                          type: 'Device mTLS',   status: 'Revoked',  expiry: new Date(Date.now() - 86400000).toISOString(),    issuer: 'MedTrust IoT CA',          serialNo: '09:AA:BB:11', fingerprint: 'SHA256:ef56...' },
  { id: 'cert-4', commonName: 'vpn.medtrustx.internal',      san: ['vpn.medtrustx.internal'],                     type: 'Server TLS',    status: 'Expiring', expiry: new Date(Date.now() + 172800000).toISOString(),   issuer: 'MedTrust Edge CA',         serialNo: '7D:22:FC:09', fingerprint: 'SHA256:gh78...' },
  { id: 'cert-5', commonName: 'keycloak.medtrustx.internal', san: ['keycloak.medtrustx.internal','sso.internal'], type: 'Server TLS',    status: 'Valid',    expiry: new Date(Date.now() + 15552000000).toISOString(), issuer: 'MedTrust Root CA',         serialNo: '5E:88:D3:2A', fingerprint: 'SHA256:ij90...' },
  { id: 'cert-6', commonName: 'k8s-node-worker-03',          san: ['k8s-node-worker-03'],                         type: 'Node Identity', status: 'Valid',    expiry: new Date(Date.now() + 5184000000).toISOString(),  issuer: 'MedTrust Intermediate CA', serialNo: '2C:11:44:BF', fingerprint: 'SHA256:kl12...' },
];

const mockProvisioners = [
  { id: 'prov-1', name: 'ACME (Service Mesh)',  type: 'ACME',   status: 'Active', certs: 3124, lastUsed: new Date(Date.now() - 300000).toISOString() },
  { id: 'prov-2', name: 'JWK (Keycloak OIDC)', type: 'JWK',    status: 'Active', certs: 890,  lastUsed: new Date(Date.now() - 900000).toISOString() },
  { id: 'prov-3', name: 'SSHPOP (Bastion)',     type: 'SSHPOP', status: 'Active', certs: 47,   lastUsed: new Date(Date.now() - 3600000).toISOString() },
  { id: 'prov-4', name: 'K8s Service Account',  type: 'K8sSA',  status: 'Paused', certs: 831, lastUsed: new Date(Date.now() - 86400000).toISOString() },
];

const mockAuditLog = [
  { id: 'a1', action: 'Certificate Issued',  subject: 'api.medtrustx.internal',    actor: 'ACME Provisioner',   ts: new Date(Date.now() - 60000).toISOString(),   level: 'info' },
  { id: 'a2', action: 'Certificate Revoked', subject: 'iomt-monitor-4402',          actor: 'iam-admin@medtrustx', ts: new Date(Date.now() - 3600000).toISOString(),  level: 'warning' },
  { id: 'a3', action: 'CRL Updated',         subject: 'MedTrust CRL v14',           actor: 'CA Engine',           ts: new Date(Date.now() - 7200000).toISOString(),  level: 'info' },
  { id: 'a4', action: 'Root CA Rotated',     subject: 'MedTrust Root CA v3',        actor: 'super-admin',         ts: new Date(Date.now() - 86400000).toISOString(), level: 'critical' },
  { id: 'a5', action: 'Provisioner Added',   subject: 'ACME (Service Mesh)',        actor: 'pki-engineer',        ts: new Date(Date.now() - 172800000).toISOString(),'level': 'info' },
];

const caHierarchy = [
  { id: 'root', label: 'MedTrust Root CA',           type: 'Root CA',         validity: '20y', status: 'Valid', children: ['int-1','int-2'] },
  { id: 'int-1', label: 'MedTrust Intermediate CA',  type: 'Intermediate CA', validity: '5y',  status: 'Valid', children: [] },
  { id: 'int-2', label: 'MedTrust IoT CA',            type: 'Intermediate CA', validity: '3y',  status: 'Valid', children: [] },
];

type Tab = 'certificates' | 'provisioners' | 'hierarchy' | 'audit';

const statusColors: Record<string, string> = {
  Valid:    'border-success/30 text-success-light bg-success/10',
  Expiring: 'border-warning/30 text-warning-light bg-warning/10',
  Revoked:  'border-danger/30 text-danger-light bg-danger/10',
  Active:   'border-success/30 text-success-light bg-success/10',
  Paused:   'border-warning/30 text-warning-light bg-warning/10',
};

const levelColors: Record<string, string> = {
  info:     'text-blue-400 bg-blue-500/10',
  warning:  'text-warning-light bg-warning/10',
  critical: 'text-danger-light bg-danger/10',
};

const typeIcon = (type: string) => {
  if (type.includes('IoT') || type.includes('Device')) return Cpu;
  if (type.includes('K8s') || type.includes('Node')) return Server;
  if (type.includes('SSH')) return Terminal;
  if (type.includes('ACME') || type.includes('JWK')) return Globe;
  return Shield;
};

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ── Main Component ─────────────────────────────────────── */
export function StepCaWorkspace() {
  const { stepCa } = useAutoApi();
  const { data, isLoading, refetch, isRefetching } = stepCa.useList();
  const revokeMutation = stepCa.useDelete();
  const createMutation = stepCa.useCreate();

  const [tab, setTab] = useState<Tab>('certificates');
  const [search, setSearch] = useState('');
  const [localRevoked, setLocalRevoked] = useState<Set<string>>(new Set());

  const apiCerts = (data as any)?.data ?? [];
  const certs = apiCerts.length > 0 ? apiCerts : mockCerts;
  const filtered = certs.filter((c: any) =>
    c.commonName?.toLowerCase().includes(search.toLowerCase()) ||
    c.serialNo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRevoke = async (id: string) => {
    setLocalRevoked(prev => new Set([...prev, id]));
    try { await revokeMutation.mutateAsync(id); } catch {}
  };

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'certificates',  label: 'Certificates',  icon: ShieldCheck },
    { key: 'provisioners',  label: 'Provisioners',  icon: KeyRound },
    { key: 'hierarchy',     label: 'CA Hierarchy',  icon: Lock },
    { key: 'audit',         label: 'Audit Log',     icon: FileText },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <KeyRound className="w-7 h-7 text-indigo-400" /> Step CA — PKI Engine
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Automated Certificate Authority · mTLS Lifecycle · ACME Provisioning · Zero Trust PKI
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5"
            onClick={() => refetch()} disabled={isLoading || isRefetching}>
            <RotateCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Sync CA
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-lg shadow-indigo-900/20"
            onClick={() => createMutation.mutate({ commonName: 'new-service.internal', type: 'Server TLS', status: 'Valid', issuer: 'MedTrust Intermediate CA' })}>
            <Plus className="w-4 h-4 mr-2" /> Issue Certificate
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Certificates', value: '4,892', color: 'text-indigo-400',      bg: 'bg-indigo-500/10',  icon: ShieldCheck },
          { label: 'Revoked (CRL)',        value: '143',   color: 'text-danger-light',    bg: 'bg-danger/10',      icon: XCircle },
          { label: 'Expiring ≤ 48h',       value: '12',    color: 'text-warning-light',   bg: 'bg-warning/10',     icon: Clock },
          { label: 'CA Engine',            value: 'Online', color: 'text-success-light',  bg: 'bg-success/10',     icon: CheckCircle },
        ].map((s, i) => (
          <Card key={i} className="p-5 border-white/[0.06] bg-surface-dark flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${s.bg} group-hover:scale-110 transition-transform`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-black/30 border border-white/[0.06] rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === t.key
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5')}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Certificates Tab ── */}
      {tab === 'certificates' && (
        <Card className="flex-1 border-white/[0.06] bg-surface-dark flex flex-col min-h-[420px] overflow-hidden">
          <div className="p-4 border-b border-white/[0.04] bg-surface-light rounded-t-xl">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search CN or Serial No…"
                className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50" />
            </div>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 sticky top-0 backdrop-blur-xl border-b border-white/[0.04]">
                  <tr>
                    {['Common Name / SAN', 'Type & Issuer', 'Serial No', 'Expires', 'Status', ''].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest',
                        i === 0 ? 'pl-6 text-left' : i === 5 ? 'pr-6 text-right' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {filtered.map((cert: any) => {
                    const revoked = localRevoked.has(cert.id) || cert.status === 'Revoked';
                    const Icon = typeIcon(cert.type ?? '');
                    return (
                      <tr key={cert.id} className={cn('transition-colors group',
                        revoked ? 'opacity-50' : 'hover:bg-white/[0.02]')}>
                        <td className="py-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg shrink-0">
                              <Icon className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div>
                              <p className="font-mono text-sm text-white font-bold">{cert.commonName}</p>
                              {cert.san?.length > 1 && (
                                <p className="text-[10px] text-gray-600 mt-0.5">+{cert.san.length - 1} SAN</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-300 text-sm">{cert.type}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{cert.issuer}</p>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-gray-500">{cert.serialNo}</td>
                        <td className="py-4 px-4 font-mono text-xs text-gray-400">
                          {new Date(cert.expiry).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className={cn('capitalize shadow-inner',
                            statusColors[revoked ? 'Revoked' : cert.status] ?? '')}>
                            {revoked ? 'Revoked' : cert.status}
                          </Badge>
                        </td>
                        <td className="py-4 pr-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!revoked && (
                              <Button size="sm" variant="outline" onClick={() => handleRevoke(cert.id)}
                                className="h-7 text-[11px] border-danger/30 text-danger-light hover:bg-danger/10">
                                Revoke
                              </Button>
                            )}
                            <Button size="sm" variant="outline"
                              className="h-7 text-[11px] border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                              Renew
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

      {/* ── Provisioners Tab ── */}
      {tab === 'provisioners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockProvisioners.map(p => {
            const Icon = typeIcon(p.type);
            return (
              <Card key={p.id} className="p-5 border-white/[0.06] bg-surface-dark hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Type: <span className="font-mono text-indigo-400">{p.type}</span></p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn('shrink-0', statusColors[p.status])}>
                    {p.status}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 bg-black/20 rounded-lg border border-white/[0.05]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Certs Issued</p>
                    <p className="text-lg font-bold text-white mt-0.5">{p.certs.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-black/20 rounded-lg border border-white/[0.05]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Last Used</p>
                    <p className="text-sm font-semibold text-gray-300 mt-0.5">{fmtRelative(p.lastUsed)}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="text-xs border-white/10 text-gray-300 hover:bg-white/5 flex-1">Configure</Button>
                  {p.status === 'Active'
                    ? <Button size="sm" variant="outline" className="text-xs border-warning/30 text-warning-light hover:bg-warning/10">Pause</Button>
                    : <Button size="sm" variant="outline" className="text-xs border-success/30 text-success-light hover:bg-success/10">Resume</Button>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── CA Hierarchy Tab ── */}
      {tab === 'hierarchy' && (
        <Card className="p-6 border-white/[0.06] bg-surface-dark space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-white font-bold text-lg">Certificate Authority Chain</h2>
          </div>
          {caHierarchy.map((ca, idx) => (
            <div key={ca.id} className={cn('flex items-start gap-4 p-4 rounded-xl border transition-colors hover:bg-white/[0.02]',
              ca.type === 'Root CA' ? 'border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.08)]' : 'border-white/[0.06] bg-black/20')}
              style={{ marginLeft: ca.type === 'Root CA' ? 0 : 32 }}>
              <div className={cn('p-2.5 rounded-lg border shrink-0',
                ca.type === 'Root CA' ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-gray-500/10 border-gray-500/20')}>
                <Lock className={cn('w-5 h-5', ca.type === 'Root CA' ? 'text-indigo-400' : 'text-gray-400')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-white">{ca.label}</p>
                  <Badge variant="outline" className={statusColors[ca.status]}>{ca.status}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span>Type: <span className="text-gray-400">{ca.type}</span></span>
                  <span>Validity: <span className="font-mono text-gray-400">{ca.validity}</span></span>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-6 p-4 bg-black/20 border border-white/[0.05] rounded-xl">
            <p className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold mb-3">OCSP / CRL Endpoints</p>
            {[
              { label: 'OCSP Responder',   url: 'https://ocsp.medtrustx.internal/v1' },
              { label: 'CRL Distribution', url: 'https://crl.medtrustx.internal/root.crl' },
            ].map(e => (
              <div key={e.label} className="flex items-center gap-3 mt-2">
                <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500">{e.label}</p>
                  <p className="font-mono text-xs text-indigo-300">{e.url}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Audit Log Tab ── */}
      {tab === 'audit' && (
        <Card className="border-white/[0.06] bg-surface-dark flex flex-col min-h-[400px] overflow-hidden">
          <div className="p-4 border-b border-white/[0.04] bg-surface-light rounded-t-xl">
            <p className="text-white font-bold">PKI Audit Trail</p>
            <p className="text-gray-500 text-xs mt-0.5">All certificate lifecycle events — issuance, revocation, CRL updates</p>
          </div>
          <div className="flex-1 overflow-auto divide-y divide-white/[0.03]">
            {mockAuditLog.map(entry => (
              <div key={entry.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                <div className={cn('p-2 rounded-lg shrink-0', levelColors[entry.level])}>
                  {entry.level === 'critical' ? <AlertTriangle className="w-4 h-4" />
                    : entry.level === 'warning' ? <AlertCircle className="w-4 h-4" />
                    : <Activity className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{entry.action}</p>
                  <p className="text-xs text-gray-500 font-mono truncate mt-0.5">{entry.subject}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">{entry.actor}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{fmtRelative(entry.ts)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
}
