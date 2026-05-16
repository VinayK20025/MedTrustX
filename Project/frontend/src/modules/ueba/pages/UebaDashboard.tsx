'use client';
import React, { useMemo } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useUebaData } from '../hooks/useUeba';
import { ShieldAlert, Activity, UserX, ServerCrash, Radar, RefreshCw, BarChart2, Zap } from 'lucide-react';

export function UebaDashboard() {
  const { riskScores, anomalies, baselines, isLoading } = useUebaData();

  const criticalRisks = useMemo(() => riskScores.filter((r: any) => r.currentRiskScore >= 80), [riskScores]);
  const userAnomalies = useMemo(() => anomalies.filter((a: any) => a.targetType === 'user'), [anomalies]);
  const entityAnomalies = useMemo(() => anomalies.filter((a: any) => a.targetType === 'entity'), [anomalies]);

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Radar className="w-7 h-7 text-indigo-400" />
            UEBA Intelligence Layer
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Continuous ZTA Risk Assessment & Behavioral Baselining</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" dot>Live Sync: SIEM/XDR</Badge>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Force Analysis
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Top KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card-hover p-5 border-l-2 border-emergency">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Critical Risk Entities</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{criticalRisks.length}</h3>
                </div>
                <div className="p-2 bg-emergency/10 rounded-lg"><ShieldAlert className="w-5 h-5 text-emergency-light" /></div>
              </div>
            </div>
            
            <div className="glass-card-hover p-5 border-l-2 border-warning">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">User Anomalies (24h)</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{userAnomalies.length}</h3>
                </div>
                <div className="p-2 bg-warning/10 rounded-lg"><UserX className="w-5 h-5 text-warning-light" /></div>
              </div>
            </div>

            <div className="glass-card-hover p-5 border-l-2 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">System/Entity Anomalies</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{entityAnomalies.length}</h3>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg"><ServerCrash className="w-5 h-5 text-blue-400" /></div>
              </div>
            </div>

            <div className="glass-card-hover p-5 border-l-2 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Active Peer Baselines</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{baselines.length}</h3>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg"><BarChart2 className="w-5 h-5 text-purple-400" /></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Scores */}
            <Card>
              <CardHeader title="Continuous Risk Assessment" subtitle="Dynamic ZTA scores feeding IAM" />
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/[0.02] border-y border-white/[0.05]">
                      <tr>
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Risk Score</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Deviation</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Peer Group</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {riskScores.slice(0, 6).map((r: any) => (
                        <tr key={r.targetId} className="hover:bg-white/[0.02]">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              {r.targetType === 'user' ? <UserX className="w-4 h-4 text-gray-400" /> : <ServerCrash className="w-4 h-4 text-gray-400" />}
                              <span className="text-sm text-gray-200">{r.targetId}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-white/10 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${r.currentRiskScore >= 80 ? 'bg-emergency' : r.currentRiskScore >= 50 ? 'bg-warning' : 'bg-success'}`}
                                  style={{ width: `${r.currentRiskScore}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono text-white">{r.currentRiskScore}/100</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-sm text-warning-light">+{r.baselineDeviation}%</td>
                          <td className="px-5 py-3 text-xs text-gray-400 capitalize">{r.peerGroup.replace('_', ' ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>

            {/* Anomalies */}
            <Card>
              <CardHeader title="Real-Time Anomalies" subtitle="Detecting deviations from baseline" />
              <CardBody className="p-4 space-y-3">
                {anomalies.slice(0, 6).map((a: any) => (
                  <div key={a.id} className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-start gap-3 relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-1 h-full ${a.severity === 'critical' ? 'bg-emergency' : a.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                    <div className="p-2 bg-white/[0.05] rounded-lg mt-0.5">
                      <Zap className={`w-4 h-4 ${a.severity === 'critical' ? 'text-emergency-light' : 'text-orange-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-white capitalize">{a.anomalyType.replace(/_/g, ' ')}</p>
                        <span className="text-[10px] text-gray-500 font-mono">{new Date(a.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{a.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary" size="sm">{a.targetId}</Badge>
                        <span className="text-[10px] text-emergency-light font-medium">+ {a.riskScoreDelta} Risk Pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
