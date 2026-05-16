'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SuperAdminUserPanel } from '../components/SuperAdminUserPanel';
import { useSuperAdminDashboard } from '../hooks/useSuperAdminAnalytics';
import { Skeleton } from '@/components/ui/Spinner';
import { Search, ShieldAlert, Users, Lock, KeyRound, Clock, Activity, FileText } from 'lucide-react';

export function SuperAdminUsersPage() {
  const { data, isLoading } = useSuperAdminDashboard({});
  const [activeTab, setActiveTab] = useState('directory');

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }

  const users = data?.data?.users ?? [];
  const highRiskUsers = users.filter(u => u.riskScore >= 50).length;
  const lockedUsers = users.filter(u => u.status === 'locked').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <Breadcrumbs items={[{ label: 'Administration' }, { label: 'Cross-Tenant Users' }]} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-white/[0.06] bg-surface-dark flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 rounded-xl"><Users className="w-5 h-5 text-indigo-400" /></div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Global Users</p>
              <p className="text-2xl font-bold text-white mt-1">{users.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-white/[0.06] bg-surface-dark flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emergency/10 rounded-xl"><ShieldAlert className="w-5 h-5 text-emergency-light" /></div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">High Risk Accounts</p>
              <p className="text-2xl font-bold text-emergency-light mt-1">{highRiskUsers}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-white/[0.06] bg-surface-dark flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning/10 rounded-xl"><Lock className="w-5 h-5 text-warning-light" /></div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Locked / Suspended</p>
              <p className="text-2xl font-bold text-warning-light mt-1">{lockedUsers}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-white/[0.06] bg-surface-dark flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/10 rounded-xl"><Activity className="w-5 h-5 text-success-light" /></div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Sessions</p>
              <p className="text-2xl font-bold text-success-light mt-1">{users.reduce((acc, u) => acc + u.sessions, 0)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-4 border-b border-white/[0.06] pb-px">
        {[
          { id: 'directory', label: 'Global Directory', icon: Users },
          { id: 'access', label: 'Access Reviews', icon: ShieldAlert },
          { id: 'audit', label: 'Audit Logs', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white hover:border-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === 'directory' && (
          <div className="h-full max-h-[800px]">
            <SuperAdminUserPanel users={users} />
          </div>
        )}
        {activeTab === 'access' && (
          <Card className="border-white/[0.06] shadow-glass bg-surface-dark h-[500px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <ShieldAlert className="w-8 h-8 mx-auto mb-3 text-gray-600" />
              <p className="text-lg">No Pending Access Reviews</p>
              <p className="text-sm mt-1">Cross-tenant access privileges are currently up to date.</p>
            </div>
          </Card>
        )}
        {activeTab === 'audit' && (
          <Card className="border-white/[0.06] shadow-glass bg-surface-dark h-[500px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-3 text-gray-600" />
              <p className="text-lg">Global Audit Logs</p>
              <p className="text-sm mt-1">Select a user from the directory to view their specific audit trail.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
