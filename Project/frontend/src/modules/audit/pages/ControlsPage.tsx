'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { useAuditDashboard } from '../hooks/useAuditAnalytics';
import { Card, Button, Breadcrumbs } from '@/components/ui';
import type { AuditControl } from '../types/audit.types';

export const ControlsPage: React.FC = () => {
  const { data, isLoading } = useAuditDashboard();

  if (isLoading) return <div className="animate-pulse h-32 bg-white/10 rounded-lg" />;

  const controls = data?.controls || [];
  const activeControls = controls.filter((c) => c.status === 'Active').length;
  const effectiveControls = controls.filter((c) => c.effectiveness === 'Effective').length;
  const mappedCount = controls.filter((c) => c.mappedStandards.length > 0).length;

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'Effective':
        return 'bg-success/20 border-success/30 text-success-light';
      case 'Partially Effective':
        return 'bg-warning/20 border-warning/30 text-warning-light';
      case 'Ineffective':
        return 'bg-emergency/20 border-emergency/30 text-emergency-light';
      default:
        return 'bg-white/10 border-white/20';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-success/20 text-success-light';
      case 'Under Review':
        return 'bg-warning/20 text-warning-light';
      default:
        return 'bg-white/10 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        pages={[
          { name: 'Audit Management', href: '/dashboard/audit' },
          { name: 'Controls Library', href: '/dashboard/audit/controls' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-white/60">Active Controls</p>
          <p className="text-3xl font-bold text-success-light mt-2">{activeControls}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-white/60">Effective</p>
          <p className="text-3xl font-bold text-white mt-2">{effectiveControls}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-white/60">Standards Mapped</p>
          <p className="text-3xl font-bold text-white mt-2">{mappedCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-white/60">Total Controls</p>
          <p className="text-3xl font-bold text-white mt-2">{controls.length}</p>
        </Card>
      </div>

      {/* Controls Grid */}
      <div className="space-y-4">
        {controls.map((control: AuditControl) => (
          <Card
            key={control.id}
            className={`p-6 border transition-all ${
              control.status === 'Under Review'
                ? 'bg-warning/10 border-warning/20'
                : 'bg-white/[0.02] border-white/[0.06]'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-white text-lg">{control.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${getStatusBadgeColor(control.status)}`}>
                    {control.status}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded border font-semibold ${getEffectivenessColor(control.effectiveness)}`}>
                    {control.effectiveness}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>

            <p className="text-sm text-white/70 mb-4">{control.description}</p>

            {/* Control Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-white/[0.02] rounded">
              <div>
                <p className="text-xs text-white/60">Domain</p>
                <p className="text-sm font-medium text-white mt-1">{control.domain}</p>
              </div>
              <div>
                <p className="text-xs text-white/60">Frequency</p>
                <p className="text-sm font-medium text-white mt-1">{control.frequency || 'Quarterly'}</p>
              </div>
              <div>
                <p className="text-xs text-white/60">Last Tested</p>
                <p className="text-sm font-medium text-white mt-1">
                  {new Date(control.lastTested).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/60">Owner</p>
                <p className="text-sm font-medium text-white mt-1">{control.owner || 'Unassigned'}</p>
              </div>
            </div>

            {/* Mapped Standards */}
            <div className="flex flex-wrap gap-2">
              <p className="text-xs text-white/60 w-full">Mapped Standards:</p>
              {control.mappedStandards.map((standard) => (
                <span key={standard} className="text-xs px-2.5 py-1 rounded-full bg-info/20 text-info-light border border-info/30">
                  {standard}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
