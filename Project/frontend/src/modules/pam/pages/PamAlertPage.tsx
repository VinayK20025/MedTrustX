'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Search, AlertTriangle, Terminal, ShieldAlert } from 'lucide-react';

const mockAlerts = [
  { id: 'al-001', severity: 'critical', message: 'Unauthorized "rm -rf /" command detected in session', session: 'sess-893', user: 'ext-vendor-support', time: '2 mins ago' },
  { id: 'al-002', severity: 'warning', message: 'Session exceeded approved JIT duration', session: 'sess-892', user: 'db-admin-01', time: '15 mins ago' },
  { id: 'al-003', severity: 'critical', message: 'Break-glass policy invoked without active incident', session: 'sess-894', user: 'admin-jsmith', time: '1 hour ago' },
];

export function PamAlertPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Privileged Risk Alerts</h1>
          <p className="text-gray-400 mt-1 text-sm">Real-time alerts for anomalous privileged behaviors and policy violations</p>
        </div>
      </div>

      <Card className="flex-1 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col">
        <div className="p-4 border-b border-white/[0.04] bg-surface-light rounded-t-xl">
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search alerts..." className="bg-black/20 border-white/10 text-white max-w-md" icon={<Search className="w-4 h-4 text-gray-500" />} />
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {mockAlerts.map(alert => (
            <div key={alert.id} className="p-4 rounded-xl border border-white/10 bg-black/40 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
              <div className={`p-3 rounded-lg ${alert.severity === 'critical' ? 'bg-emergency/20 text-emergency-light' : 'bg-warning/20 text-warning-light'}`}>
                {alert.severity === 'critical' ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-white">{alert.message}</h3>
                  <span className="text-xs text-gray-500">{alert.time}</span>
                </div>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-gray-400 font-mono">User: <span className="text-blue-400">{alert.user}</span></span>
                  <span className="text-gray-400 font-mono">Session: <span className="text-teal-400">{alert.session}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
