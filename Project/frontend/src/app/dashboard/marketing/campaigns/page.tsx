'use client';
import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useMarketingDashboard, usePauseCampaign } from '@/modules/marketing/hooks/useMarketingAnalytics';
import { Megaphone, Pause, Play, CalendarClock, ArrowRight, ShieldCheck, BarChart3 } from 'lucide-react';

export default function CampaignManagement() {
  const { data } = useMarketingDashboard({ period: '30d' });
  const { mutate: pauseCampaign, isPending } = usePauseCampaign();
  const d = data?.data;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Marketing Command' }, { label: 'Campaign Management' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/25 whitespace-nowrap">
          <Megaphone className="w-3.5 h-3.5" /> CAMPAIGN CONTROL
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Live campaigns" subtitle="Active acquisition programs" icon={<Play className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-white">{d?.campaigns.filter((campaign) => campaign.status === 'active').length ?? 0}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Budget at risk" subtitle="Campaigns above 80% spend" icon={<CalendarClock className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-warning-light">
            {d?.campaigns.filter((campaign) => Math.round((campaign.spent / campaign.budget) * 100) >= 80).length ?? 0}
          </CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Strategy links" subtitle="Cross-route analytics and reporting" icon={<BarChart3 className="w-4 h-4" />} />
          <CardBody className="text-sm text-gray-300 space-y-2">
            <Link href="/dashboard/marketing/performance" className="flex items-center gap-2 text-teal-400 hover:text-teal-300">Performance analytics <ArrowRight className="w-3 h-3" /></Link>
            <Link href="/dashboard/marketing/reports" className="flex items-center gap-2 text-teal-400 hover:text-teal-300">Board-ready reports <ArrowRight className="w-3 h-3" /></Link>
          </CardBody>
        </Card>
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Campaign portfolio" subtitle="Pause, review, and optimize active programs" icon={<ShieldCheck className="w-4 h-4" />} />
        <CardBody className="space-y-3">
          {(d?.campaigns ?? []).map((campaign) => {
            const spendPct = Math.round((campaign.spent / campaign.budget) * 100);
            return (
              <div key={campaign.id} className="rounded-xl border border-white/[0.06] bg-black/20 p-4 space-y-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-white">{campaign.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{campaign.channel} · {campaign.status} · Started {campaign.startDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white">{campaign.roi}x ROI</p>
                    <p className="text-xs text-gray-500">CPA ₹{campaign.cpa}</p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                  <div className={`h-full rounded-full ${spendPct > 80 ? 'bg-emergency' : spendPct > 50 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${Math.min(spendPct, 100)}%` }} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-gray-400">
                  <div><span className="block uppercase tracking-widest">Spend</span><span className="text-gray-200">₹{(campaign.spent / 1000).toFixed(0)}K / ₹{(campaign.budget / 1000).toFixed(0)}K</span></div>
                  <div><span className="block uppercase tracking-widest">Clicks</span><span className="text-gray-200">{campaign.clicks.toLocaleString()}</span></div>
                  <div><span className="block uppercase tracking-widest">Convs</span><span className="text-success-light">{campaign.conversions}</span></div>
                  <div><span className="block uppercase tracking-widest">Impr.</span><span className="text-gray-200">{campaign.impressions.toLocaleString()}</span></div>
                  <div><span className="block uppercase tracking-widest">Health</span><span className="text-gray-200">{spendPct}% spend</span></div>
                </div>
                {campaign.status === 'active' && (
                  <Button variant="outline" size="sm" onClick={() => pauseCampaign(campaign.id)} disabled={isPending}>
                    <Pause className="w-3.5 h-3.5" /> Pause campaign
                  </Button>
                )}
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
