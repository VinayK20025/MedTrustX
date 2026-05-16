'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function TriageAssessmentForm() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  return (
    <Card className="border-indigo-500/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-indigo-500/10 px-5 py-4 flex items-center justify-between bg-indigo-500/5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Rapid Assessment</h3>
        </div>
        <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-500/30">
          AUTO-SCORE: PENDING
        </span>
      </CardHeader>
      <CardBody className="p-5 flex-1 flex flex-col gap-5 overflow-y-auto">
        
        {/* Rapid Vitals Entry */}
        <div>
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Quick Vitals</h4>
          <div className="grid grid-cols-4 gap-3">
             <input type="text" placeholder="HR" className="bg-surface-dark border border-white/10 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none text-center" />
             <input type="text" placeholder="BP" className="bg-surface-dark border border-white/10 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none text-center" />
             <input type="text" placeholder="SpO2" className="bg-surface-dark border border-white/10 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none text-center" />
             <input type="text" placeholder="Temp" className="bg-surface-dark border border-white/10 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none text-center" />
          </div>
        </div>

        {/* Symptoms / Chief Complaint */}
        <div>
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Assessment Notes</h4>
          <textarea 
            rows={3} 
            placeholder="Describe immediate clinical presentation..." 
            className="w-full bg-surface-dark border border-white/10 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none resize-none"
          />
        </div>

        {/* Categorization (CRITICAL STEP) */}
        <div>
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Assign Triage Category</h4>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setSelectedLevel('emergency')}
              className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${selectedLevel === 'emergency' ? 'border-emergency bg-emergency/10' : 'border-white/[0.06] hover:bg-white/[0.02]'}`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-5 h-5 ${selectedLevel === 'emergency' ? 'text-emergency-light' : 'text-gray-500'}`} />
                <div>
                  <span className={`text-sm font-bold block ${selectedLevel === 'emergency' ? 'text-emergency-light' : 'text-white'}`}>Level 1: Emergency</span>
                  <span className="text-[10px] text-gray-500">Life-threatening, immediate intervention</span>
                </div>
              </div>
              {selectedLevel === 'emergency' && <CheckCircle2 className="w-5 h-5 text-emergency-light" />}
            </button>
            
            <button 
              onClick={() => setSelectedLevel('urgent')}
              className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${selectedLevel === 'urgent' ? 'border-warning bg-warning/10' : 'border-white/[0.06] hover:bg-white/[0.02]'}`}>
              <div className="flex items-center gap-3">
                <Activity className={`w-5 h-5 ${selectedLevel === 'urgent' ? 'text-warning-light' : 'text-gray-500'}`} />
                <div>
                  <span className={`text-sm font-bold block ${selectedLevel === 'urgent' ? 'text-warning-light' : 'text-white'}`}>Level 2: Urgent</span>
                  <span className="text-[10px] text-gray-500">Potentially severe, needs rapid care</span>
                </div>
              </div>
              {selectedLevel === 'urgent' && <CheckCircle2 className="w-5 h-5 text-warning-light" />}
            </button>
            
            <button 
              onClick={() => setSelectedLevel('non-urgent')}
              className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${selectedLevel === 'non-urgent' ? 'border-success bg-success/10' : 'border-white/[0.06] hover:bg-white/[0.02]'}`}>
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-5 h-5 ${selectedLevel === 'non-urgent' ? 'text-success-light' : 'text-gray-500'}`} />
                <div>
                  <span className={`text-sm font-bold block ${selectedLevel === 'non-urgent' ? 'text-success-light' : 'text-white'}`}>Level 3: Non-Urgent</span>
                  <span className="text-[10px] text-gray-500">Stable, minor condition</span>
                </div>
              </div>
              {selectedLevel === 'non-urgent' && <CheckCircle2 className="w-5 h-5 text-success-light" />}
            </button>
          </div>
        </div>

        <Button className="w-full h-10 mt-auto bg-indigo-600 hover:bg-indigo-700" disabled={!selectedLevel}>
          Confirm Triage & Route Patient
        </Button>

      </CardBody>
    </Card>
  );
}
