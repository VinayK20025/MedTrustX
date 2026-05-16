'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ZeroTrustIdentity } from '../types/network.types';
import { useRevokeIdentity } from '../hooks/useNetworkAnalytics';
import { Fingerprint, UserX } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { identities: ZeroTrustIdentity[]; }

export function NetworkZeroTrustPanel({ identities }: Props) {
  const { mutate: revoke, isPending } = useRevokeIdentity();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><Fingerprint className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Zero Trust Network Access</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="divide-y divide-white/[0.03]">
          {identities.map(id => (
            <div key={id.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                    {id.entityName}
                  </h4>
                  <span className="text-[10px] text-gray-500 font-mono mt-1">{id.entityType}</span>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  id.accessLevel === 'Allowed' ? 'bg-success/20 text-success-light' : 
                  id.accessLevel === 'Blocked' ? 'bg-emergency/20 text-emergency-light' : 'bg-warning/20 text-warning-light'
                )}>
                  {id.accessLevel}
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/[0.04]">
                <span className="text-[10px] text-gray-500 font-mono">Verified: {new Date(id.lastVerified).toLocaleTimeString()}</span>
                {id.accessLevel === 'Allowed' && (
                  <Button variant="ghost" size="xs" onClick={() => revoke(id.id)} disabled={isPending} className="h-7 text-[10px] text-emergency-light hover:bg-emergency/10 font-bold" leftIcon={<UserX className="w-3 h-3" />}>
                    Revoke Access
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
