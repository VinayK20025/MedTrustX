'use client';
import React from 'react';
import type { ProductivityMetrics } from '../types/superAdmin.types';
import { CheckCircle2, AlertTriangle, BarChart3, Shield, Users, Wrench, Activity, Fingerprint, Clock, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { metrics: ProductivityMetrics; }

function MetricItem({ icon: Icon, label, value, unit, color }: { icon: typeof CheckCircle2; label: string; value: string | number; unit?: string; color: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className={cn('w-4 h-4 flex-shrink-0', color)} />
      <div className="flex-1 min-w-0">
        <span className="text-[11px] text-gray-400">{label}</span>
      </div>
      <span className="text-sm font-bold text-white">{value}{unit}</span>
    </div>
  );
}

export function SuperAdminProductivityWidget({ metrics }: Props) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface-light shadow-glass p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-lg bg-teal-500/15"><BarChart3 className="w-4 h-4 text-teal-400" /></div>
        <div>
          <h3 className="text-[14px] font-bold text-white">Today's Productivity</h3>
          <p className="text-[10px] text-gray-500">Real-time governance metrics</p>
        </div>
      </div>

      <div className="space-y-0.5 divide-y divide-white/[0.03]">
        <MetricItem icon={CheckCircle2} label="Policies Applied" value={metrics.policiesAppliedToday} color="text-success-light" />
        <MetricItem icon={AlertTriangle} label="Overrides Used" value={metrics.overridesUsedToday} color={metrics.overridesUsedToday > 0 ? 'text-warning-light' : 'text-success-light'} />
        <MetricItem icon={Activity} label="Global Uptime" value={metrics.globalUptime} unit="%" color="text-teal-400" />
        <MetricItem icon={Shield} label="Compliance Score" value={metrics.complianceScore} unit="%" color="text-indigo-400" />
        <MetricItem icon={Fingerprint} label="MFA Adoption" value={metrics.mfaAdoptionRate} unit="%" color="text-cyan-400" />
        <MetricItem icon={Users} label="Users Onboarded" value={metrics.usersOnboarded} color="text-purple-400" />
        <MetricItem icon={Wrench} label="Incidents Resolved" value={metrics.incidentsResolved} color="text-amber-400" />
        <MetricItem icon={Zap} label="Audit Checks" value={metrics.auditChecks.toLocaleString()} color="text-gray-400" />
        <MetricItem icon={Clock} label="Avg Response Time" value={metrics.avgResponseTime} unit="ms" color="text-teal-400" />
      </div>
    </div>
  );
}
