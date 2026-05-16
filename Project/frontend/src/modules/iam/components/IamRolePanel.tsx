'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { IAMRole } from '../types/iam.types';
import { Shield, Key } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { roles: IAMRole[]; }

export function IamRolePanel({ roles }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/15"><Shield className="w-4 h-4 text-purple-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Role Management (RBAC/ABAC)</h3>
        </div>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-500 border-none text-white font-bold text-xs">
          Create Role
        </Button>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {roles.map(role => (
            <div key={role.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {role.name}
                    <span className={cn('text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider', 
                      role.type === 'abac' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                    )}>
                      {role.type}
                    </span>
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1">{role.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-white">{role.userCount}</span>
                  <span className="text-[10px] text-gray-500 block uppercase">Assigned Users</span>
                </div>
              </div>
              
              <div className="bg-surface-dark border border-white/[0.04] p-3 rounded-lg">
                <span className="text-[10px] font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                  <Key className="w-3 h-3" /> Permissions
                </span>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map(p => (
                    <span key={p} className="text-[10px] bg-white/[0.04] text-gray-300 px-2 py-1 rounded">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
