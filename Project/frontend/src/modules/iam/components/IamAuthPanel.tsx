'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { IAMAuthMethod } from '../types/iam.types';
import { Fingerprint, CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { authMethods: IAMAuthMethod[]; }

export function IamAuthPanel({ authMethods }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/15"><Fingerprint className="w-4 h-4 text-cyan-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Authentication (MFA/SSO)</h3>
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto max-h-[400px]">
        <div className="space-y-4">
          {authMethods.map(auth => (
            <div key={auth.id} className={cn(
              'p-4 rounded-xl border flex items-center justify-between',
              auth.status === 'disabled' ? 'border-white/[0.04] bg-surface-dark opacity-60' : 'border-cyan-500/20 bg-cyan-500/5'
            )}>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {auth.method}
                  <span className={cn('text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider',
                    auth.status === 'required' ? 'bg-emergency/20 text-emergency-light' :
                    auth.status === 'enabled' ? 'bg-success/20 text-success-light' : 'bg-white/10 text-gray-400'
                  )}>
                    {auth.status}
                  </span>
                </h4>
                <p className="text-[11px] text-gray-500 mt-1">Provider: {auth.provider}</p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-lg font-black text-white">{auth.adoptionRate}%</span>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Adoption</span>
                </div>
                <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5">Configure</Button>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
