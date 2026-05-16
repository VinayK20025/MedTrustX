'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Scan, TestTube, GitMerge, CheckCircle, Search, AlertCircle, Droplet, Box } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { TechnicianData } from '../types/blood-bank-tech.types';

interface LabWorkspaceProps {
  data: TechnicianData;
  onRecordResult: (id: string, result: 'Negative' | 'Positive' | 'Invalid') => void;
  onPerformCrossmatch: (id: string, unitIds: string[]) => void;
}

export const LabWorkspace: React.FC<LabWorkspaceProps> = ({ data, onRecordResult, onPerformCrossmatch }) => {
  const [activeTab, setActiveTab] = useState('screening');
  const [scanInput, setScanInput] = useState('');

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader className="border-b border-white/[0.06] pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
            <TestTube className="w-5 h-5 text-amber-400" />
            Lab Execution Workspace
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Input 
                placeholder="Scan Barcode / Enter ID" 
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="pl-9 bg-surface border-white/10 text-sm h-9"
              />
              <Scan className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <Button size="sm" variant="primary" className="bg-teal-600 hover:bg-teal-500 text-white h-9">
              Search
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-surface border border-white/10 p-1 mb-6">
            <TabsTrigger value="screening" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <TestTube className="w-4 h-4 mr-2" />
              Screening
            </TabsTrigger>
            <TabsTrigger value="crossmatch" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
              <GitMerge className="w-4 h-4 mr-2" />
              Crossmatching
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Box className="w-4 h-4 mr-2" />
              Inventory Storage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="screening" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {data.screenings.map(scr => (
                <div key={scr.id} className="bg-surface rounded-xl border border-white/10 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">Unit {scr.unitId}</span>
                      <span className="text-[10px] uppercase bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400">Test: {scr.testType}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Status: <span className={scr.result === 'Pending' ? 'text-amber-400' : scr.result === 'Negative' ? 'text-emerald-400' : 'text-rose-400'}>{scr.result}</span>
                    </div>
                  </div>
                  {scr.result === 'Pending' ? (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" onClick={() => onRecordResult(scr.id, 'Negative')}>
                        Negative
                      </Button>
                      <Button size="sm" variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10" onClick={() => onRecordResult(scr.id, 'Positive')}>
                        Positive
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Completed
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="crossmatch" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {data.crossmatches.map(xm => (
                <div key={xm.id} className="bg-surface rounded-xl border border-white/10 p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-white">{xm.patientName} <span className="text-xs text-gray-500">({xm.patientId})</span></h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">{xm.patientBloodGroup}</span>
                        <span className="text-xs text-gray-400">Req: {xm.unitsRequired} Units {xm.requestedComponent}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-md border border-indigo-500/20">{xm.status}</span>
                  </div>

                  {xm.status === 'Processing' ? (
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Input placeholder="Scan unit barcode to verify match..." className="h-8 text-xs bg-surface border-white/10" />
                        <Button size="sm" variant="primary" className="bg-indigo-600 hover:bg-indigo-500 text-white h-8" onClick={() => onPerformCrossmatch(xm.id, ['U-SCAN-01'])}>
                          Verify Match
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-2 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Match Confirmed</span>
                      <span className="text-xs ml-auto">Units: {xm.matchedUnits.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.units.map(unit => (
                <div key={unit.id} className="bg-surface rounded-xl border border-white/10 p-4 flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-rose-400">{unit.bloodGroup}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-white truncate">{unit.componentType} - {unit.volumeML}mL</h4>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{unit.status}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate">ID: {unit.id}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-gray-300">Loc: {unit.location}</span>
                      <span className="text-[10px] text-gray-500">Exp: {new Date(unit.expiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

        </Tabs>
      </CardBody>
    </Card>
  );
};
