'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { AppIncident } from '../types/appsupport.types';
import { Users, Building2, AlertOctagon, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { incident?: AppIncident; }

export function ImpactPanel({ incident }: Props) {
  if (!incident) return null;

  return (
    <Card className="shadow-glass h-full flex flex-col border-white/[0.06]">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-orange-400" />
          <h3 className="text-[13px] font-bold tracking-widest uppercase text-orange-400">Business Impact</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 flex flex-col gap-6">
        
        <div>
           <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Blast Radius</h4>
           <div className="grid grid-cols-2 gap-3">
             <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center">
               <Users className="w-5 h-5 text-blue-400 mb-2" />
               <span className="text-[20px] font-black text-white">{incident.affectedUsersCount}</span>
               <span className="text-[9px] text-gray-400 uppercase font-bold mt-1">Users Blocked</span>
             </div>
             <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center text-center">
               <Activity className="w-5 h-5 text-emergency-light mb-2" />
               <span className="text-[20px] font-black text-white">{incident.failedTransactionsCount || 0}</span>
               <span className="text-[9px] text-gray-400 uppercase font-bold mt-1">Failed Jobs/Tx</span>
             </div>
           </div>
        </div>

        <div>
           <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Affected Departments</h4>
           <div className="flex flex-wrap gap-2">
             {incident.affectedDepartments.map(dep => (
               <span key={dep} className="text-[11px] bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-gray-200 flex items-center gap-1.5 font-bold">
                 <Building2 className="w-3 h-3 text-gray-400" /> {dep}
               </span>
             ))}
           </div>
        </div>

        <div className="mt-auto">
          <p className="text-[11px] text-gray-400 leading-relaxed bg-black/40 p-3 rounded border border-white/5 italic">
            "When restoring service, verify connectivity with the {incident.affectedDepartments.join(', ')} departments first to confirm mitigation."
          </p>
        </div>

      </CardBody>
    </Card>
  );
}
