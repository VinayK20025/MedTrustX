'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useMarketingDashboard } from '@/modules/marketing/hooks/useMarketingAnalytics';
import { Heart, Globe2, MessageCircle, Sparkles } from 'lucide-react';

export default function BrandAnalytics() {
  const { data } = useMarketingDashboard({ period: '30d' });
  const d = data?.data;

  const brandReach = (d?.channels ?? []).reduce((sum, channel) => sum + channel.leads, 0);
  const brandConversion = (d?.channels ?? []).reduce((sum, channel) => sum + channel.conversions, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: 'Marketing Command' }, { label: 'Brand Analytics' }]} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardHeader title="Brand reach" subtitle="Total channel-generated leads" icon={<Globe2 className="w-4 h-4" />} /><CardBody className="text-3xl font-black text-white">{brandReach.toLocaleString()}</CardBody></Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardHeader title="Brand conversion" subtitle="Leads that became conversions" icon={<Heart className="w-4 h-4" />} /><CardBody className="text-3xl font-black text-success-light">{brandConversion.toLocaleString()}</CardBody></Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardHeader title="Sentiment cues" subtitle="Comms and reputation signals" icon={<MessageCircle className="w-4 h-4" />} /><CardBody className="text-sm text-gray-300">Use brand analytics to compare acquisition volume with conversion quality and awareness lift.</CardBody></Card>
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Brand engagement narrative" subtitle="What the current dashboard is telling leadership" icon={<Sparkles className="w-4 h-4" />} />
        <CardBody className="space-y-3 text-sm text-gray-300">
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">Email and referral are driving the strongest efficiency signal, which supports trust-led brand positioning.</div>
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">Offline programs still contribute meaningful volume, but they are underperforming on ROI and should stay tightly targeted.</div>
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">Open the performance page for spend quality and the reports page for board-ready documentation.</div>
        </CardBody>
      </Card>
    </div>
  );
}
