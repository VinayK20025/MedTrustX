'use client';
import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import {
  BrainCircuit, Siren, Network, GitBranch, Cpu, Activity,
  Scale, AlertTriangle, CheckCircle2, TrendingUp, DollarSign, Zap,
} from 'lucide-react';
import {
  useAiPlatformDashboard,
  useRetrainModel, useDeployModel,
  useAcknowledgeCdssAlert, useResolveCdssAlert,
  useSyncDigitalTwin, useTriggerPipeline,
  useApproveGovernance, useRejectGovernance,
  useCancelTrainingJob,
} from '../hooks/useAiPlatform';
import { AiModelRegistryPanel }    from '../components/AiModelRegistryPanel';
import { CdssAlertsPanel }         from '../components/CdssAlertsPanel';
import { TrainingJobsPanel }       from '../components/TrainingJobsPanel';
import { DigitalTwinPanel }        from '../components/DigitalTwinPanel';
import { AnalyticsPipelinesPanel } from '../components/AnalyticsPipelinesPanel';
import { GovernancePanel }         from '../components/GovernancePanel';
import type { AiPlatformMetrics } from '../types';

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiConfig {
  id: string; label: string; value: string | number;
  sub: string; icon: React.ElementType;
  color: 'indigo' | 'rose' | 'emerald' | 'amber' | 'purple' | 'teal' | 'fuchsia' | 'gray';
  alert?: boolean;
}

