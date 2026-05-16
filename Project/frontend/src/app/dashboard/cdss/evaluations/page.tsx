'use client';

import { Card, Skeleton, Badge } from '@/design-system';
import { useUIStore } from '@/store/ui.store';
import { useEffect, useState } from 'react';
import { useCDSSEvaluations } from '@/modules/cdss/hooks/useCDSS';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function EvaluationsPage() {
  const setPageMetadata = useUIStore((s) => s.setPageMetadata);
  const { data, isLoading } = useCDSSEvaluations();
  const [selectedEval, setSelectedEval] = useState<string | null>(null);

  useEffect(() => {
    setPageMetadata({
      title: 'Evaluations',
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'CDSS', href: '/dashboard/cdss' },
        { label: 'Evaluations' },
      ],
    });
  }, [setPageMetadata]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  return (
    <RoleGuard
      roles={['clinician', 'doctor', 'nurse', 'clinical-informaticist', 'super-admin']}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">CDSS Evaluations</h1>
          <p className="text-sm text-gray-600">{data?.length || 0} evaluations</p>
        </div>

        <div className="space-y-3">
          {data?.map((evaluation) => (
            <Card
              key={evaluation.id}
              className="p-6 border-l-4 border-l-purple-500 cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setSelectedEval(selectedEval === evaluation.id ? null : evaluation.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">Patient {evaluation.patientTag}</h3>
                    <Badge variant="secondary">Evaluation {evaluation.id.split('-')[1]}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    {evaluation.encounterId && (
                      <div>
                        <p className="text-gray-600">Encounter</p>
                        <p className="font-medium">{evaluation.encounterId}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600">Evaluated At</p>
                      <p className="font-medium">{new Date(evaluation.evaluatedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-gray-600">Rules Fired</p>
                      <p className="font-medium">{evaluation.rulesFired.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Recommendations Generated</p>
                      <p className="font-medium">{evaluation.recommendationsGenerated.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Alerts Triggered</p>
                      <p className="font-medium">{evaluation.alertsTriggered.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedEval === evaluation.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* Input Data */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Input Data</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm space-y-1 max-h-40 overflow-y-auto">
                      {Object.entries(evaluation.inputData).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evaluation Result */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Evaluation Result</h4>
                    <div className="bg-blue-50 p-3 rounded text-sm space-y-1 max-h-40 overflow-y-auto">
                      {Object.entries(evaluation.result).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fired Rules */}
                  {evaluation.rulesFired.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Rules Fired</h4>
                      <div className="flex flex-wrap gap-2">
                        {evaluation.rulesFired.map((rule, idx) => (
                          <Badge key={idx} variant="outline">
                            {rule}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generated Recommendations */}
                  {evaluation.recommendationsGenerated.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Generated Recommendations</h4>
                      <div className="flex flex-wrap gap-2">
                        {evaluation.recommendationsGenerated.map((rec, idx) => (
                          <Badge key={idx} variant="secondary">
                            {rec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Triggered Alerts */}
                  {evaluation.alertsTriggered.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Triggered Alerts</h4>
                      <div className="flex flex-wrap gap-2">
                        {evaluation.alertsTriggered.map((alert, idx) => (
                          <Badge key={idx} variant="destructive">
                            {alert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
