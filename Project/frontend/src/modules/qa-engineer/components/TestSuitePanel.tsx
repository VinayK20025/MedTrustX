'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { FlaskConical, CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { TestSuite, TestType } from '../types/qa.types';

const typeColors: Record<TestType, string> = {
  Functional: 'bg-indigo-500/20 text-indigo-300',
  Security: 'bg-rose-500/20 text-rose-300',
  Performance: 'bg-amber-500/20 text-amber-300',
  Regression: 'bg-purple-500/20 text-purple-300',
  E2E: 'bg-teal-500/20 text-teal-300',
  Unit: 'bg-blue-500/20 text-blue-300',
};

interface TestSuitePanelProps {
  suites: TestSuite[];
  activeSuiteId?: string;
  onSelectSuite?: (id: string) => void;
  onRunSuite: (id: string) => void;
}

export const TestSuitePanel: React.FC<TestSuitePanelProps> = ({ suites, activeSuiteId, onSelectSuite, onRunSuite }) => {
  const failed = suites.filter(s => s.status === 'Failed').length;

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Test Suites"
        icon={<FlaskConical className="w-4 h-4" />}
        action={
          failed > 0
            ? <span className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">{failed} failing</span>
            : <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">All green</span>
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {suites.map(suite => {
            const passRate = suite.totalCases > 0 ? Math.round((suite.passed / suite.totalCases) * 100) : 0;
            return (
              <div
                key={suite.id}
                onClick={() => onSelectSuite?.(suite.id)}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                  activeSuiteId === suite.id ? "bg-white/[0.04] border-l-indigo-500" :
                  suite.status === 'Failed' ? "border-l-rose-500" :
                  suite.status === 'Blocked' ? "border-l-amber-500" : "border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 mr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold", typeColors[suite.type])}>{suite.type}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{suite.module}</span>
                    </div>
                    <h4 className="text-sm font-medium text-white leading-snug">{suite.name}</h4>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {suite.status === 'Passed' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> :
                     suite.status === 'Failed' ? <XCircle className="w-3.5 h-3.5 text-rose-400" /> :
                     suite.status === 'Running' ? <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" /> :
                     <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />}
                    <span className={cn("text-[10px] font-bold",
                      suite.status === 'Passed' ? "text-emerald-400" :
                      suite.status === 'Failed' ? "text-rose-400" :
                      suite.status === 'Running' ? "text-indigo-400" : "text-amber-400"
                    )}>{suite.status}</span>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-gray-500">{suite.passed}/{suite.totalCases} passed</span>
                    <span className={cn("font-bold", passRate === 100 ? "text-emerald-400" : passRate >= 90 ? "text-amber-400" : "text-rose-400")}>{passRate}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", passRate === 100 ? "bg-emerald-500" : passRate >= 90 ? "bg-amber-500" : "bg-rose-500")}
                      style={{ width: `${passRate}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">Coverage: <span className="text-white">{suite.coverage}%</span></span>
                  <Button size="sm" variant="outline" className="text-[10px] border-indigo-500/20 text-indigo-400 h-6 px-2"
                    onClick={(e) => { e.stopPropagation(); onRunSuite(suite.id); }}>
                    <PlayCircle className="w-3 h-3 mr-0.5" />Run
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
