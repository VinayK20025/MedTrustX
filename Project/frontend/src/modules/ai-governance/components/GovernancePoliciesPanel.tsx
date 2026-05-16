import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useAiGovernance } from '../hooks/useAiGovernance';
import type { GovernancePolicy } from '../types/ai-governance.types';

export const GovernancePoliciesPanel: React.FC = () => {
  const { usePolicies } = useAiGovernance();
  const { data: response, isLoading } = usePolicies();

  const policies = response?.data || [
    { id: '1', policy_name: 'Clinical Diagnosis Guardrails', rules: { require_human_in_loop: true, max_autonomous_confidence: 0.99 } },
    { id: '2', policy_name: 'Patient Data Anonymization', rules: { strip_phi: true, enforce_differential_privacy: true } }
  ];

  if (isLoading) return <div>Loading governance policies...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Ethical Guardrails & Policies" />
      <CardBody>
        <div className="space-y-4">
          {policies.map((p: GovernancePolicy) => (
            <div key={p.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <p className="text-sm font-bold text-blue-400 mb-2">{p.policy_name}</p>
              <div className="flex flex-col gap-2">
                {Object.entries(p.rules).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-[12px] bg-black/40 border border-white/10 px-3 py-1.5 rounded">
                    <span className="text-gray-400 font-mono capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className={v === true ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
