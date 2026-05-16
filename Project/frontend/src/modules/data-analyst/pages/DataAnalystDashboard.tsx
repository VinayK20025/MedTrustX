'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DatasetPanel } from '../components/DatasetPanel';
import { AnalyticsWorkspace } from '../components/AnalyticsWorkspace';
import { useAnalystDashboard, useGenerateReport, useMarkInsightReviewed } from '../hooks/useAnalystAnalytics';
import { Users, TrendingUp, Bed, Activity, BarChart3, Lightbulb, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

export const DataAnalystDashboard: React.FC = () => {
  const { data, isLoading } = useAnalystDashboard();
  const generateReport = useGenerateReport();
  const markReviewed = useMarkInsightReviewed();
  const [activeDatasetId, setActiveDatasetId] = useState<string | undefined>();

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Loading analytics platform...</div>;

  const { data: ad } = data;
  const criticalInsights = ad.insights.filter(i => i.severity === 'Critical' && i.status === 'New');

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Data Platform' }, { label: 'Analytics Dashboard' }]} />

        {criticalInsights.length > 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>Critical Insight:</strong> {criticalInsights[0].title} — immediate review required.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'Patients / Month', value: ad.metrics.patientsThisMonth.toLocaleString(), icon: Users, color: 'indigo' },
            { label: 'Revenue (₹L)', value: `₹${ad.metrics.revenueThisMonth}L`, icon: TrendingUp, color: 'emerald' },
            { label: 'Bed Occupancy', value: `${ad.metrics.bedOccupancy}%`, icon: Bed, color: ad.metrics.bedOccupancy >= 90 ? 'red' : ad.metrics.bedOccupancy >= 80 ? 'amber' : 'teal' },
            { label: 'Avg LOS', value: `${ad.metrics.avgLOS}d`, icon: Activity, color: 'purple' },
            { label: 'Readmissions', value: `${ad.metrics.readmissionRate}%`, icon: BarChart3, color: ad.metrics.readmissionRate > 4 ? 'rose' : 'teal' },
            { label: 'NPS Score', value: ad.metrics.netPromoterScore, icon: Lightbulb, color: ad.metrics.netPromoterScore >= 70 ? 'emerald' : 'amber' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-surface-dark border border-white/[0.06] rounded-xl p-3 flex items-center gap-2.5">
              <div className={`p-2 rounded-lg bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
                <p className="text-base font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <div className="lg:col-span-4 h-full">
          <DatasetPanel
            datasets={ad.datasets}
            kpis={ad.kpis}
            activeDatasetId={activeDatasetId}
            onSelectDataset={setActiveDatasetId}
          />
        </div>
        <div className="lg:col-span-8 h-full">
          <AnalyticsWorkspace
            data={ad}
            onGenerateReport={(id) => generateReport.mutate({ id })}
            onMarkInsightReviewed={(id) => markReviewed.mutate({ id })}
          />
        </div>
      </div>
    </div>
  );
};
