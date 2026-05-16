'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Search, Activity, ShieldAlert, DoorClosed } from 'lucide-react';

const mockLogs = [
  { id: 'l-001', timestamp: '2026-05-12T05:20:10Z', user: 'Dr. Sarah Jenkins', point: 'ICU Ward Door', type: 'biometric', status: 'Success' },
  { id: 'l-002', timestamp: '2026-05-12T05:18:45Z', user: 'John Doe', point: 'Pharmacy Vault', type: 'mobile', status: 'Denied - Policy' },
  { id: 'l-003', timestamp: '2026-05-12T05:15:20Z', user: 'Alice Smith', point: 'Main Lobby Turnstile 1', type: 'card', status: 'Denied - Expired' },
  { id: 'l-004', timestamp: '2026-05-12T05:10:00Z', user: 'Unknown', point: 'Server Room Alpha', type: 'forced_entry', status: 'Alarm Triggered' },
];

export function AccessLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Access Audit Trail</h1>
          <p className="text-gray-400 mt-1 text-sm">Immutable log of all physical entry authentications and alarms</p>
        </div>
      </div>

      <Card className="flex-1 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col">
        <div className="p-4 border-b border-white/[0.04] bg-surface-light rounded-t-xl">
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by user, point, or status..." 
            className="bg-black/20 border-white/10 text-white max-w-md"
            icon={<Search className="w-4 h-4 text-gray-500" />}
          />
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-black/20 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="py-4 pl-6 text-gray-400 font-semibold uppercase text-xs">Timestamp</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Identity</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Access Point</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Method</th>
                <th className="py-4 pr-6 text-gray-400 font-semibold uppercase text-xs">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {mockLogs.map(log => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 text-gray-400 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-4 px-4 font-bold text-white text-sm">{log.user}</td>
                  <td className="py-4 px-4 text-gray-300 text-sm flex items-center gap-2"><DoorClosed className="w-3.5 h-3.5 text-gray-500"/>{log.point}</td>
                  <td className="py-4 px-4 text-gray-400 text-xs capitalize">{log.type.replace('_', ' ')}</td>
                  <td className={`py-4 pr-6 font-bold text-sm ${log.status === 'Success' ? 'text-success-light' : 'text-emergency-light flex items-center gap-2'}`}>
                    {log.status !== 'Success' && <ShieldAlert className="w-4 h-4" />}
                    {log.status}
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
