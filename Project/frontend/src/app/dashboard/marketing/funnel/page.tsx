'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useMarketingDashboard } from '@/modules/marketing/hooks/useMarketingAnalytics';
import { Filter, ArrowRight, Users } from 'lucide-react';

export default function LeadFunnel() {
  const { data } = useMarketingDashboard({ period: '30d' });
  const stages = data?.data?.funnel ?? [];
  const maxCount = stages[0]?.count ?? 1;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: 'Marketing Command' }, { label: 'Lead Funnel' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light lg:col-span-2">
          <CardHeader title="Funnel progression" subtitle="Awareness → Interest → Inquiry → Appointment → Conversion" icon={<Filter className="w-4 h-4" />} />
          <CardBody className="space-y-4">
            {stages.map((stage, index) => {
              const widthPct = Math.max((stage.count / maxCount) * 100, 12);
              const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-teal-500', 'bg-warning', 'bg-success'];
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-white">{stage.stage}</span>
                    <span className="text-[10px] font-mono text-gray-400">{stage.count.toLocaleString()} · {stage.conversionRate}%</span>
                  </div>
                  <div className="h-7 w-full bg-white/[0.03] rounded-lg overflow-hidden flex items-center">
                    <div className={`h-full rounded-lg ${colors[index]} flex items-center justify-end pr-2`} style={{ width: `${widthPct}%` }}>
                      {widthPct > 20 && <span className="text-[10px] text-white font-bold">↓{stage.dropOff}%</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Funnel interpretation" subtitle="Where conversion stalls are happening" icon={<Users className="w-4 h-4" />} />
          <CardBody className="space-y-3 text-sm text-gray-300">
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">Focus the largest loss gap first; the awareness-to-interest drop is typically the strongest signal for audience mismatch or landing-page friction.</div>
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">Use appointment-stage data to coordinate follow-up calls, reminders, and care-team handoff.</div>
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">Compare this route with campaign and channel pages to isolate source-level inefficiencies.</div>
            <a href="/dashboard/marketing/performance" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300">Open performance analytics <ArrowRight className="w-3.5 h-3.5" /></a>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
