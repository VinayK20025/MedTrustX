'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BookOpen, Search, Lock, Unlock, Shield } from 'lucide-react';

const mockFormulary = [
  { id: 'F-1', drug: 'Amoxicillin 500mg', category: 'Antibiotic', restriction: 'none', guidelines: 'First-line for respiratory infections', status: 'active' },
  { id: 'F-2', drug: 'Morphine Sulfate 10mg', category: 'Narcotic Analgesic', restriction: 'Schedule II', guidelines: 'Requires dual verification. Max 72hr initial supply.', status: 'restricted' },
  { id: 'F-3', drug: 'Vancomycin IV 1g', category: 'Antibiotic', restriction: 'ID Approval', guidelines: 'Requires infectious disease consult before dispensing.', status: 'restricted' },
  { id: 'F-4', drug: 'Atorvastatin 40mg', category: 'Statin', restriction: 'none', guidelines: 'Preferred formulary statin. Generic substitution permitted.', status: 'active' },
  { id: 'F-5', drug: 'Rituximab 500mg', category: 'Biologic', restriction: 'P&T Approval', guidelines: 'Cold-chain. Prior auth required. Oncology only.', status: 'restricted' },
];

export function PharmacyFormularyPanel() {
  const [search, setSearch] = useState('');
  const filtered = mockFormulary.filter(f => f.drug.toLowerCase().includes(search.toLowerCase()) || f.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Hospital Formulary"
        icon={<BookOpen className="w-5 h-5 text-teal-400" />}
        subtitle={`${mockFormulary.length} entries · ${mockFormulary.filter(f => f.status === 'restricted').length} restricted`}
      />
      <CardBody className="flex-1 flex flex-col gap-3 overflow-y-auto">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search formulary..."
            className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          {filtered.map(f => (
            <div key={f.id} className="p-3 rounded-lg border border-white/[0.06] bg-surface-dark hover:border-white/[0.12] transition-all">
              <div className="flex items-center gap-2">
                {f.status === 'restricted' ? <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" /> : <Unlock className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                <p className="text-sm font-semibold text-white flex-1">{f.drug}</p>
                <Badge variant={f.status === 'restricted' ? 'warning' : 'default'} size="sm">{f.category}</Badge>
              </div>
              {f.restriction !== 'none' && (
                <div className="mt-1.5 flex items-center gap-1 text-xs text-amber-300">
                  <Shield className="w-3 h-3" /> {f.restriction}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">{f.guidelines}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
