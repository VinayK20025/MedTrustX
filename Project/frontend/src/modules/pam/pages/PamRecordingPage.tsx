'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PlayCircle, Download, Clock, ShieldAlert } from 'lucide-react';

const mockRecs = [
  { id: 'rec-001', session: 'sess-889', user: 'admin-jsmith', duration: '45m 12s', timestamp: '2026-05-11T14:20:00Z', risk: 'high', size: '14.2 MB' },
  { id: 'rec-002', session: 'sess-890', user: 'db-admin-01', duration: '12m 05s', timestamp: '2026-05-11T15:00:00Z', risk: 'low', size: '3.1 MB' },
  { id: 'rec-003', session: 'sess-891', user: 'network-eng', duration: '1h 20m', timestamp: '2026-05-12T01:10:00Z', risk: 'medium', size: '45.8 MB' },
];

export function PamRecordingPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Session Recordings Vault</h1>
          <p className="text-gray-400 mt-1 text-sm">Review, playback, and export TTY/RDP session recordings for audit</p>
        </div>
      </div>

      <Card className="flex-1 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-black/20 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="py-4 pl-6 text-gray-400 font-semibold uppercase text-xs">Date & Time</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Identity</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Duration</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Risk Profile</th>
                <th className="py-4 pr-6 text-gray-400 font-semibold uppercase text-xs text-right">Playback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {mockRecs.map(rec => (
                <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 pl-6">
                    <p className="font-bold text-white">{new Date(rec.timestamp).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 font-mono">ID: {rec.session}</p>
                  </td>
                  <td className="py-4 px-4 font-mono text-blue-400 text-sm">{rec.user}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4 text-gray-500" /> {rec.duration}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">{rec.size}</p>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className={`border-none capitalize ${
                      rec.risk === 'high' ? 'text-emergency-light bg-emergency/10' :
                      rec.risk === 'medium' ? 'text-warning-light bg-warning/10' : 'text-success-light bg-success/10'
                    }`}>
                      {rec.risk === 'high' && <ShieldAlert className="w-3 h-3 mr-1 inline" />}
                      {rec.risk} Risk
                    </Badge>
                  </td>
                  <td className="py-4 pr-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="h-8 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                        <PlayCircle className="w-4 h-4 mr-1" /> Watch
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs border-white/10 text-gray-400 hover:bg-white/5">
                        <Download className="w-4 h-4" />
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
