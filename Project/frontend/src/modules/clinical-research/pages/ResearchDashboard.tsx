'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  FlaskConical, ClipboardList, Users, Database, Scale,
  Search, RefreshCw, Play, Pause, XCircle, Clock, CheckCircle,
  AlertTriangle, DollarSign, FileText, UploadCloud
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useResearchDashboard, 
  useUpdateTrialStatus,
  usePublishDataset 
} from '../hooks/useResearch';

type Tab = 'trials' | 'patients' | 'datasets' | 'compliance';

const statusColor: Record<string, string> = {
  'Active': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Recruiting': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 animate-pulse',
  'Completed': 'text-success-light bg-success/10 border-success/30',
  'Suspended': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Terminated': 'text-danger-light bg-danger/10 border-danger/30',
  'Planning': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'Screening': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'Enrolled': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Withdrawn': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  'Screen Failed': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Published': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Draft': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  'Archived': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Approved': 'text-success-light bg-success/10 border-success/30',
  'Pending Review': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Modifications Required': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Expired': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatCurrency = (val: number) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
  return `$${val}`;
};

export function ResearchDashboard() {
  const { data, isLoading, isRefetching, refetch } = useResearchDashboard();
  const updateTrial = useUpdateTrialStatus();
  const publishDataset = usePublishDataset();

  const [tab, setTab] = useState<Tab>('trials');
  const [search, setSearch] = useState('');

  const [localTrialStatus, setLocalTrialStatus] = useState<Record<string, string>>({});
  const [localDatasetStatus, setLocalDatasetStatus] = useState<Record<string, string>>({});

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const handleUpdateTrial = (id: string, newStatus: string) => {
    setLocalTrialStatus(p => ({ ...p, [id]: newStatus }));
    updateTrial.mutate({ trialId: id, status: newStatus });
  };

  const handlePublish = (id: string) => {
    setLocalDatasetStatus(p => ({ ...p, [id]: 'Published' }));
    publishDataset.mutate(id);
  };

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'trials', label: 'Clinical Trials', icon: ClipboardList },
    { key: 'patients', label: 'Enrolled Cohorts', icon: Users },
    { key: 'datasets', label: 'Research Datasets', icon: Database },
    { key: 'compliance', label: 'IRB & Ethics', icon: Scale },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FlaskConical className="w-7 h-7 text-indigo-400" /> Clinical Research Hub
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Trial Management · Patient Cohorts · Data Sharing · IRB Compliance
          </p>
        </div>
        <Button 
          variant="outline" 
          className="border-white/10 text-gray-300 hover:bg-white/5" 
          onClick={() => refetch()} 
          disabled={isRefetching}
        >
          <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> 
          Sync
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Active Trials', value: metrics?.activeTrials, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: ClipboardList },
          { label: 'Enrolled Patients', value: metrics?.totalEnrolledPatients?.toLocaleString(), color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Users },
          { label: 'Pending IRB', value: metrics?.pendingIRBReviews, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Scale },
          { label: 'Adverse Events (30d)', value: metrics?.adverseEventsLast30Days, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertTriangle },
          { label: 'Published Datasets', value: metrics?.totalDatasetsPublished, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Database },
          { label: 'Active Grants', value: formatCurrency(metrics?.fundingActiveGrants || 0), color: 'text-gray-300', bg: 'bg-white/5', icon: DollarSign },
        ].map((s, i) => (
          <Card key={i} className="p-4 border-white/[0.06] bg-surface-dark flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>
                {isLoading ? <Spinner size="sm" /> : String(s.value || 0)}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${s.bg} group-hover:scale-110 transition-transform`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 p-1 bg-black/30 border border-white/[0.06] rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === t.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'text-gray-400 hover:text-white hover:bg-white/5')}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder={`Search ${tab}…`}
          className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50" 
        />
      </div>

      {/* TAB: Trials */}
      {tab === 'trials' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Protocol / Title', 'PI & Dept', 'Phase', 'Enrollment', 'Timeline', 'Status', ''].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : i === 6 ? 'pr-6 text-right' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.trials.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.protocolId.toLowerCase().includes(search.toLowerCase())).map(trial => {
                    const currentStatus = localTrialStatus[trial.id] || trial.status;
                    const pct = Math.round((trial.currentEnrollment / trial.targetEnrollment) * 100);
                    return (
                      <tr key={trial.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 pl-6">
                          <p className="text-[10px] text-gray-400 font-mono mb-0.5">{trial.protocolId}</p>
                          <p className="font-bold text-white text-sm truncate max-w-[250px]">{trial.title}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {trial.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-gray-400">{tag}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium text-indigo-300">{trial.principalInvestigator}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{trial.department}</p>
                        </td>
                        <td className="py-4 px-4"><Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-gray-300">{trial.phase}</Badge></td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full w-16">
                              <div className={cn("h-full rounded-full", pct >= 100 ? "bg-success" : pct > 50 ? "bg-indigo-500" : "bg-gray-500")} style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                            <span className="text-[10px] text-white font-mono">{trial.currentEnrollment} / {trial.targetEnrollment}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-[10px] text-gray-400">Start: {fmtDate(trial.startDate)}</p>
                          <p className="text-[10px] text-gray-500">End: {fmtDate(trial.estimatedEndDate)}</p>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className={cn('text-[10px] px-2', statusColor[currentStatus])}>
                            {currentStatus}
                          </Badge>
                        </td>
                        <td className="py-4 pr-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {currentStatus === 'Planning' && (
                              <Button size="sm" variant="outline" onClick={() => handleUpdateTrial(trial.id, 'Recruiting')} className="h-7 text-[11px] border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                                <Play className="w-3 h-3 mr-1" /> Start Recruiting
                              </Button>
                            )}
                            {currentStatus === 'Recruiting' && (
                              <Button size="sm" variant="outline" onClick={() => handleUpdateTrial(trial.id, 'Active')} className="h-7 text-[11px] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                                Close Enrollment
                              </Button>
                            )}
                            {(currentStatus === 'Active' || currentStatus === 'Recruiting') && (
                              <Button size="sm" variant="outline" onClick={() => handleUpdateTrial(trial.id, 'Suspended')} className="h-7 text-[11px] border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                                <Pause className="w-3 h-3 mr-1" /> Suspend
                              </Button>
                            )}
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

      {/* TAB: Patients */}
      {tab === 'patients' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Patient ID / Name', 'Trial', 'Demographics', 'Enrolled Date', 'Next Visit', 'AE / Deviations', 'Status'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.patients.filter(p => p.patientName.toLowerCase().includes(search.toLowerCase()) || p.patientId.toLowerCase().includes(search.toLowerCase())).map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                        <p className="font-bold text-white text-sm">{p.patientName}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{p.patientId}</p>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-indigo-300">{p.trialId}</td>
                      <td className="py-4 px-4 text-xs text-gray-300">{p.age} y/o · {p.gender}</td>
                      <td className="py-4 px-4 text-xs text-gray-400">{fmtDate(p.enrollmentDate)}</td>
                      <td className="py-4 px-4">
                        <span className={cn('text-xs font-semibold', !p.nextVisitDate ? 'text-gray-600' : 'text-amber-400')}>
                          {fmtDate(p.nextVisitDate)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-3">
                          <span className={cn('text-xs font-bold', p.adverseEvents > 0 ? 'text-rose-400' : 'text-gray-500')}>AE: {p.adverseEvents}</span>
                          <span className={cn('text-xs font-bold', p.protocolDeviations > 0 ? 'text-amber-400' : 'text-gray-500')}>PD: {p.protocolDeviations}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[10px] px-2', statusColor[p.status])}>
                          {p.status}
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

      {/* TAB: Datasets */}
      {tab === 'datasets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
            dbData?.datasets.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map(d => {
              const currentStatus = localDatasetStatus[d.id] || d.status;
              return (
                <Card key={d.id} className="p-5 border-white/[0.06] bg-surface-dark hover:bg-white/[0.02] transition-colors group flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-gray-300">
                      {d.format}
                    </Badge>
                    <Badge variant="outline" className={cn('text-[10px]', statusColor[currentStatus])}>
                      {currentStatus}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-indigo-400 transition-colors">{d.name}</h3>
                  <p className="text-[11px] text-gray-500 mb-4 line-clamp-2">{d.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
                    <div className="bg-black/20 rounded-lg p-2.5 border border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase">Patients</p>
                      <p className="text-sm font-bold text-white mt-0.5">{d.patientCount.toLocaleString()}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-2.5 border border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase">Size / Vars</p>
                      <p className="text-sm font-bold text-white mt-0.5">{d.sizeMb}MB / {d.variableCount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs border-t border-white/[0.04] pt-3">
                    <span className="text-gray-400 flex items-center gap-1.5 font-mono">{d.id}</span>
                    {currentStatus === 'Draft' ? (
                      <Button size="sm" variant="outline" onClick={() => handlePublish(d.id)} className="h-7 text-[11px] border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 px-2">
                        <UploadCloud className="w-3 h-3 mr-1" /> Publish
                      </Button>
                    ) : (
                      <span className="text-gray-500">Access: {d.accessLevel}</span>
                    )}
                  </div>
                </Card>
              );
            })
          }
        </div>
      )}

      {/* TAB: Compliance */}
      {tab === 'compliance' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Protocol ID', 'Trial Link', 'Board / Reviewer', 'Approval Date', 'Expiration', 'Status'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.protocols.filter(p => p.irbNumber.toLowerCase().includes(search.toLowerCase()) || p.trialId.toLowerCase().includes(search.toLowerCase())).map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6 font-mono text-sm text-white">{p.irbNumber}</td>
                      <td className="py-4 px-4 font-mono text-xs text-indigo-300">{p.trialId}</td>
                      <td className="py-4 px-4 text-sm text-gray-300">{p.reviewer}</td>
                      <td className="py-4 px-4 text-xs text-gray-400">{fmtDate(p.approvalDate || '')}</td>
                      <td className="py-4 px-4">
                        <span className={cn('text-xs font-semibold', !p.expirationDate ? 'text-gray-600' : 'text-white')}>
                          {fmtDate(p.expirationDate)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[10px] px-2', statusColor[p.status])}>
                          {p.status}
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
    </div>
  );
}
