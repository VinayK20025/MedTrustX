'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileKey, Shield, AlertTriangle } from 'lucide-react';

const mockPolicies = [
  { id: 'p-001', role: 'Attending Physician', zone: 'ICU Ward', rules: { schedule: '24/7', requires_2fa: false, tailgating_alert: true } },
  { id: 'p-002', role: 'Maintenance Staff', zone: 'Server Room', rules: { schedule: '08:00-18:00', requires_2fa: true, escort_required: false } },
  { id: 'p-003', role: 'Visitor', zone: 'Pharmacy Vault', rules: { access: 'denied', alert_on_attempt: true } },
];

export function AccessPoliciesPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Physical Access Policies</h1>
          <p className="text-gray-400 mt-1 text-sm">Configure ABAC and RBAC rules mapping human roles to physical zones</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white border-none">
          <FileKey className="w-4 h-4 mr-2" /> Add Policy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {mockPolicies.map(policy => (
          <Card key={policy.id} className="border-white/[0.06] bg-surface-dark hover:border-white/[0.12] transition-colors">
            <CardHeader className="border-b border-white/[0.04] p-5 pb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-white text-base">{policy.role}</h3>
                  <p className="text-emerald-400 text-xs">→ {policy.zone}</p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-5 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enforcement Rules</p>
                {Object.entries(policy.rules).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center p-2 rounded bg-black/20 border border-white/5">
                    <span className="text-gray-300 text-sm capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className={`text-sm font-bold ${v === 'denied' || v === true ? 'text-emergency-light' : 'text-success-light'}`}>
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
