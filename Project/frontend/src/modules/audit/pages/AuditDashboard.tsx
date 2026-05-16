'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Calendar, Wrench } from 'lucide-react';
import { useAuditDashboard } from '../hooks/useAuditAnalytics';
import { Card, Button, Breadcrumbs } from '@/components/ui';
import type { AuditFinding } from '../types/audit.types';

export const AuditDashboard: React.FC = () => {
  const { data, isLoading } = useAuditDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs pages={[{ name: 'Audit Management', href: '/dashboard/audit' }]} />
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-white/10 rounded-lg" />
        </div>
      </div>
    );
  }

  const criticalFindings = data?.findings?.filter((f) => f.severity === 'Critical') || [];
  const highFindings = data?.findings?.filter((f) => f.severity === 'High') || [];
  const mediumFindings = data?.findings?.filter((f) => f.severity === 'Medium') || [];
  const lowFindings = data?.findings?.filter((f) => f.severity === 'Low') || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-emergency/10 border-emergency/20';
      case 'High':
        return 'bg-orange-500/10 border-orange-500/20';
      case 'Medium':
        return 'bg-warning/10 border-warning/20';
      default:
        return 'bg-white/[0.06] border-white/[0.06]';
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'Critical' || severity === 'High') return AlertTriangle;
    return CheckCircle2;
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs pages={[{ name: 'Audit Management', href: '/dashboard/audit' }]} />

      {/* Critical Alert Banner */}
      {criticalFindings.length > 0 && (
        <Card className="bg-emergency/10 border-emergency/30 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-emergency-light w-5 h-5 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-emergency-light">
                {criticalFindings.length} Critical Findings Require Immediate Action
              </h3>
              <p className="text-sm text-white/70 mt-1">
                {criticalFindings
                  .slice(0, 2)
                  .map((f) => f.title)
                  .join(', ')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* KPI Cards - 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.kpis?.map((kpi, idx) => (
          <Card
            key={idx}
            className="p-4 backdrop-blur-sm border border-white/[0.06] shadow-glass"
          >
            <p className="text-sm text-white/60 font-medium">{kpi.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white">{kpi.value}</p>
              {kpi.changePercent && (
                <p
                  className={`text-xs font-semibold ${
                    kpi.changePercent > 0 ? 'text-success-light' : 'text-warning-light'
                  }`}
                >
                  {kpi.changePercent > 0 ? '↑' : '↓'} {Math.abs(kpi.changePercent)}%
                </p>
              )}
            </div>
            <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  kpi.status === 'healthy'
                    ? 'bg-success-light'
                    : kpi.status === 'warning'
                      ? 'bg-warning-light'
                      : 'bg-emergency-light'
                }`}
                style={{ width: `${typeof kpi.value === 'number' ? Math.min(kpi.value * 10, 100) : 75}%` }}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Three-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Finding Severity Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Findings by Severity</h3>
          <div className="space-y-3">
            {[
              { label: 'Critical', count: criticalFindings.length, color: 'bg-emergency-light' },
              { label: 'High', count: highFindings.length, color: 'bg-orange-500' },
              { label: 'Medium', count: mediumFindings.length, color: 'bg-warning-light' },
              { label: 'Low', count: lowFindings.length, color: 'bg-white/40' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-white/80">{item.label}</span>
                  <span className="text-sm font-semibold text-white">{item.count}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${(item.count / (data?.findings?.length || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Active Audits Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Audits</h3>
          <div className="space-y-3">
            {data?.audits
              ?.filter((a) => a.status === 'In Progress' || a.status === 'Overdue')
              .slice(0, 4)
              .map((audit) => (
                <div
                  key={audit.id}
                  className={`p-3 rounded-lg border transition-all ${
                    audit.status === 'Overdue'
                      ? 'bg-emergency/20 border-emergency/30'
                      : 'bg-white/[0.06] border-white/[0.06]'
                  }`}
                >
                  <p className="text-sm font-medium text-white truncate">{audit.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-white/60">{audit.domain}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        audit.status === 'Overdue'
                          ? 'bg-emergency/30 text-emergency-light'
                          : 'bg-success/20 text-success-light'
                      }`}
                    >
                      {audit.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* CAPA Status Overview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">CAPA Overview</h3>
          <div className="space-y-3">
            {(() => {
              const allCapas = Object.values(data?.capas || {}).flat();
              const capaStats = {
                Open: allCapas.filter((c) => c.status === 'Open').length,
                'In Progress': allCapas.filter((c) => c.status === 'In Progress').length,
                Completed: allCapas.filter((c) => c.status === 'Completed').length,
                Closed: allCapas.filter((c) => c.status === 'Closed').length,
              };

              return Object.entries(capaStats).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-white/80">{status}</span>
                    <span className="text-sm font-semibold text-white">{count}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        status === 'Open'
                          ? 'bg-warning-light'
                          : status === 'In Progress'
                            ? 'bg-info-light'
                            : 'bg-success-light'
                      }`}
                      style={{
                        width: `${(count / (allCapas.length || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        </Card>
      </div>

      {/* Recent Critical Findings */}
      {criticalFindings.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Critical Findings Requiring Action</h3>
            <Button variant="secondary" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {criticalFindings.slice(0, 3).map((finding) => (
              <div
                key={finding.id}
                className={`p-4 rounded-lg border transition-all ${getSeverityColor(finding.severity)}`}
              >
                <div className="flex items-start gap-3">
                  {React.createElement(getSeverityIcon(finding.severity), {
                    className: 'w-4 h-4 mt-1 flex-shrink-0 text-emergency-light',
                  })}
                  <div className="flex-1">
                    <p className="font-medium text-white">{finding.title}</p>
                    <p className="text-sm text-white/70 mt-1">{finding.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-white/60">
                      <span>{finding.domain}</span>
                      <span>Control: {finding.controlRef}</span>
                      <span className="text-warning-light font-semibold">{finding.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button className="gap-2" variant="secondary">
            <Calendar className="w-4 h-4" />
            Schedule Audit
          </Button>
          <Button className="gap-2" variant="secondary">
            <AlertTriangle className="w-4 h-4" />
            Report Finding
          </Button>
          <Button className="gap-2" variant="secondary">
            <Wrench className="w-4 h-4" />
            Create CAPA
          </Button>
          <Button className="gap-2" variant="secondary">
            <CheckCircle2 className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </Card>
    </div>
  );
};
