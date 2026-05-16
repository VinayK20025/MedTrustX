'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useIamDashboard } from '../hooks/useIamAnalytics';
import { Search, Plus, KeyRound, Shield, CheckCircle2, ChevronRight, Edit3, Trash2 } from 'lucide-react';

export function IamRolesPage() {
  const { data, isLoading } = useIamDashboard({ timeframe: 'all' });
  const [searchTerm, setSearchTerm] = useState('');

  const roles = data?.data?.roles || [];
  const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">RBAC / ABAC Roles</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage role definitions and permission assignments</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-500 text-white border-none">
          <Plus className="w-4 h-4 mr-2" /> Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <div className="md:col-span-1 flex flex-col gap-4">
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search roles..." 
            className="bg-black/20 border-white/10 focus:border-teal-500 text-white"
            icon={<Search className="w-4 h-4 text-gray-500" />}
          />
          
          <Card className="flex-1 overflow-y-auto border-white/[0.06] shadow-glass bg-surface-dark">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="flex justify-center p-8"><Spinner /></div>
              ) : filteredRoles.map(role => (
                <button key={role.id} className="w-full text-left p-3 rounded-lg hover:bg-white/[0.04] transition-colors group flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-white/[0.05] group-hover:bg-teal-500/20 group-hover:text-teal-400 transition-colors">
                      <KeyRound className="w-4 h-4 text-gray-400 group-hover:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{role.name}</p>
                      <p className="text-xs text-gray-500">{role.userCount} users • {role.type.toUpperCase()}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          {filteredRoles.length > 0 ? (
            <Card className="h-full border-white/[0.06] shadow-glass bg-surface-light flex flex-col">
              <CardHeader className="border-b border-white/[0.04] p-6 flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{filteredRoles[0].name}</h2>
                    <Badge variant="outline" className="border-teal-500/30 text-teal-400 bg-teal-500/10">
                      {filteredRoles[0].type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{filteredRoles[0].description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-white/10 text-gray-300">
                    <Edit3 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button variant="outline" size="icon" className="border-emergency/30 text-emergency-light hover:bg-emergency/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="p-6 space-y-8 flex-1 overflow-y-auto">
                <div>
                  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-teal-500" /> Attached Permissions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredRoles[0].permissions.map((perm, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.05] bg-white/[0.02]">
                        <CheckCircle2 className="w-4 h-4 text-success-light" />
                        <span className="text-sm text-gray-300 font-mono">{perm}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Role Metadata</h3>
                  <div className="grid grid-cols-2 gap-6 bg-black/20 p-5 rounded-xl border border-white/[0.03]">
                    <div>
                      <p className="text-xs text-gray-500">Internal ID</p>
                      <p className="text-sm text-white font-mono mt-1">{filteredRoles[0].id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm text-white mt-1">{new Date(filteredRoles[0].lastUpdated).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Active Users</p>
                      <p className="text-sm text-white mt-1">{filteredRoles[0].userCount} assigned identities</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
             <div className="h-full flex items-center justify-center text-gray-500">Select a role to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}
