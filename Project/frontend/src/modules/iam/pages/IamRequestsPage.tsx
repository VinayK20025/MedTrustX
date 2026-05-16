'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useIamDashboard, useApproveRequest, useRejectRequest } from '../hooks/useIamAnalytics';
import { Shield, Clock, Check, X } from 'lucide-react';

export function IamRequestsPage() {
  const { data } = useIamDashboard({ timeframe: 'all' });
  const { mutate: approve } = useApproveRequest();
  const { mutate: reject } = useRejectRequest();

  const requests = data?.data?.requests || [];
  const pending = requests.filter(r => r.status === 'pending');
  const completed = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px]">
      <div>
        <h1 className="text-2xl font-bold text-white">Access Requests</h1>
        <p className="text-gray-400 mt-1">Review and approve role escalation and access requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning-light" /> Pending Approvals ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <Card className="p-8 text-center text-gray-500 border-white/5 bg-surface-dark">
              No pending requests.
            </Card>
          ) : pending.map(req => (
            <Card key={req.id} className="p-5 border-warning/20 shadow-glass bg-gradient-to-br from-surface-dark to-warning/5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">{req.userName}</h3>
                  <p className="text-sm text-gray-400 font-mono mt-1">{req.userId}</p>
                </div>
                <Badge variant="outline" className="border-warning/30 text-warning-light bg-warning/10 capitalize">
                  {req.riskLevel} Risk
                </Badge>
              </div>
              <div className="bg-black/30 p-3 rounded border border-white/5 mb-4">
                <p className="text-sm text-gray-300"><span className="text-gray-500">Requested Role:</span> <span className="font-bold text-teal-400">{req.roleRequested}</span></p>
                <p className="text-sm text-gray-300 mt-2"><span className="text-gray-500">Reason:</span> "{req.reason}"</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{new Date(req.requestedAt).toLocaleString()}</span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => reject({ requestId: req.id, reason: 'Declined by admin' })} className="border-emergency/30 text-emergency-light hover:bg-emergency/10">
                    <X className="w-4 h-4 mr-2" /> Reject
                  </Button>
                  <Button onClick={() => approve(req.id)} className="bg-teal-600 hover:bg-teal-500 text-white border-none">
                    <Check className="w-4 h-4 mr-2" /> Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-400" /> Recent History
          </h2>
          <Card className="border-white/[0.06] bg-surface-dark overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/20">
                <tr>
                  <th className="py-3 px-4 text-gray-400 font-semibold">User</th>
                  <th className="py-3 px-4 text-gray-400 font-semibold">Role</th>
                  <th className="py-3 px-4 text-gray-400 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {completed.map(req => (
                  <tr key={req.id}>
                    <td className="py-3 px-4 text-white">{req.userName}</td>
                    <td className="py-3 px-4 text-gray-300">{req.roleRequested}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={req.status === 'approved' ? 'border-success/30 text-success-light' : 'border-emergency/30 text-emergency-light'}>
                        {req.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {completed.length === 0 && (
                  <tr><td colSpan={3} className="py-8 text-center text-gray-500">No recent history</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}
