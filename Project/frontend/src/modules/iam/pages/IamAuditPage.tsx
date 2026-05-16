'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useIamDashboard } from '../hooks/useIamAnalytics';
import { Search, ShieldAlert, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

export function IamAuditPage() {
  const { data } = useIamDashboard({ timeframe: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  
  const logs = data?.data?.auditLogs || [];
  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.actor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-white">IAM Audit Logs</h1>
        <p className="text-gray-400 mt-1">Immutable ledger of identity and access events</p>
      </div>

      <Card className="flex-1 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col">
        <div className="p-4 border-b border-white/[0.04] bg-surface-light rounded-t-xl flex items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events or actors..." 
              className="pl-10 bg-black/20 border-white/10 focus:border-teal-500 text-white"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="py-4 pl-6 text-gray-400 font-semibold uppercase text-xs tracking-wider">Timestamp</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">Severity</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">Action</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">Actor & IP</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 text-gray-300 font-mono text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {log.severity === 'critical' ? <ShieldAlert className="w-4 h-4 text-emergency-light" /> : 
                       log.severity === 'warning' ? <AlertTriangle className="w-4 h-4 text-warning-light" /> : 
                       <Info className="w-4 h-4 text-blue-400" />}
                      <Badge variant="outline" className={`border-none capitalize ${
                        log.severity === 'critical' ? 'text-emergency-light bg-emergency/10' :
                        log.severity === 'warning' ? 'text-warning-light bg-warning/10' :
                        'text-blue-400 bg-blue-400/10'
                      }`}>{log.severity}</Badge>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium text-white">{log.action}</td>
                  <td className="py-4 px-4">
                    <p className="text-gray-300">{log.actor}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">{log.ipAddress}</p>
                  </td>
                  <td className="py-4 px-4 text-gray-400 font-mono text-xs">{log.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
