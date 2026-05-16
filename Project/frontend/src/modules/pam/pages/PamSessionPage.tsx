'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Search, Activity, StopCircle, Eye, AlertTriangle } from 'lucide-react';

const mockSessions = [
  { id: 'sess-892', user: 'db-admin-01', target: 'db-ehr-primary:5432', protocol: 'PostgreSQL', duration: '12m 45s', risk: 'low', status: 'active' },
  { id: 'sess-893', user: 'ext-vendor-support', target: '10.0.0.1 (FW)', protocol: 'SSH', duration: '4h 10m', risk: 'critical', status: 'active' },
  { id: 'sess-894', user: 'admin-jsmith', target: 'dc01.medtrustx.internal', protocol: 'RDP', duration: '2m 10s', risk: 'medium', status: 'active' },
];

export function PamSessionPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Active PAM Sessions</h1>
          <p className="text-gray-400 mt-1 text-sm">Monitor, ghost, or terminate live privileged connections</p>
        </div>
      </div>

      <Card className="flex-1 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col">
        <div className="p-4 border-b border-white/[0.04] bg-surface-light rounded-t-xl">
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search sessions..." className="bg-black/20 border-white/10 text-white max-w-md" icon={<Search className="w-4 h-4 text-gray-500" />} />
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-black/20 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="py-4 pl-6 text-gray-400 font-semibold uppercase text-xs">Identity</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Target Asset</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Protocol</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Duration</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Risk</th>
                <th className="py-4 pr-6 text-gray-400 font-semibold uppercase text-xs text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {mockSessions.map(sess => (
                <tr key={sess.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 pl-6 font-bold text-blue-400 text-sm font-mono">{sess.user}</td>
                  <td className="py-4 px-4 font-mono text-gray-300 text-xs">{sess.target}</td>
                  <td className="py-4 px-4 text-gray-300">{sess.protocol}</td>
                  <td className="py-4 px-4 text-gray-400">{sess.duration}</td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className={`border-none capitalize ${
                      sess.risk === 'critical' ? 'text-emergency-light bg-emergency/10' :
                      sess.risk === 'medium' ? 'text-warning-light bg-warning/10' : 'text-success-light bg-success/10'
                    }`}>
                      {sess.risk === 'critical' && <AlertTriangle className="w-3 h-3 mr-1 inline animate-pulse" />}
                      {sess.risk}
                    </Badge>
                  </td>
                  <td className="py-4 pr-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="h-8 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                        <Eye className="w-4 h-4 mr-1" /> Ghost
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs border-emergency/30 text-emergency-light hover:bg-emergency/10">
                        <StopCircle className="w-4 h-4 mr-1" /> Kill
                      </Button>
                    </div>
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
