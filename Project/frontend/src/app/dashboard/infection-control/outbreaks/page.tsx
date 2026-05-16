'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { useInfectionControlDashboard, useCompleteContainmentStep } from '@/modules/infection-control';

export default function InfectionOutbreaksPage() {
  const { data, isLoading } = useInfectionControlDashboard({});
  const { mutate: completeStep } = useCompleteContainmentStep();

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-xl" />;
  }

  const outbreaks = data?.data?.outbreaks ?? [];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infection Control' }, { label: 'Outbreaks' }]} />
      <div className="space-y-4">
        {outbreaks.map((outbreak) => (
          <Card key={outbreak.id} className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader title={`${outbreak.ward} · ${outbreak.pathogen}`} subtitle={`${outbreak.status} outbreak`} />
            <CardBody className="space-y-3">
              <div className="text-xs text-gray-500">Detected {new Date(outbreak.detectedAt).toLocaleDateString()} · {outbreak.caseCount} cases</div>
              <div className="space-y-2">
                {outbreak.containmentSteps.map((step) => (
                  <div key={step.step} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-sm text-white font-semibold">{step.label}</div>
                    {step.done ? (
                      <span className="text-xs text-emerald-400">Done</span>
                    ) : (
                      <Button
                        size="sm"
                        className="h-6 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25"
                        onClick={() => completeStep({ id: outbreak.id, step: step.step })}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
        {outbreaks.length === 0 && (
          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardBody className="text-sm text-gray-500 text-center py-8">No active outbreaks.</CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
