'use client';

import React from 'react';
import { Calendar, MapPin, User } from 'lucide-react';
import { useAuditDashboard } from '../hooks/useAuditAnalytics';
import { Card, Button, Breadcrumbs } from '@/components/ui';

export const AuditsPage: React.FC = () => {
  const { data, isLoading } = useAuditDashboard();

  if (isLoading) return <div className="animate-pulse h-32 bg-white/10 rounded-lg" />;

  const audits = data?.audits || [];
  const completedCount = audits.filter((a) => a.status === 'Completed').length;
  const inProgressCount = audits.filter((a) => a.status === 'In Progress').length;
  const plannedCount = audits.filter((a) => a.status === 'Planned').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-success/20 border-success/30 text-success-light';
      case 'In Progress':
        return 'bg-info/20 border-info/30 text-info-light';
      case 'Planned':
        return 'bg-white/10 border-white/20 text-white';
      case 'Overdue':
        return 'bg-emergency/20 border-emergency/30 text-emergency-light';
      default:
        return 'bg-white/10 border-white/20';
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        pages={[
          { name: 'Audit Management', href: '/dashboard/audit' },
          { name: 'Audits', href: '/dashboard/audit/audits' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-white/60">Completed</p>
          <p className="text-3xl font-bold text-success-light mt-2">{completedCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-white/60">In Progress</p>
          <p className="text-3xl font-bold text-info-light mt-2">{inProgressCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-white/60">Planned</p>
          <p className="text-3xl font-bold text-white mt-2">{plannedCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-white/60">Total Audits</p>
          <p className="text-3xl font-bold text-white mt-2">{audits.length}</p>
        </Card>
      </div>

      {/* Audits List */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Audits</h3>
            <Button variant="secondary" size="sm">
              New Audit
            </Button>
          </div>
        </div>
        <div className="divide-y divide-white/10">
          {audits.map((audit) => (
            <div key={audit.id} className="p-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-white">{audit.title}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded font-semibold border ${getStatusColor(audit.status)}`}
                    >
                      {audit.status}
                    </span>
                    <span className="text-xs px-2 py-1 bg-white/10 rounded text-white/70">
                      {audit.type || 'Internal'}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 mt-2">{audit.scope}</p>
                  <div className="flex items-center gap-6 mt-3 text-xs text-white/60">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{audit.domain}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(audit.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{audit.auditor}</span>
                    </div>
                    <span className="text-warning-light font-semibold">
                      {audit.findingsCount} Findings
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
