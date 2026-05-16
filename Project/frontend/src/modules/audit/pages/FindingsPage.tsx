'use client';

import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuditDashboard, useUpdateFinding } from '../hooks/useAuditAnalytics';
import { Card, Button, Breadcrumbs } from '@/components/ui';

export const FindingsPage: React.FC = () => {
  const { data, isLoading } = useAuditDashboard();
  const updateFinding = useUpdateFinding();

  if (isLoading) return <div className="animate-pulse h-32 bg-white/10 rounded-lg" />;

  const findings = data?.findings || [];
  const criticalCount = findings.filter((f) => f.severity === 'Critical').length;
  const highCount = findings.filter((f) => f.severity === 'High').length;
  const openCount = findings.filter((f) => f.status === 'Open').length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-emergency/20 border-emergency/30 text-emergency-light';
      case 'High':
        return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
      case 'Medium':
        return 'bg-warning/20 border-warning/30 text-warning-light';
      default:
        return 'bg-white/10 border-white/20 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-emergency/10 text-emergency-light border-emergency/20';
      case 'In Remediation':
        return 'bg-info/10 text-info-light border-info/20';
      case 'Closed':
        return 'bg-success/10 text-success-light border-success/20';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'Critical') return AlertOctagon;
    if (severity === 'High') return AlertTriangle;
    return CheckCircle2;
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        pages={[
          { name: 'Audit Management', href: '/dashboard/audit' },
          { name: 'Findings', href: '/dashboard/audit/findings' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-white/60">Critical</p>
          <p className="text-3xl font-bold text-emergency-light mt-2">{criticalCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-white/60">High</p>
          <p className="text-3xl font-bold text-orange-400 mt-2">{highCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-white/60">Open</p>
          <p className="text-3xl font-bold text-warning-light mt-2">{openCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-white/60">Total</p>
          <p className="text-3xl font-bold text-white mt-2">{findings.length}</p>
        </Card>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {findings.map((finding) => {
          const SeverityIcon = getSeverityIcon(finding.severity);
          return (
            <Card
              key={finding.id}
              className={`p-6 border transition-all ${
                finding.severity === 'Critical'
                  ? 'bg-emergency/20 border-emergency/30'
                  : finding.severity === 'High'
                    ? 'bg-orange-500/15 border-orange-500/30'
                    : finding.severity === 'Medium'
                      ? 'bg-warning/15 border-warning/30'
                      : 'bg-white/[0.06] border-white/[0.06]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-white/10 flex-shrink-0">
                  <SeverityIcon
                    className={`w-5 h-5 ${
                      finding.severity === 'Critical'
                        ? 'text-emergency-light'
                        : finding.severity === 'High'
                          ? 'text-orange-400'
                          : 'text-warning-light'
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-lg">{finding.title}</h4>
                      <p className="text-sm text-white/70 mt-1">{finding.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getSeverityColor(finding.severity)}`}
                      >
                        {finding.severity}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getStatusColor(finding.status)}`}>
                        {finding.status}
                      </span>
                    </div>
                  </div>

                  {/* Finding Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-3 bg-white/[0.02] rounded">
                    <div>
                      <p className="text-xs text-white/60">Domain</p>
                      <p className="text-sm font-medium text-white mt-1">{finding.domain}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Control</p>
                      <p className="text-sm font-medium text-white mt-1">{finding.controlRef}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Owner</p>
                      <p className="text-sm font-medium text-white mt-1">{finding.owner}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Raised</p>
                      <p className="text-sm font-medium text-white mt-1">
                        {new Date(finding.dateRaised).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Root Cause & Target Date */}
                  {(finding.rootCause || finding.targetDate) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-3 bg-white/[0.02] rounded">
                      {finding.rootCause && (
                        <div>
                          <p className="text-xs text-white/60">Root Cause</p>
                          <p className="text-sm text-white mt-1">{finding.rootCause}</p>
                        </div>
                      )}
                      {finding.targetDate && (
                        <div>
                          <p className="text-xs text-white/60">Target Resolution</p>
                          <p className="text-sm text-white mt-1">
                            {new Date(finding.targetDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                {finding.status === 'Open' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      updateFinding.mutate({
                        id: finding.id,
                        status: 'In Remediation',
                      })
                    }
                  >
                    Mark In Remediation
                  </Button>
                )}
                {finding.status === 'In Remediation' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      updateFinding.mutate({
                        id: finding.id,
                        status: 'Closed',
                      })
                    }
                  >
                    Mark Closed
                  </Button>
                )}
                <Button size="sm" variant="ghost">
                  View Details
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
