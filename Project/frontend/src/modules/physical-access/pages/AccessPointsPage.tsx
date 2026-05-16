'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Search, Plus, DoorClosed, Settings2, ShieldAlert, CheckCircle2, ChevronRight, MapPin, Wrench } from 'lucide-react';
import { cn } from '@/utils/cn';

const mockPoints = [
  { id: 'ap-001', name: 'Main Lobby Turnstile 1', location: 'Ground Floor East', zone: 'Public', type: 'Turnstile', status: 'online', lastMaintenance: '2026-04-15' },
  { id: 'ap-002', name: 'ICU Ward Door', location: 'Level 3 North', zone: 'Critical Care', type: 'Smart Door', status: 'online', lastMaintenance: '2026-05-01' },
  { id: 'ap-003', name: 'Pharmacy Vault', location: 'Level 2 Secure', zone: 'High Security', type: 'Biometric Vault', status: 'locked_down', lastMaintenance: '2026-04-20' },
  { id: 'ap-004', name: 'Staff Entrance Gate', location: 'Parking Level 1', zone: 'Staff Only', type: 'Boom Barrier', status: 'maintenance', lastMaintenance: '2026-05-10' },
  { id: 'ap-005', name: 'Server Room Alpha', location: 'Basement 2', zone: 'IT Infrastructure', type: 'Mantraps', status: 'online', lastMaintenance: '2026-03-30' },
];

export function AccessPointsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredPoints = mockPoints.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Access Points Management</h1>
          <p className="text-gray-400 mt-1 text-sm">Control and monitor physical entry hardware across all hospital zones</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-emergency/30 text-emergency-light hover:bg-emergency/10">
            <ShieldAlert className="w-4 h-4 mr-2" /> Global Lockdown
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white border-none">
            <Plus className="w-4 h-4 mr-2" /> Provision Hardware
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Points', value: 1248, color: 'text-white', bg: 'bg-white/10', icon: DoorClosed },
          { label: 'Online', value: 1230, color: 'text-success-light', bg: 'bg-success/10', icon: CheckCircle2 },
          { label: 'In Maintenance', value: 12, color: 'text-warning-light', bg: 'bg-warning/10', icon: Wrench },
          { label: 'Locked Down', value: 6, color: 'text-emergency-light', bg: 'bg-emergency/10', icon: ShieldAlert },
        ].map((stat, i) => (
          <Card key={i} className="p-5 border-white/[0.06] bg-surface-dark flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
          </Card>
        ))}
      </div>

      <Card className="flex-1 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col">
        <div className="p-4 border-b border-white/[0.04] bg-surface-light rounded-t-xl flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by point name or location..." 
              className="pl-10 bg-black/20 border-white/10 focus:border-blue-500 text-white"
            />
          </div>
          <div className="flex items-center gap-2 bg-black/20 rounded-lg p-1 border border-white/5">
            {['all', 'online', 'maintenance', 'locked_down'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "px-4 py-1.5 text-xs font-medium rounded-md capitalize transition-colors",
                  filter === s ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
                )}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-black/20 sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="py-4 pl-6 text-gray-400 font-semibold uppercase text-xs tracking-wider">Hardware Point</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">Location & Zone</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">Status</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">Last Maintenance</th>
                <th className="py-4 pr-6 text-gray-400 font-semibold uppercase text-xs tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filteredPoints.map(point => (
                <tr key={point.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <DoorClosed className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{point.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{point.id} • {point.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-300">{point.location}</p>
                        <p className="text-xs text-blue-400">{point.zone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className={cn(
                      "border-none capitalize",
                      point.status === 'online' ? 'text-success-light bg-success/10' :
                      point.status === 'locked_down' ? 'text-emergency-light bg-emergency/10' :
                      'text-warning-light bg-warning/10'
                    )}>
                      {point.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-gray-400">
                    {new Date(point.lastMaintenance).toLocaleDateString()}
                  </td>
                  <td className="py-4 pr-6 text-right">
                    <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Settings2 className="w-4 h-4 mr-2" /> Configure
                    </Button>
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
