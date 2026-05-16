'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { BrainCircuit, Activity, BarChart3, TrendingUp, TrendingDown, AlertTriangle, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { DataScientistData } from '../types/data-scientist.types';

interface WorkspaceProps {
  data: DataScientistData;
  onRetrainModel: (id: string) => void;
}

export const DataScientistWorkspace: React.FC<WorkspaceProps> = ({ data, onRetrainModel }) => {
  const [activeTab, setActiveTab] = useState('predictions');

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader title="Intelligence Workspace" subtitle="Predictive models, population trends, and feature tracking" />
      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'predictions', label: 'Risk Predictions', icon: <User className="w-4 h-4" /> },
            { id: 'models', label: 'Predictive Models', icon: <BrainCircuit className="w-4 h-4" /> },
            { id: 'population', label: 'Population Health', icon: <Activity className="w-4 h-4" /> },
            { id: 'features', label: 'Feature Engine', icon: <BarChart3 className="w-4 h-4" /> },
          ]}
        />

        {/* RISK PREDICTIONS */}
        {activeTab === 'predictions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-white">Patient Risk Scoring</h3>
              <span className="text-xs text-gray-400">Real-time Inference</span>
            </div>
            {data.riskPredictions.map((pred, idx) => (
              <div key={idx} className={cn("bg-surface rounded-xl border p-4",
                pred.riskLevel === 'High' ? "border-red-500/30" : "border-white/10"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 mr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-gray-500">{pred.patientId}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold",
                        pred.riskLevel === 'High' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        pred.riskLevel === 'Medium' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      )}>{pred.riskLevel} Risk</span>
                    </div>
                    <h4 className="text-sm font-medium text-white">{pred.name} ({pred.age}y)</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">{pred.condition}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-500 uppercase">Risk Score</p>
                    <p className={cn("text-2xl font-bold",
                      pred.riskLevel === 'High' ? "text-red-400" : pred.riskLevel === 'Medium' ? "text-amber-400" : "text-emerald-400"
                    )}>{pred.riskScore}</p>
                  </div>
                </div>
                <div className="bg-black/20 rounded p-2.5 border border-white/5 flex items-start gap-2">
                  <AlertTriangle className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", pred.riskLevel === 'High' ? "text-red-400" : "text-gray-400")} />
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase">Primary Risk Factor</p>
                    <p className="text-xs text-white mt-0.5">{pred.primaryRiskFactor}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PREDICTIVE MODELS */}
        {activeTab === 'models' && (
          <div className="space-y-4">
            {data.models.map(model => (
              <div key={model.id} className="bg-surface rounded-xl border border-white/10 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 mr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-gray-500">{model.id}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold",
                        model.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        model.status === 'Retraining' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-white/5 text-gray-500 border-white/10"
                      )}>
                        {model.status === 'Retraining' && <RefreshCw className="w-2.5 h-2.5 inline mr-1 animate-spin" />}
                        {model.status}
                      </span>
                      <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">{model.target}</span>
                    </div>
                    <h4 className="text-sm font-medium text-white">{model.name}</h4>
                  </div>
                  {model.status === 'Active' && (
                    <Button size="sm" variant="outline" className="text-[10px] h-7 px-2" onClick={() => onRetrainModel(model.id)}>
                      <RefreshCw className="w-3 h-3 mr-1" /> Retrain
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-black/20 rounded p-2 text-center border border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase">Accuracy</p>
                    <p className={cn("text-sm font-bold mt-1", model.accuracy > 90 ? "text-emerald-400" : "text-amber-400")}>{model.accuracy}%</p>
                  </div>
                  <div className="bg-black/20 rounded p-2 text-center border border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase">AUC-ROC</p>
                    <p className="text-sm font-bold text-white mt-1">{model.aucRoc}</p>
                  </div>
                  <div className="bg-black/20 rounded p-2 text-center border border-white/5">
                    <p className="text-[9px] text-gray-500 uppercase">Patients Scored</p>
                    <p className="text-sm font-bold text-white mt-1">{(model.patientsScored / 1000).toFixed(1)}k</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* POPULATION HEALTH */}
        {activeTab === 'population' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Disease & Condition Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.populationTrends.map(trend => (
                <div key={trend.id} className={cn("bg-surface rounded-xl border p-4",
                  trend.impactLevel === 'Critical' ? "border-red-500/30 bg-red-500/5" :
                  trend.impactLevel === 'Warning' ? "border-amber-500/30" : "border-white/10"
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-medium text-white">{trend.disease}</h4>
                    {trend.trend === 'Increasing' ? <TrendingUp className="w-4 h-4 text-red-400" /> : 
                     trend.trend === 'Decreasing' ? <TrendingDown className="w-4 h-4 text-emerald-400" /> : 
                     <TrendingUp className="w-4 h-4 text-gray-500 opacity-50" />}
                  </div>
                  <div className="flex items-end gap-3 mt-3">
                    <span className="text-2xl font-bold text-white">{trend.currentCases}</span>
                    <span className="text-[10px] text-gray-500 mb-1">Active Cases</span>
                  </div>
                  <div className="mt-2 text-[10px] font-bold">
                    <span className={trend.changeRate > 0 ? "text-red-400" : "text-emerald-400"}>
                      {trend.changeRate > 0 ? '+' : ''}{trend.changeRate}% 
                    </span>
                    <span className="text-gray-500 font-normal ml-1">vs last month</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEATURE ENGINEERING */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-white">Feature Store Importance</h3>
              <span className="text-xs text-gray-400">Global SHAP Values</span>
            </div>
            
            <div className="bg-surface rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-medium">Feature</th>
                    <th className="p-3 font-medium">Category</th>
                    <th className="p-3 font-medium">Importance Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.features.map((feat, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 text-xs text-white">{feat.feature}</td>
                      <td className="p-3">
                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-gray-300">
                          {feat.category}
                        </span>
                      </td>
                      <td className="p-3 w-1/3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${feat.importanceScore * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono w-6 text-right">{feat.importanceScore.toFixed(2)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
