'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ServiceHealth } from '../types/cio.types';
import { Server, Activity } from 'lucide-react';

interface ServicesPanelProps {
  services: ServiceHealth[];
}

export function ServicesPanel({ services }: ServicesPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-success text-success-light';
      case 'degraded': return 'bg-warning text-warning-light';
      case 'offline': return 'bg-emergency text-emergency-light';
      default: return 'bg-gray-500 text-gray-300';
    }
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col font-mono">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between font-sans">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            Core Services Health
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Microservice SLI tracking</p>
        </div>
      </CardHeader>
      
      <CardBody className="p-0 flex-1 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-white/[0.02] border-b border-white/[0.04]">
            <tr>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Uptime</th>
              <th className="px-5 py-3 font-medium text-right">Latency</th>
              <th className="px-5 py-3 font-medium text-right">Err Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-5 py-3 font-medium text-gray-200">{service.name}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(service.status).split(' ')[0]}`} />
                    <span className={`text-xs uppercase tracking-wider font-bold ${getStatusColor(service.status).split(' ')[1]}`}>
                      {service.status}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right text-white">{service.uptime}</td>
                <td className="px-5 py-3 text-right text-gray-400 group-hover:text-white transition-colors">{service.latency}ms</td>
                <td className={`px-5 py-3 text-right ${service.errorRate > 1 ? 'text-warning-light font-bold' : 'text-gray-400'}`}>
                  {service.errorRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
