'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useMarketingDashboard } from '@/modules/marketing/hooks/useMarketingAnalytics';
import { BarChart3, Target, TrendingUp, TrendingDown, Gauge, ArrowUpRight } from 'lucide-react';

export default function CampaignPerformance() {
  const { data } = useMarketingDashboard({ period: '30d' });
  const d = data?.data;

  const totalSpend = (d?.campaigns ?? []).reduce((sum, campaign) => sum + campaign.spent, 0);
  const totalBudget = (d?.campaigns ?? []).reduce((sum, campaign) => sum + campaign.budget, 0);
  const totalConversions = (d?.campaigns ?? []).reduce((sum, campaign) => sum + campaign.conversions, 0);
  const totalImpressions = (d?.campaigns ?? []).reduce((sum, campaign) => sum + campaign.impressions, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: 'Marketing Command' }, { label: 'Campaign Performance' }]} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardHeader title="Spend" subtitle="Total campaign investment" icon={<Gauge className="w-4 h-4" />} /><CardBody className="text-3xl font-black text-white">₹{(totalSpend / 100000).toFixed(1)}L</CardBody></Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardHeader title="Budget used" subtitle="Pacing across portfolio" icon={<Target className="w-4 h-4" />} /><CardBody className="text-3xl font-black text-warning-light">{totalBudget ? Math.round((totalSpend / totalBudget) * 100) : 0}%</CardBody></Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardHeader title="Conversions" subtitle="Attributed outcomes" icon={<TrendingUp className="w-4 h-4" />} /><CardBody className="text-3xl font-black text-success-light">{totalConversions.toLocaleString()}</CardBody></Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardHeader title="Impressions" subtitle="Upper-funnel reach" icon={<BarChart3 className="w-4 h-4" />} /><CardBody className="text-3xl font-black text-white">{totalImpressions.toLocaleString()}</CardBody></Card>
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Channel-attributed ROI" subtitle="Weighted by campaign revenue and spend efficiency" icon={<ArrowUpRight className="w-4 h-4" />} />
        <CardBody className="space-y-3">
          {(d?.campaigns ?? []).map((campaign) => {
            const spendPct = Math.round((campaign.spent / campaign.budget) * 100);
            return (
              <div key={campaign.id} className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-white">{campaign.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{campaign.channel} · {campaign.status}</p>
                  </div>
                  <p className={`text-sm font-black ${campaign.roi >= 4 ? 'text-success-light' : campaign.roi >= 2 ? 'text-warning-light' : 'text-emergency-light'}`}>{campaign.roi}x ROI</p>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden mb-3">
                  <div className={`h-full rounded-full ${spendPct > 80 ? 'bg-emergency' : spendPct > 50 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${Math.min(spendPct, 100)}%` }} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-gray-400">
                  <div><span className="block uppercase tracking-widest">Budget</span><span className="text-gray-200">₹{(campaign.budget / 1000).toFixed(0)}K</span></div>
                  <div><span className="block uppercase tracking-widest">Spent</span><span className="text-gray-200">₹{(campaign.spent / 1000).toFixed(0)}K</span></div>
                  <div><span className="block uppercase tracking-widest">Clicks</span><span className="text-gray-200">{campaign.clicks.toLocaleString()}</span></div>
                  <div><span className="block uppercase tracking-widest">CPA</span><span className="text-gray-200">₹{campaign.cpa}</span></div>
                  <div><span className="block uppercase tracking-widest">Progress</span><span className="text-gray-200">{spendPct}%</span></div>
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
