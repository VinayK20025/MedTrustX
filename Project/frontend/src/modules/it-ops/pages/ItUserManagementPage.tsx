'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Search, UserPlus, KeyRound, ShieldAlert, CheckCircle2, XCircle, MoreVertical, Building2, UserX } from 'lucide-react';
import { cn } from '@/utils/cn';

// Mock data to simulate IT User Management API response
const mockUsers = [
  { id: 'usr-001', name: 'Dr. Sarah Chen', email: 'schen@medtrustx.com', department: 'Cardiology', role: 'Surgeon', status: 'active', lastSync: '2026-05-12T04:30:00Z', adLinked: true },
  { id: 'usr-002', name: 'James Wilson', email: 'jwilson@medtrustx.com', department: 'IT', role: 'System Admin', status: 'active', lastSync: '2026-05-12T04:30:00Z', adLinked: true },
  { id: 'usr-003', name: 'Emily Davis', email: 'edavis@medtrustx.com', department: 'Nursing', role: 'ICU Nurse', status: 'locked', lastSync: '2026-05-11T14:20:00Z', adLinked: true },
  { id: 'usr-004', name: 'Michael Chang', email: 'mchang@medtrustx.com', department: 'External', role: 'Vendor', status: 'pending', lastSync: null, adLinked: false },
  { id: 'usr-005', name: 'Dr. Robert Smith', email: 'rsmith@medtrustx.com', department: 'Neurology', role: 'HOD', status: 'active', lastSync: '2026-05-12T04:30:00Z', adLinked: true },
];

export function ItUserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = mockUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">IT User Management & RBAC</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage Active Directory synchronization, credentials, and access groups</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300">
            <ShieldAlert className="w-4 h-4 mr-2" /> Global Sync
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-500 text-white border-none">
            <UserPlus className="w-4 h-4 mr-2" /> Provision User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-white/[0.06] bg-surface-dark flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Accounts</p>
            <p className="text-2xl font-bold text-white mt-1">14,208</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl"><UserPlus className="w-5 h-5 text-blue-400" /></div>
        </Card>
        <Card className="p-5 border-white/[0.06] bg-surface-dark flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">AD Synced</p>
            <p className="text-2xl font-bold text-success-light mt-1">13,950</p>
          </div>
          <div className="p-3 bg-success/10 rounded-xl"><CheckCircle2 className="w-5 h-5 text-success-light" /></div>
        </Card>
        <Card className="p-5 border-white/[0.06] bg-surface-dark flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Locked Accounts</p>
            <p className="text-2xl font-bold text-emergency-light mt-1">42</p>
          </div>
          <div className="p-3 bg-emergency/10 rounded-xl"><UserX className="w-5 h-5 text-emergency-light" /></div>
        </Card>
        <Card className="p-5 border-white/[0.06] bg-surface-dark flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Pending Resets</p>
            <p className="text-2xl font-bold text-warning-light mt-1">18</p>
          </div>
          <div className="p-3 bg-warning/10 rounded-xl"><KeyRound className="w-5 h-5 text-warning-light" /></div>
        </Card>
      </div>

      <Card className="flex-1 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col">
        <div className="p-4 border-b border-white/[0.04] bg-surface-light rounded-t-xl flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or ID..." 
              className="pl-10 bg-black/20 border-white/10 focus:border-teal-500 text-white"
            />
          </div>
          <div className="flex items-center gap-2 bg-black/20 rounded-lg p-1 border border-white/5">
            {['all', 'active', 'locked', 'pending'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-4 py-1.5 text-xs font-medium rounded-md capitalize transition-colors",
                  statusFilter === s ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-black/20 sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="py-4 pl-6 text-gray-400 font-semibold uppercase text-xs tracking-wider">User Account</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">Department & Role</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">Status</th>
                <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-xs tracking-wider">AD Integration</th>
                <th className="py-4 pr-6 text-gray-400 font-semibold uppercase text-xs tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-white/5 flex items-center justify-center">
                        <span className="text-sm font-bold text-teal-300">{user.name.split(' ').map(n=>n[0]).join('').substring(0,2)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-300">{user.department}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className={`border-none capitalize ${
                      user.status === 'active' ? 'text-success-light bg-success/10' :
                      user.status === 'locked' ? 'text-emergency-light bg-emergency/10' :
                      'text-warning-light bg-warning/10'
                    }`}>{user.status}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {user.adLinked ? <CheckCircle2 className="w-4 h-4 text-success-light" /> : <XCircle className="w-4 h-4 text-gray-500" />}
                      <div>
                        <p className="text-xs text-gray-300">{user.adLinked ? 'Synced' : 'Local Only'}</p>
                        {user.lastSync && <p className="text-[10px] text-gray-500">Last: {new Date(user.lastSync).toLocaleTimeString()}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="h-8 text-xs border-white/10 text-gray-300 hover:bg-white/5">
                        <KeyRound className="w-3.5 h-3.5 mr-1" /> Reset Pwd
                      </Button>
                      {user.status === 'locked' && (
                        <Button size="sm" variant="outline" className="h-8 text-xs border-success/30 text-success-light hover:bg-success/10">
                          Unlock
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 flex items-center justify-center text-gray-400 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">No users found matching criteria</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
