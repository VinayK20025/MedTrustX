'use client';

import React from 'react';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuditDashboard, useCloseCapaAction } from '../hooks/useAuditAnalytics';
import { Card, Button, Breadcrumbs } from '@/components/ui';

export const CapaPage: React.FC = () => {
  const { data, isLoading } = useAuditDashboard();
  const closeCapa = useCloseCapaAction();

  if (isLoading) return <div className="animate-pulse h-32 bg-white/10 rounded-lg" />;

  const allCapas = Object.entries(data?.capas || {}).flatMap(([findingId, capas]) =>
    capas.map((capa) => ({ ...capa, findingId }))
  );

  const openCapas = allCapas.filter((c) => c.status === 'Open').length;
  const inProgressCapas = allCapas.filter((c) => c.status === 'In Progress').length;
  const completedCapas = allCapas.filter((c) => c.status === 'Completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-warning/20 border-warning/30 text-warning-light';
      case 'In Progress':
        return 'bg-info/20 border-info/30 text-info-light';
      case 'Completed':
        return 'bg-success/20 border-success/30 text-success-light';
      case 'Closed':
        return 'bg-success/20 border-success/30 text-success-light';
      case 'On Hold':
        return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
      default:
        return 'bg-white/10 border-white/20';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate).getTime();
    const now = Date.now();
    const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        pages={[
          { name: 'Audit Management', href: '/dashboard/audit' },
          { name: 'CAPA Actions', href: '/dashboard/audit/capa' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-white/60">Open</p>
          <p className="text-3xl font-bold text-warning-light mt-2">{openCapas}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-white/60">In Progress</p>
          <p className="text-3xl font-bold text-info-light mt-2">{inProgressCapas}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-white/60">Completed</p>
          <p className="text-3xl font-bold text-success-light mt-2">{completedCapas}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-white/60">Total CAPA Actions</p>
          <p className="text-3xl font-bold text-white mt-2">{allCapas.length}</p>
        </Card>
      </div>

      {/* CAPA Actions by Status */}
      {['Open', 'In Progress', 'Completed', 'On Hold'].map((status) => {
        const capasByStatus = allCapas.filter((c) => c.status === status);
        if (capasByStatus.length === 0) return null;

        return (
          <div key={status} className="space-y-3">
            <h3 className="text-lg font-semibold">{status} Actions ({capasByStatus.length})</h3>
            <div className="space-y-3">
              {capasByStatus.map((capa) => {
                const daysUntil = getDaysUntilDue(capa.dueDate);
                const isOverdue = daysUntil < 0;
                const isDueSoon = daysUntil >= 0 && daysUntil <= 7;

                return (
                  <Card
                    key={capa.id}
                    className={`p-6 border transition-all ${
                      isOverdue
                        ? 'bg-emergency/15 border-emergency/30'
                        : isDueSoon
                          ? 'bg-warning/15 border-warning/30'
                          : 'bg-white/[0.06] border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-white">{capa.action}</h4>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getStatusColor(capa.status)}`}
                          >
                            {capa.status}
                          </span>
                        </div>
                      </div>
                      {status === 'In Progress' || status === 'Open' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => closeCapa.mutate(capa.id)}
                        >
                          Mark Completed
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      )}
                    </div>

                    {/* CAPA Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white/[0.02] rounded mb-3">
                      <div>
                        <p className="text-xs text-white/60">Finding Reference</p>
                        <p className="text-sm font-medium text-white mt-1">{capa.findingId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Owner</p>
                        <p className="text-sm font-medium text-white mt-1">{capa.owner}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Due Date</p>
                        <p className="text-sm font-medium text-white mt-1">
                          {new Date(capa.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Days Until Due</p>
                        <p
                          className={`text-sm font-semibold mt-1 ${
                            isOverdue
                              ? 'text-emergency-light'
                              : isDueSoon
                                ? 'text-warning-light'
                                : 'text-white'
                          }`}
                        >
                          {isOverdue ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days`}
                        </p>
                      </div>
                    </div>

                    {/* Root Cause */}
                    {capa.rootCause && (
                      <div className="p-3 bg-white/[0.02] rounded">
                        <p className="text-xs text-white/60">Root Cause</p>
                        <p className="text-sm text-white mt-1">{capa.rootCause}</p>
                      </div>
                    )}

                    {/* Completion Evidence */}
                    {capa.status === 'Completed' && capa.actualCompletionDate && (
                      <div className="mt-3 p-3 bg-success/10 rounded border border-success/20 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success-light flex-shrink-0" />
                        <div>
                          <p className="text-xs text-white/60">Completed On</p>
                          <p className="text-sm text-success-light font-semibold">
                            {new Date(capa.actualCompletionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
