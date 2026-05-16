'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useZeroTrustNetwork } from '../hooks/useZeroTrustNetwork';
import { Search, Monitor, ShieldCheck, ShieldAlert, Activity } from 'lucide-react';

export function ZtaPosturePage() {
  const { useDevicePosture } = useZeroTrustNetwork();
  const { data, isLoading } = useDevicePosture();
  const [searchTerm, setSearchTerm] = useState('');

  const devices = data?.data || [];
  const filteredDevices = devices.filter((d: any) => 
    d.device_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Endpoint Posture</h1>
          <p className="text-gray-400 mt-1 text-sm">Continuous validation of device compliance and health</p>
        </div>
        <Button variant="outline" className="border-white/10 text-gray-300">
          <Activity className="w-4 h-4 mr-2" /> Force Global Scan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="col-span-full flex justify-center p-20"><Spinner size="lg" /></div>
        ) : filteredDevices.map((device: any) => (
          <Card key={device.id} className="border-white/[0.06] shadow-glass bg-surface-dark flex flex-col p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${
                  device.compliance_status === 'compliant' ? 'bg-success/10 border-success/20 text-success-light' : 
                  'bg-emergency/10 border-emergency/20 text-emergency-light'
                }`}>
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white font-mono text-sm">{device.device_id}</h3>
                  <p className="text-xs text-gray-500 mt-1">ID: {device.id}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 mb-6">
              <span className="text-sm text-gray-400">Status</span>
              <div className="flex items-center gap-2">
                {device.compliance_status === 'compliant' ? (
                  <><ShieldCheck className="w-4 h-4 text-success-light" /> <span className="text-sm text-success-light font-bold">COMPLIANT</span></>
                ) : (
                  <><ShieldAlert className="w-4 h-4 text-emergency-light" /> <span className="text-sm text-emergency-light font-bold">NON-COMPLIANT</span></>
                )}
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Health Attributes</h4>
              {Object.entries(device.attributes || {}).map(([key, val]: [string, any]) => (
                <div key={key} className="flex justify-between items-center text-sm border-b border-white/[0.02] pb-2">
                  <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-white font-mono">{typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val}</span>
                </div>
              ))}
              {(!device.attributes || Object.keys(device.attributes).length === 0) && (
                <div className="text-gray-600 text-sm italic">No attributes collected.</div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
              <Button className="flex-1 bg-white/5 hover:bg-white/10 text-white border-none">View Logs</Button>
              {device.compliance_status !== 'compliant' && (
                <Button className="flex-1 bg-emergency/20 hover:bg-emergency/30 text-emergency-light border-none">Quarantine</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
