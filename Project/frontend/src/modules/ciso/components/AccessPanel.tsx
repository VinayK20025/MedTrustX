'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AccessLogEntry } from '../types/ciso.types';
import { KeyRound, Ban } from 'lucide-react';
import { useRevokeAccess } from '../hooks/useCisoAnalytics';

interface AccessPanelProps {
  logs: AccessLogEntry[];
}

export function AccessPanel({ logs }: AccessPanelProps) {
  const { mutate: revokeAccess, isPending } = useRevokeAccess();

  const getOutcomeStyle = (outcome: string) => {
    switch (outcome) {
      case 'success': return 'text-success-light bg-success/10';
      case 'denied':  return 'text-emergency-light bg-emergency/10';
      case 'flagged': return 'text-warning-light bg-warning/10 animate-pulse';
      default: return 'text-gray-400 bg-white/5';
    }
  };

  const getActionStyle = (action: string) => {
    switch (action) {
      case 'break_glass': return 'text-emergency-light bg-emergency/20 border border-emergency/30';
      case 'delete':      return 'text-emergency-light bg-emergency/10';
      case 'modify':      return 'text-warning-light bg-warning/10';
      default: return 'text-gray-300 bg-white/5';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-emergency-light';
    if (score >= 50) return 'text-warning-light';
    return 'text-gray-400';
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col font-mono">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between font-sans">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Access Intelligence</h3>
            <p className="text-xs text-gray-400 mt-0.5">High-risk access events & anomalies</p>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="p-0 flex-1 overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[700px]">
          <thead className="text-[10px] text-gray-500 uppercase bg-white/[0.02] border-b border-white/[0.04]">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Resource</th>
              <th className="px-4 py-3 font-medium">Outcome</th>
              <th className="px-4 py-3 font-medium text-right">Risk</th>
              <th className="px-4 py-3 font-medium text-right">Time</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-gray-200 font-medium text-xs">{log.userName}</p>
                    <p className="text-[10px] text-gray-500">{log.role} • {log.ipAddress}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${getActionStyle(log.action)}`}>
                    {log.action.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-300 max-w-[200px] truncate">{log.resource}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${getOutcomeStyle(log.outcome)}`}>
                    {log.outcome}
                  </span>
                </td>
                <td className={`px-4 py-3 text-right text-sm font-bold ${getRiskColor(log.riskScore)}`}>
                  {log.riskScore}
                </td>
                <td className="px-4 py-3 text-right text-[10px] text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-3 text-right">
                  {log.riskScore >= 70 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] h-6 px-2 text-emergency-light opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                      onClick={() => revokeAccess(log.userId)}
                      disabled={isPending}
                    >
                      <Ban className="w-3 h-3" /> Revoke
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
