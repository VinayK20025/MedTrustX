'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ThreatFeedPanel } from '../components/ThreatFeedPanel';
import { IntelligenceWorkspace } from '../components/IntelligenceWorkspace';
import { useThreatIntelDashboard, usePushDetectionRule } from '../hooks/useThreatIntel';
import { Crosshair, Rss, ShieldCheck, GitMerge, AlertTriangle } from 'lucide-react';

export const ThreatIntelDashboard: React.FC = () => {
  const { data, isLoading } = useThreatIntelDashboard();
  const pushRule = usePushDetectionRule();
  const [feedView, setFeedView] = useState<'iocs' | 'campaigns' | 'feeds'>('iocs');
  const [activeCampaignId, setActiveCampaignId] = useState<string | undefined>();

  if (isLoading || !data) return <div className="p-6 text-white animate-pulse">Loading Threat Intelligence Platform...</div>;

  const { data: ti } = data;
  const activeCampaigns = ti.campaigns.filter(c => c.status === 'Active' || c.status === 'Emerging');

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Security Intelligence' }, { label: 'Threat Intelligence Analyst' }]} />

        {activeCampaigns.length > 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>Active Campaign:</strong> {activeCampaigns[0].campaignName} by {activeCampaigns[0].adversary} — {activeCampaigns[0].iocCount} IOCs linked. Detection rules recommended.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Active Threats', value: ti.metrics.activeThreats, icon: Crosshair, color: 'red' },
            { label: 'Total IOCs', value: ti.metrics.totalIocs.toLocaleString(), icon: AlertTriangle, color: 'orange' },
            { label: 'Feed Updates', value: ti.metrics.feedUpdatesToday, icon: Rss, color: 'indigo' },
            { label: 'Detection Coverage', value: `${ti.metrics.detectionCoverage}%`, icon: ShieldCheck, color: ti.metrics.detectionCoverage > 90 ? 'teal' : 'amber' },
            { label: 'Correlations', value: ti.metrics.correlationMatches, icon: GitMerge, color: 'purple' },
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
          <ThreatFeedPanel
            indicators={ti.indicators}
            campaigns={ti.campaigns}
            feeds={ti.feeds}
            activeView={feedView}
            onToggleView={setFeedView}
            onSelectCampaign={setActiveCampaignId}
            activeCampaignId={activeCampaignId}
          />
        </div>
        <div className="lg:col-span-8 h-full">
          <IntelligenceWorkspace
            data={ti}
            onPushRule={(id) => pushRule.mutate({ ruleId: id })}
          />
        </div>
      </div>
    </div>
  );
};
