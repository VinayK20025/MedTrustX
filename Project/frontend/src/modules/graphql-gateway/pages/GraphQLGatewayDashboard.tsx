'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { cn } from '@/utils/cn';
import { useGraphQLHealth, useGraphQLMetrics, useGraphQLSchema, useGraphQLPlayground } from '../hooks/useGraphQLGateway';
import {
  GitMerge, Activity, Timer, AlertTriangle, Code2, Layers, Zap,
  CheckCircle2, XCircle, ChevronDown, ChevronRight, Play
} from 'lucide-react';

function KPICard({ label, value, sub, color = 'indigo', icon: Icon }: {
  label: string; value: string | number; sub?: string; color?: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-start gap-3 hover:border-white/[0.12] transition-all hover:-translate-y-0.5">
      <div className={`p-2 rounded-lg bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 shrink-0 mt-0.5`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-2xl font-black text-white mt-0.5">{value}</p>
        {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SchemaPanel({ schema }: { schema: { types: any[]; operations: any[] } }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="bg-surface-dark border border-white/[0.06] rounded-xl flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <Layers className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-bold text-white">Federation Schema</span>
        <span className="ml-auto text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-mono">{schema.types.length} types</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {schema.types.map(type => (
          <div key={type.name} className="border border-white/[0.06] rounded-lg overflow-hidden">
            <button onClick={() => setExpanded(expanded === type.name ? null : type.name)}
              className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-white/[0.03] transition-colors">
              {expanded === type.name ? <ChevronDown className="w-3.5 h-3.5 text-violet-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
              <span className="text-sm font-mono text-violet-300">{type.name}</span>
              {type.description && <span className="text-[10px] text-gray-500 ml-2 truncate">{type.description}</span>}
            </button>
            {expanded === type.name && (
              <div className="px-4 pb-3 space-y-1 bg-black/20">
                {type.fields.map((f: any) => (
                  <div key={f.name} className="flex items-center gap-2 text-xs">
                    <span className="text-indigo-300 font-mono">{f.name}</span>
                    <span className="text-gray-600">:</span>
                    <span className="text-emerald-400 font-mono">{f.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function OperationsPanel({ operations }: { operations: any[] }) {
  return (
    <div className="bg-surface-dark border border-white/[0.06] rounded-xl flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <GitMerge className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-bold text-white">Registered Operations</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {operations.map(op => (
          <div key={op.name} className="border border-white/[0.06] rounded-lg p-3 hover:border-indigo-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider',
                op.type === 'query' ? 'bg-emerald-500/20 text-emerald-300' : op.type === 'mutation' ? 'bg-amber-500/20 text-amber-300' : 'bg-violet-500/20 text-violet-300')}>
                {op.type}
              </span>
              <span className="text-sm font-mono text-white">{op.name}</span>
            </div>
            <p className="text-[11px] text-gray-400 mb-2">{op.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {op.args.map((a: any) => (
                <span key={a.name} className="text-[10px] font-mono bg-black/30 px-2 py-0.5 rounded text-indigo-300">{a.name}: {a.type}</span>
              ))}
              {op.args.length > 0 && <span className="text-[10px] text-gray-500">→</span>}
              <span className="text-[10px] font-mono text-emerald-400">{op.returnType}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SAMPLE_QUERIES: Record<string, string> = {
  patientDashboard: `query PatientDashboard {\n  patientDashboard(patientId: "pat-001") {\n    patient { id mrn first_name last_name }\n    vitals { type value unit }\n    conditions { code name status }\n    readmission_risk\n  }\n}`,
  clinicalSummary: `query ClinicalSummary {\n  clinicalSummary(patientId: "pat-001") {\n    vitals { type value unit }\n    conditions { code name status }\n    ai_insights\n  }\n}`,
  adminOverview: `query AdminOverview {\n  adminOverview(tenantId: "tenant_apollo") {\n    iam_stats { metric value }\n    compliance_scores { framework score }\n    active_threats\n  }\n}`,
};

function PlaygroundPanel() {
  const [query, setQuery] = useState(SAMPLE_QUERIES.patientDashboard);
  const [result, setResult] = useState('');
  const [selected, setSelected] = useState('patientDashboard');
  const execute = useGraphQLPlayground();

  const run = async () => {
    setResult('Running...');
    const res = await execute.mutateAsync({ query, variables: {} });
    setResult(JSON.stringify(res, null, 2));
  };

  return (
    <div className="bg-surface-dark border border-white/[0.06] rounded-xl flex flex-col" style={{ minHeight: 440 }}>
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2 flex-wrap">
        <Code2 className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-bold text-white">GraphQL Playground</span>
        <div className="ml-auto flex items-center gap-1.5 flex-wrap">
          {Object.keys(SAMPLE_QUERIES).map(k => (
            <button key={k} onClick={() => { setSelected(k); setQuery(SAMPLE_QUERIES[k]); }}
              className={cn('text-[10px] px-2 py-1 rounded font-mono transition-colors',
                selected === k ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.08]')}>
              {k}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 min-h-0">
        <div className="border-r border-white/[0.06] flex flex-col">
          <div className="px-3 pt-2 pb-1 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Query Editor</span>
            <button onClick={run} disabled={execute.isPending}
              className="ml-auto flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-lg transition-colors disabled:opacity-50">
              <Play className="w-3 h-3" />
              {execute.isPending ? 'Running...' : 'Execute'}
            </button>
          </div>
          <textarea value={query} onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent font-mono text-xs text-gray-200 p-3 resize-none outline-none leading-relaxed"
            rows={12} spellCheck={false} />
        </div>
        <div className="flex flex-col">
          <div className="px-3 pt-2 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Response</span>
          </div>
          <pre className="flex-1 overflow-auto p-3 text-xs font-mono text-emerald-300 leading-relaxed bg-black/20">
            {result || <span className="text-gray-600">Hit Execute to run a query...</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}

export const GraphQLGatewayDashboard: React.FC = () => {
  const healthQ = useGraphQLHealth();
  const metricsQ = useGraphQLMetrics();
  const schemaQ = useGraphQLSchema();
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'playground'>('overview');

  const health = healthQ.data;
  const metrics = metricsQ.data;
  const schema = schemaQ.data;
  const isHealthy = health?.status === 'healthy';

  const TABS = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'schema' as const, label: 'Schema Explorer' },
    { key: 'playground' as const, label: 'Playground' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'GraphQL Federation Gateway' }]} />
        <div className="flex items-center gap-3">
          {health && (
            <div className={cn('flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border',
              isHealthy ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300')}>
              {isHealthy ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {health.service}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-300">
            <GitMerge className="w-3.5 h-3.5" />
            FEDERATION LAYER
          </div>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard label="Requests (24h)" value={(metrics.requests_24h / 1000).toFixed(1) + 'K'} icon={Activity} color="indigo" />
          <KPICard label="Avg Latency"    value={`${metrics.avg_latency_ms}ms`}                 icon={Timer} color="teal" />
          <KPICard label="Error Rate"     value={`${metrics.error_rate_pct}%`}                  icon={AlertTriangle} color={metrics.error_rate_pct < 1 ? 'emerald' : 'rose'} />
          <KPICard label="Schema Types"   value={metrics.schema_types}                           icon={Layers} color="violet" />
          <KPICard label="Resolvers"      value={metrics.resolvers_registered}                  icon={GitMerge} color="amber" />
          <KPICard label="Operations"     value={metrics.top_operations.length}                 icon={Zap} color="purple" />
        </div>
      )}

      <div className="flex items-center gap-1 bg-surface-dark border border-white/[0.06] rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn('px-4 py-2 text-sm font-semibold rounded-lg transition-all',
              activeTab === tab.key ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30' : 'text-gray-400 hover:text-gray-200')}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-white">Top Operations (24h)</span>
            </div>
            {metrics.top_operations.map(op => {
              const max = Math.max(...metrics.top_operations.map(o => o.calls));
              return (
                <div key={op.name} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-mono text-gray-300">{op.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{op.calls.toLocaleString()}</span>
                      <span className={cn('font-mono', op.avg_ms > 200 ? 'text-amber-400' : 'text-emerald-400')}>{op.avg_ms}ms</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/[0.04] rounded-full h-1.5">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(op.calls / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <GitMerge className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-bold text-white">Gateway Architecture</span>
            </div>
            <div className="space-y-2.5">
              {[
                { layer: 'GraphQL Federation (:8023)', role: 'Strawberry schema — unified entry point', color: 'violet' },
                { layer: 'API Composition (:8022)', role: 'Parallel REST aggregation + circuit breakers', color: 'indigo' },
                { layer: 'Kong Config (:8021)', role: 'Kong Admin API, plugins, WAF, rate limiting', color: 'amber' },
                { layer: 'Kong Edge (:8000)', role: 'L7 proxy — PQC Auth, Lua plugins', color: 'emerald' },
                { layer: '11 Microservices', role: 'Patient, Clinical, AI, GRC, Security', color: 'teal' },
              ].map((l, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg bg-${l.color}-500/5 border border-${l.color}-500/20`}>
                  <div className={`w-2 h-2 rounded-full bg-${l.color}-400 shrink-0`} />
                  <div>
                    <p className={`text-xs font-mono text-${l.color}-300`}>{l.layer}</p>
                    <p className="text-[11px] text-gray-500">{l.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schema' && schema && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ height: '60vh' }}>
          <SchemaPanel schema={schema} />
          <OperationsPanel operations={schema.operations} />
        </div>
      )}

      {activeTab === 'playground' && <PlaygroundPanel />}
    </div>
  );
};
