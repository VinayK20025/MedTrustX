'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ValidationIssue, ProcessingLog } from '../types/processing.types';
import { AlertTriangle, Terminal, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { issues: ValidationIssue[]; logs: ProcessingLog[]; }

export function ProcessingValidationPanel({ issues, logs }: Props) {
  const errors = issues.filter(i => i.severity === 'Error');
  const warnings = issues.filter(i => i.severity === 'Warning');

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Validation Engine */}
      <Card className={cn("shadow-glass flex-[0.8] flex flex-col", errors.length > 0 ? "border-emergency/30" : warnings.length > 0 ? "border-warning/30" : "border-white/[0.06]")}>
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-[12px] font-bold tracking-widest text-amber-400">VALIDATION ENGINE</h3>
          </div>
          {issues.length > 0 && <span className={cn("text-[9px] px-2 py-0.5 rounded font-bold uppercase", errors.length > 0 ? "bg-emergency/20 text-emergency-light" : "bg-warning/20 text-warning-light")}>{issues.length} Issues</span>}
        </CardHeader>
        <CardBody className="p-0 flex-1 overflow-y-auto">
          {issues.length === 0 ? (
            <div className="p-4 flex items-center gap-2 text-success-light text-[12px] font-bold bg-success/5 h-full justify-center">
              <CheckCircle2 className="w-4 h-4" /> All checks passed
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {issues.map(i => (
                <div key={i.id} className={cn("p-3", i.severity === 'Error' ? "bg-emergency/[0.03]" : "bg-warning/[0.03]")}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", i.severity === 'Error' ? "text-emergency-light" : "text-warning-light")} />
                    <div>
                      <p className={cn("text-[11px] font-bold", i.severity === 'Error' ? "text-emergency-light" : "text-warning-light")}>{i.field}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{i.issue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Execution Logs */}
      <Card className="border-white/[0.06] shadow-glass flex-1 flex flex-col">
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-gray-400" />
          <h3 className="text-[12px] font-bold tracking-widest text-gray-400">EXECUTION LOGS</h3>
        </CardHeader>
        <CardBody className="p-0 flex-1 overflow-y-auto bg-black/40 font-mono">
          <div className="divide-y divide-white/[0.02]">
            {logs.map(log => (
              <div key={log.id} className="p-2.5 text-[10px] hover:bg-white/[0.02]">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                  <span className={cn("px-1 rounded", log.status === 'Success' ? "text-success-light" : log.status === 'Failed' ? "text-emergency-light" : "text-warning-light")}>{log.status}</span>
                </div>
                <p className="text-gray-300">
                  <span className="text-blue-300 mr-2">{log.taskId}</span>
                  {log.action}
                </p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
