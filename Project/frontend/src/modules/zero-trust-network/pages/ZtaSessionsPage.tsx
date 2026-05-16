'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useZeroTrustNetwork } from '../hooks/useZeroTrustNetwork';
import { Search, Network, XCircle, MonitorSmartphone } from 'lucide-react';

export function ZtaSessionsPage() {
  const { useSessions } = useZeroTrustNetwork();
  const { data, isLoading } = useSessions();
  const [searchTerm, setSearchTerm] = useState('');

  const sessions = data?.data || [];
  const filteredSessions = sessions.filter((s: any) => 
    s.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.device_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-white">Active Network Sessions</h1>
        <p className="text-gray-400 mt-1 text-sm">Monitor and terminate active authenticated sessions across the perimeter</p>
      </div>

      <Card className="flex-1 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col">
        <div className="p-4 border-b border-white/[0.04] bg-surface-light rounded-t-xl flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by User ID or Device ID..." 
              className="pl-10 bg-black/20 border-white/10 focus:border-teal-500 text-white"
            />
          </div>
          <Badge variant="outline" className="border-teal-500/30 text-teal-400 bg-teal-500/10 px-3 py-1 text-sm">
            {filteredSessions.length} Active Sessions
          </Badge>
        </div>
        
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Network className="w-12 h-12 mb-3 opacity-20" />
              <p>No active sessions found.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-black/20 sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="py-4 pl-6 text-gray-400 font-semibold uppercase text-xs tracking-wider">Session ID</th>
                  <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">Identity (User)</th>
                  <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">Endpoint (Device)</th>
                  <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">Status</th>
                  <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">Duration</th>
                  <th className="py-4 pr-6 text-gray-400 font-semibold uppercase text-xs tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredSessions.map((session: any) => {
                  const started = new Date(session.started_at);
                  const durationMins = Math.floor((Date.now() - started.getTime()) / 60000);
                  
                  return (
                    <tr key={session.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6 font-mono text-gray-400 text-xs">{session.id.substring(0, 8)}...</td>
                      <td className="py-4 px-4 font-bold text-white">{session.user_id}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <MonitorSmartphone className="w-4 h-4 text-gray-500" />
                          <span className="font-mono text-xs">{session.device_id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={`border-none capitalize ${
                          session.status === 'active' ? 'text-success-light bg-success/10' : 'text-gray-400 bg-gray-500/10'
                        }`}>{session.status}</Badge>
                      </td>
                      <td className="py-4 px-4 text-gray-400">
                        {durationMins < 60 ? `${durationMins}m` : `${Math.floor(durationMins/60)}h ${durationMins%60}m`}
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 text-xs border-emergency/30 text-emergency-light hover:bg-emergency/10">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Terminate
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
