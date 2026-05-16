'use client';

import { Card, Skeleton, Button, Badge } from '@/design-system';
import { useUIStore } from '@/store/ui.store';
import { useEffect, useState } from 'react';
import { useCDSSRecommendations, useApproveCDSSRecommendation, useRejectCDSSRecommendation } from '@/modules/cdss/hooks/useCDSS';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function RecommendationsPage() {
  const setPageMetadata = useUIStore((s) => s.setPageMetadata);
  const { data, isLoading } = useCDSSRecommendations();
  const { mutate: approveRec } = useApproveCDSSRecommendation();
  const { mutate: rejectRec } = useRejectCDSSRecommendation();
  const [selectedRec, setSelectedRec] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    setPageMetadata({
      title: 'Recommendations',
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'CDSS', href: '/dashboard/cdss' },
        { label: 'Recommendations' },
      ],
    });
  }, [setPageMetadata]);

  const handleApprove = (recId: string) => {
    approveRec({ recId, feedback: feedbackText });
    setSelectedRec(null);
    setFeedbackText('');
  };

  const handleReject = (recId: string) => {
    rejectRec({ recId, feedback: feedbackText });
    setSelectedRec(null);
    setFeedbackText('');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <RoleGuard
      roles={['clinician', 'doctor', 'nurse', 'clinical-informaticist', 'super-admin']}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Clinical Recommendations</h1>
          <p className="text-sm text-gray-600">{data?.length || 0} recommendations</p>
        </div>

        <div className="space-y-3">
          {data?.map((rec) => (
            <Card
              key={rec.id}
              className={`p-6 border-l-4 cursor-pointer transition-shadow hover:shadow-md ${
                rec.status === 'Pending' ? 'border-l-blue-500' :
                rec.status === 'Approved' ? 'border-l-green-500' :
                rec.status === 'Rejected' ? 'border-l-red-500' :
                'border-l-purple-500'
              }`}
              onClick={() => setSelectedRec(selectedRec === rec.id ? null : rec.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{rec.recommendation}</h3>
                    <Badge variant={
                      rec.status === 'Approved' ? 'success' :
                      rec.status === 'Rejected' ? 'destructive' :
                      rec.status === 'Implemented' ? 'secondary' :
                      'outline'
                    }>
                      {rec.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-gray-600">Patient</p>
                      <p className="font-medium">{rec.patientTag}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Category</p>
                      <p className="font-medium">{rec.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Clinical Area</p>
                      <p className="font-medium">{rec.clinicalArea}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Confidence</p>
                      <p className="font-medium">{(rec.confidenceScore * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    <p>Source: {rec.source} | Evidence Level: {rec.evidenceLevel}</p>
                    <p>Created: {new Date(rec.createdAt).toLocaleString()}</p>
                  </div>

                  {rec.approvedBy && (
                    <div className="mt-3 p-3 bg-green-50 rounded text-sm">
                      <p className="text-green-800">✓ Approved by {rec.approvedBy}</p>
                      {rec.feedback && <p className="text-green-700 mt-1">{rec.feedback}</p>}
                    </div>
                  )}
                </div>
              </div>

              {selectedRec === rec.id && rec.status === 'Pending' && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <textarea
                    placeholder="Add feedback (optional)..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(rec.id)}
                    >
                      ✓ Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReject(rec.id)}
                    >
                      ✗ Reject
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRec(null);
                        setFeedbackText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
