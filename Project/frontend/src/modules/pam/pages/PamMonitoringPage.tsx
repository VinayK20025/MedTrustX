'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Terminal, AlertTriangle, ShieldAlert, Lock, Play } from 'lucide-react';
import { usePamDashboard } from '../hooks/usePamAnalytics';
import { Skeleton } from '@/components/ui/Spinner';

export function PamMonitoringPage() {
  const { data, isLoading } = usePamDashboard({});
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;

  const acts = data?.data?.liveActivities ?? [];
  const filtered = acts.filter(a => a.user.toLowerCase().includes(searchTerm.toLowerCase()) || a.command.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Session Monitoring</h1>
          <p className="text-gray-400 mt-1 text-sm">Real-time TTY stream analysis and command interception</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-emergency/30 text-emergency-light hover:bg-emergency/10">
            <ShieldAlert className="w-4 h-4 mr-2" /> Block All Connections
          </Button>
        </div>
      </div>

      <Card className="flex-1 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col font-mono">
        <div className="p-4 border-b border-white/[0.04] bg-surface-light rounded-t-xl flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Filter live stream by user, IP, or command..." className="pl-10 bg-black/20 border-white/10 text-white" />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-teal-400 font-sans px-3 py-1 bg-teal-500/10 rounded-full border border-teal-500/20">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            Live Stream Connected
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 bg-black/40">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="text-gray-500 text-xs uppercase tracking-widest sticky top-0 bg-black/80 backdrop-blur-md">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Identity@Session</th>
                <th className="py-3 px-4 w-1/2">Command Execution</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filtered.map(act => (
                <tr key={act.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-3 px-4 text-gray-500 text-xs">[{new Date(act.timestamp).toLocaleTimeString()}]</td>
                  <td className="py-3 px-4 font-bold text-teal-400 text-xs">{act.user}<span className="text-gray-500">@{act.sessionId}</span></td>
                  <td className={`py-3 px-4 font-mono text-sm ${act.riskLevel === 'critical' ? 'text-emergency-light' : 'text-gray-300'}`}>
                    {act.riskLevel === 'critical' && <AlertTriangle className="w-3.5 h-3.5 inline mr-2 text-emergency-light animate-pulse" />}
                    {act.command}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button size="sm" variant="outline" className="h-7 text-xs border-white/10 text-gray-400 opacity-0 group-hover:opacity-100">
                      <Lock className="w-3 h-3 mr-1" /> Terminate
                    </Button>
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
