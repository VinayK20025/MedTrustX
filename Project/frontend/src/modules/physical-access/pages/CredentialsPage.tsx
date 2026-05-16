'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Search, Fingerprint, Smartphone, CreditCard, UserX, UserCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

const mockCreds = [
  { id: 'c-001', user: 'Dr. Sarah Jenkins', role: 'Surgeon', type: 'card', value: 'RFID-1024-721A', status: 'active', issued: '2025-11-10' },
  { id: 'c-002', user: 'Dr. Sarah Jenkins', role: 'Surgeon', type: 'biometric', value: 'FP-HASH-88A9', status: 'active', issued: '2025-11-10' },
  { id: 'c-003', user: 'John Doe', role: 'Nurse', type: 'mobile', value: 'NFC-MOBILE-992B', status: 'revoked', issued: '2026-01-05' },
  { id: 'c-004', user: 'Alice Smith', role: 'Visitor', type: 'card', value: 'RFID-TEMP-441C', status: 'expired', issued: '2026-05-11' },
];

export function CredentialsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Identity Credentials</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage physical tokens, biometrics, and mobile NFC identities</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-500 text-white border-none">
          Issue Credential
        </Button>
      </div>

      <Card className="flex-1 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col">
        <div className="p-4 border-b border-white/[0.04] bg-surface-light rounded-t-xl">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user or credential ID..." 
              className="pl-10 bg-black/20 border-white/10 text-white"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-black/20 sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="py-4 pl-6 text-gray-400 font-semibold uppercase text-xs">Identity Owner</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Credential Token</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Type</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Status</th>
                <th className="py-4 pr-6 text-gray-400 font-semibold uppercase text-xs text-right">Lifecycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {mockCreds.map(cred => (
                <tr key={cred.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 pl-6">
                    <p className="font-bold text-white text-sm">{cred.user}</p>
                    <p className="text-xs text-gray-500">{cred.role}</p>
                  </td>
                  <td className="py-4 px-4 font-mono text-gray-300 text-xs">{cred.value}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-gray-300 capitalize">
                      {cred.type === 'card' && <CreditCard className="w-4 h-4 text-blue-400" />}
                      {cred.type === 'biometric' && <Fingerprint className="w-4 h-4 text-fuchsia-400" />}
                      {cred.type === 'mobile' && <Smartphone className="w-4 h-4 text-emerald-400" />}
                      {cred.type}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className={cn(
                      "border-none capitalize",
                      cred.status === 'active' ? 'text-success-light bg-success/10' :
                      cred.status === 'revoked' ? 'text-emergency-light bg-emergency/10' :
                      'text-warning-light bg-warning/10'
                    )}>
                      {cred.status}
                    </Badge>
                  </td>
                  <td className="py-4 pr-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {cred.status === 'active' && (
                        <Button size="sm" variant="outline" className="h-8 text-xs border-emergency/30 text-emergency-light">
                          <UserX className="w-3.5 h-3.5 mr-1" /> Revoke
                        </Button>
                      )}
                      {cred.status !== 'active' && (
                        <Button size="sm" variant="outline" className="h-8 text-xs border-success/30 text-success-light">
                          <UserCheck className="w-3.5 h-3.5 mr-1" /> Re-issue
                        </Button>
                      )}
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
