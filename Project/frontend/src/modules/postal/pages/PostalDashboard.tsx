'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { EmailMessagesPanel } from '../components/EmailMessagesPanel';
import { EmailQueuesPanel } from '../components/EmailQueuesPanel';
import { EmailBouncesPanel } from '../components/EmailBouncesPanel';
import { usePostal } from '../hooks/usePostal';
import { Mail, Send, Activity, AlertCircle, CheckCircle, MailWarning } from 'lucide-react';

interface PostalKPI {
  id: string; title: string; value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success'; icon: React.ElementType; subtitle?: string;
}

function PostalKPICard({ kpi }: { kpi: PostalKPI }) {
  const statusColors: Record<string, string> = {
    success: 'border-success/20 hover:border-success/40', normal: 'border-white/[0.06] hover:border-white/[0.12]',
    warning: 'border-warning/20 hover:border-warning/40', critical: 'border-emergency/20 hover:border-emergency/40 bg-emergency/[0.02]',
  };
  const valueColors: Record<string, string> = {
    success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light',
  };
  const Icon = kpi.icon;
  return (
    <div className={cn('group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-card-hover', statusColors[kpi.status])}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
        <div className="p-2 rounded-lg bg-sky-500/15"><Icon className="w-4 h-4 text-sky-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

export const PostalDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useMessages } = usePostal();
  const msgQuery = useMessages();

  useEffect(() => {
    setPageMeta('Postal Service', 'Transactional email delivery, queues, and bounce management');
  }, [setPageMeta]);

  if (msgQuery.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const kpis: PostalKPI[] = [
    { id: 'sent', title: 'Emails Sent', value: '1.2M', status: 'success', icon: Send, subtitle: 'Last 30 days' },
    { id: 'queued', title: 'In Queue', value: 142, status: 'normal', icon: Mail, subtitle: 'Pending dispatch' },
    { id: 'throughput', title: 'Delivery Rate', value: '45/s', status: 'success', icon: Activity, subtitle: 'Current throughput' },
    { id: 'bounces', title: 'Hard Bounces', value: 84, status: 'warning', icon: AlertCircle, subtitle: 'Requires list cleanup' },
    { id: 'spam', title: 'Spam Complaints', value: 2, status: 'warning', icon: MailWarning, subtitle: 'Monitoring reputation' },
    { id: 'delivery', title: 'Delivery Success', value: '99.8%', status: 'success', icon: CheckCircle, subtitle: 'Inbox placement' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Postal Service' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-sky-300 bg-sky-500/10 px-4 py-2 rounded-lg border border-sky-500/25">
          <Mail className="w-3.5 h-3.5" />
          EMAIL DELIVERY
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <PostalKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 h-[600px]">
          <EmailMessagesPanel />
        </div>
        <div className="xl:col-span-4 flex flex-col gap-5 h-[600px]">
          <div className="flex-1">
            <EmailQueuesPanel />
          </div>
          <div className="flex-1">
            <EmailBouncesPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
