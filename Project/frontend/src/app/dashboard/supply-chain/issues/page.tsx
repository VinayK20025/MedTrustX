'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useEscalateIssue, useSupplyChainDashboard } from '@/modules/supply-chain';

const SUPPLY_CHAIN_ROLES = ['supply_chain_coordinator', 'super_admin', 'procurement_manager', 'inventory_manager'];

export default function SupplyChainIssuesPage() {
  const { data, isLoading } = useSupplyChainDashboard({});
  const escalateIssue = useEscalateIssue();
  const issues = data?.data.issues || [];

  return (
    <RoleGuard roles={SUPPLY_CHAIN_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Supply Chain Coordinator' }, { label: 'Issues' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Issue Resolution" subtitle="Open disruptions and escalation workflow" />
          <CardBody>
            {isLoading ? (
              <p className="text-gray-500">Loading issues...</p>
            ) : (
              <div className="space-y-2">
                {issues.map((issue) => (
                  <div key={issue.id} className="rounded-lg border border-white/[0.08] bg-surface-dark p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-semibold">{issue.type} - {issue.item}</p>
                      <p className="text-xs text-gray-400">Impact: {issue.impact} | Status: {issue.status} | Reported: {new Date(issue.reportedAt).toLocaleString()}</p>
                    </div>
                    <button
                      className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold disabled:opacity-50"
                      disabled={issue.status !== 'Open' || escalateIssue.isPending}
                      onClick={() => escalateIssue.mutate(issue.id)}
                    >
                      Escalate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
