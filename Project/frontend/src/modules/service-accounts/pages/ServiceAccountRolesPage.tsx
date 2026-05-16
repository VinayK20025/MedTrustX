'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Search, Plus, Lock, ShieldCheck, KeyRound, Server, Activity, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';

// Mock data for Service Account Roles
const mockSaRoles = [
  { id: 'role-sa-001', name: 'ehr-read-only', type: 'system', accountsAttached: 14, description: 'Provides read-only access to EHR APIs. Strictly limited to GET requests.', permissions: ['ehr:patients:read', 'ehr:records:read'] },
  { id: 'role-sa-002', name: 'billing-write', type: 'custom', accountsAttached: 3, description: 'Write access for external billing and insurance gateways.', permissions: ['billing:invoices:write', 'billing:claims:submit'] },
  { id: 'role-sa-003', name: 'iomt-telemetry-ingest', type: 'system', accountsAttached: 245, description: 'Role for edge devices to stream telemetry to the central IoT hub.', permissions: ['iot:telemetry:write', 'iot:status:update'] },
  { id: 'role-sa-004', name: 'auth-gateway-admin', type: 'system', accountsAttached: 2, description: 'High-privilege role for the API Gateway to validate tokens.', permissions: ['auth:tokens:verify', 'iam:users:read'] },
];

export function ServiceAccountRolesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState(mockSaRoles[0]);

  const filteredRoles = mockSaRoles.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <Breadcrumbs items={[{ label: 'Service Accounts' }, { label: 'Role Management' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Machine Role Management</h1>
          <p className="text-gray-400 mt-1 text-sm">Define and enforce least-privilege scopes for API and Service Accounts</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-none">
          <Plus className="w-4 h-4 mr-2" /> Create SA Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Role List */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search machine roles..." 
            className="bg-black/20 border-white/10 focus:border-indigo-500 text-white"
            icon={<Search className="w-4 h-4 text-gray-500" />}
          />
          
          <Card className="flex-1 overflow-y-auto border-white/[0.06] shadow-glass bg-surface-dark">
            <div className="p-2 space-y-1">
              {filteredRoles.map(role => (
                <button 
                  key={role.id} 
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors group flex items-center justify-between",
                    selectedRole.id === role.id ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded transition-colors",
                      selectedRole.id === role.id ? "bg-indigo-500/20 text-indigo-400" : "bg-white/[0.05] text-gray-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400"
                    )}>
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{role.name}</p>
                      <p className="text-xs text-gray-500">{role.accountsAttached} active SAs</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Role Details */}
        <div className="md:col-span-2">
          {selectedRole ? (
            <Card className="h-full border-white/[0.06] shadow-glass bg-surface-light flex flex-col">
              <CardHeader className="border-b border-white/[0.04] p-6 flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{selectedRole.name}</h2>
                    <Badge variant="outline" className={cn(
                      "border-none",
                      selectedRole.type === 'system' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-fuchsia-500/10 text-fuchsia-400'
                    )}>
                      {selectedRole.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-xl">{selectedRole.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-white/10 text-gray-300">
                    <Edit3 className="w-4 h-4 mr-2" /> Modify Scope
                  </Button>
                  <Button variant="outline" size="sm" className="border-emergency/30 text-emergency-light hover:bg-emergency/10 p-0 w-8 flex justify-center items-center">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardBody className="p-6 space-y-8 flex-1 overflow-y-auto">
                <div>
                  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" /> API Permission Scopes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRole.permissions.map((perm, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.05] bg-white/[0.02]">
                        <Activity className="w-4 h-4 text-success-light" />
                        <span className="text-sm text-gray-300 font-mono">{perm}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">M2M Attachment Data</h3>
                  <div className="grid grid-cols-3 gap-4 bg-black/20 p-5 rounded-xl border border-white/[0.03]">
                    <div>
                      <p className="text-xs text-gray-500">Internal UUID</p>
                      <p className="text-sm text-white font-mono mt-1">{selectedRole.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Service Accounts Linked</p>
                      <p className="text-sm text-white font-mono mt-1">{selectedRole.accountsAttached} Active SAs</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Risk Profile</p>
                      <p className="text-sm text-success-light font-mono mt-1">Least-Privilege</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">Select a machine role to configure scopes</div>
          )}
        </div>
      </div>
    </div>
  );
}
