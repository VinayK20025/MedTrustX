'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Network, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { IntegrationInterface, InterfaceType } from '../types/integration.types';

interface InterfacePanelProps {
  interfaces: IntegrationInterface[];
  activeInterfaceId?: string;
  onSelectInterface?: (id: string) => void;
}

const typeConfig: Record<InterfaceType, string> = {
  'HL7 v2':  'bg-indigo-500/20 text-indigo-300',
  'FHIR R4': 'bg-teal-500/20 text-teal-300',
  'DICOM':   'bg-purple-500/20 text-purple-300',
  'REST':    'bg-amber-500/20 text-amber-300',
  'SOAP':    'bg-gray-500/20 text-gray-300',
};

const statusIcon = (status: IntegrationInterface['status']) => {
  if (status === 'Active') return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
  if (status === 'Degraded') return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
  if (status === 'Down') return <XCircle className="w-3.5 h-3.5 text-red-400" />;
  return <div className="w-3.5 h-3.5 rounded-full bg-gray-400" />;
};

export const InterfacePanel: React.FC<InterfacePanelProps> = ({ interfaces, activeInterfaceId, onSelectInterface }) => {
  const degraded = interfaces.filter(i => i.status !== 'Active').length;
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Interface Registry"
        icon={<Network className="w-4 h-4" />}
        action={
          degraded > 0
            ? <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">{degraded} degraded</span>
            : <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">{interfaces.length} active</span>
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {interfaces.map(iface => (
            <div
              key={iface.id}
              onClick={() => onSelectInterface?.(iface.id)}
              className={cn(
                "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                activeInterfaceId === iface.id ? "bg-white/[0.04] border-l-teal-500" :
                iface.status === 'Degraded' ? "border-l-amber-500" :
                iface.status === 'Down' ? "border-l-red-500" : "border-l-transparent"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 mr-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {statusIcon(iface.status)}
                    <p className="text-[10px] font-mono text-gray-500">{iface.id}</p>
                  </div>
                  <h4 className="text-sm font-medium text-white leading-snug">{iface.name}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{iface.sourceSystem} → {iface.targetSystem}</p>
                </div>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0", typeConfig[iface.type])}>
                  {iface.type}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { label: 'Msg/hr', value: iface.throughputPerHour.toLocaleString() },
                  { label: 'Latency', value: `${iface.avgLatencyMs}ms`, warn: iface.avgLatencyMs > iface.sla },
                  { label: 'Errors', value: `${iface.errorRate}%`, warn: iface.errorRate > 1 },
                ].map(({ label, value, warn }) => (
                  <div key={label} className="text-center">
                    <p className="text-[10px] text-gray-500">{label}</p>
                    <p className={cn("text-xs font-bold", warn ? "text-amber-400" : "text-white")}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