function KpiCard({ kpi }: { kpi: KpiConfig }) {
  const colorMap: Record<string, string> = {
    indigo:  'bg-indigo-500/10 text-indigo-400  border-indigo-500/20',
    rose:    'bg-rose-500/10   text-rose-400    border-rose-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber:   'bg-amber-500/10  text-amber-400   border-amber-500/20',
    purple:  'bg-purple-500/10 text-purple-400  border-purple-500/20',
    teal:    'bg-teal-500/10   text-teal-400    border-teal-500/20',
    fuchsia: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    gray:    'bg-gray-500/10   text-gray-400    border-gray-500/20',
  };
  const Icon = kpi.icon;
  return (
    <div className={cn(
      'relative rounded-xl border bg-surface-light p-3.5 flex flex-col gap-2 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-card-hover overflow-hidden',
      kpi.alert ? 'border-rose-500/30 bg-rose-500/[0.02]' : 'border-white/[0.06]',
    )}>
      {kpi.alert && <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-rose-500 to-transparent" />}
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">{kpi.label}</p>
        <div className={cn('p-1.5 rounded-lg border', colorMap[kpi.color])}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <p className={cn('text-2xl font-black font-mono', kpi.alert ? 'text-rose-300' : 'text-white')}>
        {kpi.value}
      </p>
      <p className="text-[10px] text-gray-500 leading-none">{kpi.sub}</p>
    </div>
  );
}

function buildKpis(m: AiPlatformMetrics): KpiConfig[] {
  return [
    { id: 'models',    label: 'Models Deployed',     value: m.modelsDeployed,      sub: `${m.totalModels} total in registry`,         icon: BrainCircuit, color: 'indigo'  },
    { id: 'infer',     label: 'Inferences Today',     value: `${(m.totalInferencesToday / 1000).toFixed(0)}K`, sub: `Avg ${m.avgInferenceLatencyMs}ms latency`, icon: Activity, color: 'teal' },
    { id: 'acc',       label: 'Avg Model Accuracy',   value: `${m.avgModelAccuracy}%`,   sub: 'Across all deployed models',            icon: TrendingUp,   color: 'emerald' },
    { id: 'cdss',      label: 'CDSS Alerts Active',   value: m.activeCdssAlerts,    sub: `${m.criticalCdssAlerts} Critical`,           icon: Siren,        color: 'rose',  alert: m.criticalCdssAlerts > 0 },
    { id: 'twins',     label: 'Digital Twins',        value: m.digitalTwinsActive,  sub: `${m.digitalTwinsDrifted} drifted`,           icon: Network,      color: m.digitalTwinsDrifted > 0 ? 'amber' : 'purple' },
    { id: 'gov',       label: 'Governance Pending',   value: m.pendingGovernanceApproval, sub: 'Ethics board review queue',            icon: Scale,        color: m.pendingGovernanceApproval > 0 ? 'amber' : 'fuchsia' },
    { id: 'pipe',      label: 'Pipelines Running',    value: m.analyticsJobsRunning, sub: `${m.analyticsJobsFailed} failed`,          icon: GitBranch,    color: m.analyticsJobsFailed > 0 ? 'rose' : 'teal', alert: m.analyticsJobsFailed > 0 },
    { id: 'drift',     label: 'Drift Alerts',         value: m.driftAlertsActive,   sub: `${m.biasAlertsActive} bias flag(s)`,         icon: AlertTriangle,color: m.driftAlertsActive > 0 ? 'amber' : 'gray' },
    { id: 'gpu',       label: 'GPU Utilization',      value: `${m.gpuUtilizationAvg}%`, sub: 'AI compute cluster',                   icon: Cpu,          color: m.gpuUtilizationAvg > 80 ? 'amber' : 'indigo' },
    { id: 'cost',      label: 'Compute Cost Today',   value: `$${m.computeCostToday.toLocaleString()}`, sub: 'Inference + Training',  icon: DollarSign,   color: 'gray'    },
    { id: 'features',  label: 'Feature Store Entries',value: m.featureStoreEntries, sub: 'Versioned feature sets',                   icon: Zap,          color: 'purple'  },
    { id: 'training',  label: 'Training Jobs Active', value: m.modelsInTraining,    sub: 'GPU-accelerated jobs',                      icon: CheckCircle2, color: 'indigo'  },
  ];
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type TabId = 'overview' | 'cdss' | 'training' | 'twins' | 'pipelines' | 'governance';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview',    label: 'Model Registry',    icon: BrainCircuit },
  { id: 'cdss',        label: 'CDSS Alerts',       icon: Siren        },
  { id: 'training',    label: 'Training Jobs',      icon: Cpu          },
  { id: 'twins',       label: 'Digital Twins',     icon: Network      },
  { id: 'pipelines',   label: 'Pipelines',         icon: GitBranch    },
  { id: 'governance',  label: 'Governance',        icon: Scale        },
];

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export const AiPlatformDashboard: React.FC = () => {
  const setPageMeta = useUIStore(s => s.setPageMeta);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>();

  const { data, isLoading } = useAiPlatformDashboard();
  const retrain   = useRetrainModel();
  const deploy    = useDeployModel();
  const ackCdss   = useAcknowledgeCdssAlert();
  const resCdss   = useResolveCdssAlert();
  const syncTwin  = useSyncDigitalTwin();
  const trigPipe  = useTriggerPipeline();
  const appGov    = useApproveGovernance();
  const rejGov    = useRejectGovernance();
  const cancelJob = useCancelTrainingJob();

  useEffect(() => {
    setPageMeta('AI Platform', 'Unified clinical AI hub — models, CDSS, digital twins, governance & analytics');
  }, [setPageMeta]);

  if (isLoading || !data) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <Skeleton className="xl:col-span-4 h-[600px] rounded-2xl" />
          <Skeleton className="xl:col-span-8 h-[600px] rounded-2xl" />
        </div>
      </div>
    );
  }

  const kpis = buildKpis(data.metrics);

  return (
    <div className="space-y-5 animate-fade-in max-w-[1800px]">
      {/* Breadcrumb + Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Platform' }, { label: 'AI Platform' }]} />
        <div className="flex items-center gap-2">
          {data.metrics.criticalCdssAlerts > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-bold px-3 py-1.5 rounded-lg">
              <Siren className="w-3 h-3 animate-pulse" />
              {data.metrics.criticalCdssAlerts} CRITICAL CDSS ALERT{data.metrics.criticalCdssAlerts > 1 ? 'S' : ''}
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold px-3 py-1.5 rounded-lg">
            <BrainCircuit className="w-3 h-3" />
            AI PLATFORM · ZERO TRUST SECURED
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {kpis.map(k => <KpiCard key={k.id} kpi={k} />)}
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-surface-dark border border-white/[0.06] rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          // Badge counts
          let badge: number | null = null;
          if (tab.id === 'cdss')       badge = data.metrics.activeCdssAlerts;
          if (tab.id === 'governance') badge = data.metrics.pendingGovernanceApproval;
          if (tab.id === 'training')   badge = data.metrics.modelsInTraining;
          if (tab.id === 'twins' && data.metrics.digitalTwinsDrifted > 0) badge = data.metrics.digitalTwinsDrifted;
          if (tab.id === 'pipelines' && data.metrics.analyticsJobsFailed > 0) badge = data.metrics.analyticsJobsFailed;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150',
                isActive
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]',
              )}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {tab.label}
              {badge !== null && badge > 0 && (
                <span className={cn(
                  'px-1.5 py-0.5 rounded-full text-[9px] font-bold',
                  tab.id === 'cdss' ? 'bg-rose-500/20 text-rose-300' :
                  tab.id === 'pipelines' ? 'bg-rose-500/20 text-rose-300' :
                  'bg-amber-500/20 text-amber-300'
                )}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[600px]">
            <div className="xl:col-span-4 h-full">
              <AiModelRegistryPanel
                models={data.models}
                selectedId={selectedModelId}
                onSelect={setSelectedModelId}
                onRetrain={id => retrain.mutate(id)}
                onDeploy={id => deploy.mutate(id)}
              />
            </div>
            <div className="xl:col-span-8 h-full">
              {/* Model detail panel */}
              {selectedModelId ? (
                <ModelDetailView
                  model={data.models.find(m => m.id === selectedModelId)!}
                  onRetrain={id => retrain.mutate(id)}
                  onDeploy={id => deploy.mutate(id)}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-surface-dark border border-white/[0.06] rounded-2xl text-gray-600">
                  <BrainCircuit className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Select a model to view details</p>
                  <p className="text-xs text-gray-700 mt-1">Performance, drift, explainability, and actions</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cdss' && (
          <div className="h-[700px]">
            <CdssAlertsPanel
              alerts={data.cdssAlerts}
              onAcknowledge={id => ackCdss.mutate({ id, by: 'Current User' })}
              onResolve={id => resCdss.mutate(id)}
            />
          </div>
        )}

        {activeTab === 'training' && (
          <div className="h-[700px]">
            <TrainingJobsPanel
              jobs={data.trainingJobs}
              onCancel={id => cancelJob.mutate(id)}
            />
          </div>
        )}

        {activeTab === 'twins' && (
          <div className="h-[700px]">
            <DigitalTwinPanel
              twins={data.digitalTwins}
              onSync={id => syncTwin.mutate(id)}
            />
          </div>
        )}

        {activeTab === 'pipelines' && (
          <div className="h-[700px]">
            <AnalyticsPipelinesPanel
              pipelines={data.analyticsPipelines}
              onTrigger={id => trigPipe.mutate(id)}
            />
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="h-[700px]">
            <GovernancePanel
              records={data.governanceRecords}
              onApprove={id => appGov.mutate(id)}
              onReject={id => rejGov.mutate({ id, reason: 'Manual rejection' })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Model Detail View ────────────────────────────────────────────────────────
function ModelDetailView({
  model, onRetrain, onDeploy,
}: { model: NonNullable<ReturnType<typeof useAiPlatformDashboard>['data']>['models'][number]; onRetrain: (id: string) => void; onDeploy: (id: string) => void }) {
  if (!model) return null;

  const metrics = [
    { label: 'Accuracy',   value: `${model.accuracy.toFixed(1)}%`, good: model.accuracy >= 90 },
    { label: 'Precision',  value: `${model.precision.toFixed(1)}%`, good: model.precision >= 90 },
    { label: 'Recall',     value: `${model.recall.toFixed(1)}%`,   good: model.recall >= 90 },
    { label: 'F1 Score',   value: `${model.f1Score.toFixed(1)}%`,  good: model.f1Score >= 90 },
    { label: 'AUC-ROC',    value: model.auc.toFixed(3),            good: model.auc >= 0.9 },
    { label: 'Latency',    value: `${model.inferenceLatencyMs}ms`, good: model.inferenceLatencyMs <= 100 },
    { label: 'Drift Score',value: model.driftScore.toFixed(3),     good: model.driftScore < 0.1 },
    { label: 'XAI Coverage',value: `${model.explainabilityScore}%`,good: model.explainabilityScore >= 90 },
  ];

  return (
    <div className="h-full flex flex-col bg-surface-dark border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Model header */}
      <div className="px-5 py-4 border-b border-white/[0.06] bg-gradient-to-r from-indigo-500/5 to-transparent flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">{model.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              v{model.version} · {model.domain} · {model.type} · <span className="font-mono">{model.endpoint || 'Not deployed'}</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              {model.governanceApproved ? (
                <span className="flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Governance Approved
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
                  <AlertTriangle className="w-2.5 h-2.5" /> Pending Approval
                </span>
              )}
              <span className={cn('text-[9px] px-1.5 py-0.5 rounded-md border',
                model.biasStatus === 'Clean' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                'bg-amber-500/10 text-amber-400 border-amber-500/20'
              )}>Bias: {model.biasStatus}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {model.status === 'Deployed' && (
              <button onClick={() => onRetrain(model.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition-colors border border-indigo-500/20">
                Retrain
              </button>
            )}
            {model.status === 'Staging' && (
              <button onClick={() => onDeploy(model.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                Promote to Prod
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="px-5 py-4 flex-1 overflow-y-auto">
        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-3">Performance Metrics</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          {metrics.map(m => (
            <div key={m.label} className={cn(
              'rounded-xl border px-3 py-2.5',
              m.good ? 'border-emerald-500/15 bg-emerald-500/[0.03]' : 'border-rose-500/15 bg-rose-500/[0.03]',
            )}>
              <p className="text-[9px] text-gray-500 uppercase">{m.label}</p>
              <p className={cn('text-base font-black font-mono mt-0.5', m.good ? 'text-emerald-300' : 'text-rose-300')}>
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tags */}
        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Tags</p>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {model.tags.map(tag => (
            <span key={tag} className="text-[10px] bg-white/[0.04] text-gray-400 px-2 py-0.5 rounded-full border border-white/[0.06]">
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: 'Training Data', value: `${(model.trainingDataSize / 1_000_000).toFixed(1)}M samples` },
            { label: 'Inferences (24h)', value: `${(model.inferencesLast24h / 1000).toFixed(0)}K` },
            { label: 'Last Retrained', value: model.lastRetrained },
            { label: 'Next Retrain Due', value: model.nextRetrainDue },
            { label: 'Risk Score', value: `${model.riskScore}/10` },
            { label: 'Owner', value: model.owner },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.03] rounded-xl px-3 py-2 border border-white/[0.04]">
              <p className="text-[9px] text-gray-600 uppercase">{s.label}</p>
              <p className="text-xs text-gray-300 font-semibold mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
