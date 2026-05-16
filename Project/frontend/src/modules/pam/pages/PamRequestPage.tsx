'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckSquare, ShieldCheck, XCircle } from 'lucide-react';

const mockReqs = [
  { id: 'req-001', user: 'jdoe', role: 'DevOps', target: 'db-ehr-primary:5432', reason: 'Emergency patch deployment', duration: '2 hours', status: 'pending' },
  { id: 'req-002', user: 'sjenkins', role: 'Surgeon', target: 'legacy-imaging-archive', reason: 'Review historical scans', duration: '30 mins', status: 'approved' },
  { id: 'req-003', user: 'asmith', role: 'Junior Admin', target: 'dc01.medtrustx.internal', reason: 'Routine maintenance', duration: '12 hours', status: 'denied' },
];

export function PamRequestPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Just-In-Time (JIT) Requests</h1>
          <p className="text-gray-400 mt-1 text-sm">Review, approve, or deny temporary elevation requests</p>
        </div>
      </div>

      <Card className="flex-1 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-black/20 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="py-4 pl-6 text-gray-400 font-semibold uppercase text-xs">Requestor</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Target Asset</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Business Justification</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Duration</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Status</th>
                <th className="py-4 pr-6 text-gray-400 font-semibold uppercase text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {mockReqs.map(req => (
                <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 pl-6">
                    <p className="font-bold text-blue-400">{req.user}</p>
                    <p className="text-xs text-gray-500">{req.role}</p>
                  </td>
                  <td className="py-4 px-4 font-mono text-gray-300 text-xs">{req.target}</td>
                  <td className="py-4 px-4 text-gray-400">{req.reason}</td>
                  <td className="py-4 px-4 text-gray-300 font-mono">{req.duration}</td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className={`border-none capitalize ${
                      req.status === 'pending' ? 'text-warning-light bg-warning/10' :
                      req.status === 'approved' ? 'text-success-light bg-success/10' : 'text-emergency-light bg-emergency/10'
                    }`}>
                      {req.status}
                    </Badge>
                  </td>
                  <td className="py-4 pr-6 text-right">
                    {req.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="h-8 text-xs border-success/30 text-success-light hover:bg-success/10">
                          <ShieldCheck className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs border-emergency/30 text-emergency-light hover:bg-emergency/10">
                          <XCircle className="w-4 h-4 mr-1" /> Deny
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
