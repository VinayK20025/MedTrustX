'use client';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { Tabs } from '@/components/ui/Tabs';
import { useUIStore } from '@/store/ui.store';
import { useEffect } from 'react';
import { useCDSSDashboard } from '../hooks/useCDSS';
import type { CDSSFilters } from '../types/cdss.types';

export const CDSSDashboard = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useCDSSDashboard();

  useEffect(() => {
    setPageMeta('CDSS', 'Clinical Decision Support — real-time rules, alerts, and recommendations');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data?.kpis.map((kpi) => (
          <Card key={kpi.id} className={`p-4 border-l-4 ${
            kpi.status === 'critical' ? 'border-l-red-500 bg-red-50' :
            kpi.status === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
            kpi.status === 'success' ? 'border-l-green-500 bg-green-50' :
            'border-l-blue-500 bg-blue-50'
          }`}>
            <p className="text-sm text-gray-600">{kpi.label}</p>
            <p className="text-3xl font-bold mt-2">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.subLabel}</p>
          </Card>
        ))}
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="recommendations">
        <Tabs.List>
          <Tabs.Trigger value="recommendations">Active Recommendations</Tabs.Trigger>
          <Tabs.Trigger value="alerts">System Alerts</Tabs.Trigger>
          <Tabs.Trigger value="evaluations">Recent Evaluations</Tabs.Trigger>
          <Tabs.Trigger value="rules">Top Rules</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="recommendations" className="mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Active Recommendations ({data?.recommendations.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data?.recommendations.length ? (
                data.recommendations.map((rec) => (
                  <div key={rec.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded border">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{rec.recommendation}</p>
                      <div className="flex gap-2 mt-2 text-xs text-gray-600">
                        <span>📋 {rec.category}</span>
                        <span>📍 {rec.clinicalArea}</span>
                        <span>⚡ {(rec.confidenceScore * 100).toFixed(0)}% confidence</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Patient: {rec.patientTag} | Source: {rec.source}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        rec.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        rec.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        rec.status === 'Implemented' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rec.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recommendations</p>
              )}
            </div>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="alerts" className="mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">System Alerts ({data?.activeAlerts.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data?.activeAlerts.length ? (
                data.activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-4 p-3 rounded border ${
                      alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                      alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.alertType}</p>
                      <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Patient: {alert.patientTag}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        alert.severity === 'critical' ? 'bg-red-200 text-red-900' :
                        alert.severity === 'warning' ? 'bg-yellow-200 text-yellow-900' :
                        'bg-blue-200 text-blue-900'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        {alert.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No active alerts</p>
              )}
            </div>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="evaluations" className="mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Recent Evaluations ({data?.recentEvaluations.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data?.recentEvaluations.length ? (
                data.recentEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded border">
                    <div className="flex-1">
                      <p className="font-medium text-sm">Patient {evaluation.patientTag}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        🔧 Rules Fired: {evaluation.rulesFired.join(', ') || 'None'}
                      </p>
                      <p className="text-xs text-gray-600">
                        💡 Recommendations: {evaluation.recommendationsGenerated.length}
                      </p>
                      <p className="text-xs text-gray-600">
                        ⚠️ Alerts Triggered: {evaluation.alertsTriggered.length}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(evaluation.evaluatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No evaluations</p>
              )}
            </div>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="rules" className="mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Top Rules ({data?.topRules.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data?.topRules.length ? (
                data.topRules.map((rule) => (
                  <div key={rule.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded border">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{rule.name}</p>
                      {rule.description && (
                        <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                      )}
                      <div className="flex gap-2 mt-2 text-xs text-gray-600">
                        <span>Type: {rule.ruleType}</span>
                        <span>{rule.active ? '✅ Active' : '⏸️ Inactive'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No rules</p>
              )}
            </div>
          </Card>
        </Tabs.Content>
      </Tabs>
    </div>
  );
};
