'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useZeroTrustNetwork } from '../hooks/useZeroTrustNetwork';
import { Search, Plus, Lock, ShieldAlert, Edit3, Trash2, Power } from 'lucide-react';
import { cn } from '@/utils/cn';

export function ZtaPoliciesPage() {
  const { usePolicies } = useZeroTrustNetwork();
  const { data, isLoading } = usePolicies();
  const [searchTerm, setSearchTerm] = useState('');

  const policies = data?.data || [];
  const filteredPolicies = policies.filter((p: any) => 
    p.policy_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">ZTA Access Policies</h1>
          <p className="text-gray-400 mt-1 text-sm">Define and enforce micro-perimeters and context-aware rules</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-500 text-white border-none">
          <Plus className="w-4 h-4 mr-2" /> New ZTA Policy
        </Button>
      </div>

      <Card className="flex-1 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col">
        <div className="p-4 border-b border-white/[0.04] bg-surface-light rounded-t-xl">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search policies..." 
              className="pl-10 bg-black/20 border-white/10 focus:border-teal-500 text-white"
            />
          </div>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center p-10"><Spinner size="lg" /></div>
          ) : filteredPolicies.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No ZTA policies found</div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredPolicies.map((policy: any) => (
                <Card key={policy.id} className="border-white/5 bg-black/20 hover:bg-white/[0.02] transition-colors">
                  <CardHeader className="border-b border-white/5 p-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Lock className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{policy.policy_name}</h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">ID: {policy.id}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-success/30 text-success-light bg-success/10">Active</Badge>
                  </CardHeader>
                  <CardBody className="p-4 space-y-4">
                    <div className="bg-black/40 rounded-lg p-3 border border-white/5 font-mono text-sm">
                      <div className="text-gray-400 mb-2">Rules Engine Context:</div>
                      {Object.entries(policy.rules || {}).map(([k, v]: [string, any]) => (
                        <div key={k} className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <span className="text-teal-400 w-32">{k}:</span>
                          <span className="text-gray-300 bg-white/5 px-2 py-0.5 rounded break-all">{JSON.stringify(v)}</span>
                        </div>
                      ))}
                      {(!policy.rules || Object.keys(policy.rules).length === 0) && (
                        <div className="text-gray-600 italic">No specific rules defined. Implicit Deny.</div>
                      )}
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm" className="h-8 border-white/10 text-gray-300">
                        <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 border-warning/30 text-warning-light hover:bg-warning/10">
                        <Power className="w-3.5 h-3.5 mr-1.5" /> Disable
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 border-emergency/30 text-emergency-light hover:bg-emergency/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
