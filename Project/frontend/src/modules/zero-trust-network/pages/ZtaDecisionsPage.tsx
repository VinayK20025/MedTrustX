'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useZeroTrustNetwork } from '../hooks/useZeroTrustNetwork';
import { Search, FileSearch, CheckCircle, XOctagon } from 'lucide-react';

export function ZtaDecisionsPage() {
  const { useDecisions } = useZeroTrustNetwork();
  const { data, isLoading } = useDecisions();
  const [searchTerm, setSearchTerm] = useState('');

  const decisions = data?.data || [];
  const filteredDecisions = decisions.filter((d: any) => 
    d.session_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.decision?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-white">Access Decisions Log</h1>
        <p className="text-gray-400 mt-1 text-sm">Audit trail of contextual policy evaluations and resulting actions</p>
      </div>

      <Card className="flex-1 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col">
        <div className="p-4 border-b border-white/[0.04] bg-surface-light rounded-t-xl flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search decisions or sessions..." 
              className="pl-10 bg-black/20 border-white/10 focus:border-teal-500 text-white"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
          ) : filteredDecisions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FileSearch className="w-12 h-12 mb-3 opacity-20" />
              <p>No decision logs found.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-black/20 sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="py-4 pl-6 text-gray-400 font-semibold uppercase text-xs tracking-wider">Log ID</th>
                  <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">Session Ref</th>
                  <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">Decision</th>
                  <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">Contextual Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredDecisions.map((decision: any) => (
                  <tr key={decision.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pl-6 font-mono text-gray-500 text-xs">{decision.id}</td>
                    <td className="py-4 px-4 font-mono text-indigo-300 text-xs">{decision.session_id}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {decision.decision === 'allow' || decision.decision === 'granted' ? (
                           <CheckCircle className="w-4 h-4 text-success-light" />
                        ) : (
                           <XOctagon className="w-4 h-4 text-emergency-light" />
                        )}
                        <Badge variant="outline" className={`border-none capitalize ${
                          decision.decision === 'allow' || decision.decision === 'granted' ? 'text-success-light bg-success/10' : 'text-emergency-light bg-emergency/10'
                        }`}>{decision.decision}</Badge>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {decision.reason || <span className="text-gray-600 italic">No reason provided</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
