'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, FileKey } from 'lucide-react';

const mockPolicies = [
  { id: 'pol-001', name: 'Database Admin JIT Rules', targetGroup: 'PostgreSQL Clusters', rules: { max_duration: '4 hours', requires_approval: true, mfa_enforced: true, record_session: true } },
  { id: 'pol-002', name: 'Emergency Break-Glass', targetGroup: 'All Systems', rules: { max_duration: '24 hours', requires_approval: false, mfa_enforced: false, record_session: true, alert_on_use: true } },
  { id: 'pol-003', name: 'External Vendor Access', targetGroup: 'Jump Servers', rules: { max_duration: '8 hours', requires_approval: true, mfa_enforced: true, record_session: true, limit_commands: true } },
];

export function PamPolicyPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">PAM Policies</h1>
          <p className="text-gray-400 mt-1 text-sm">Configure security constraints for privileged access requests</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white border-none">
          <FileKey className="w-4 h-4 mr-2" /> New Policy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {mockPolicies.map(policy => (
          <Card key={policy.id} className="border-white/[0.06] bg-surface-dark hover:border-white/[0.12] transition-colors">
            <CardHeader className="border-b border-white/[0.04] p-5 pb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-white text-base">{policy.name}</h3>
                  <p className="text-emerald-400 text-xs">Applies to: {policy.targetGroup}</p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-5 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enforcement Rules</p>
                {Object.entries(policy.rules).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center p-2 rounded bg-black/20 border border-white/5">
                    <span className="text-gray-300 text-sm capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className={`text-sm font-bold ${v === true ? 'text-success-light' : v === false ? 'text-gray-500' : 'text-blue-400'}`}>
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
