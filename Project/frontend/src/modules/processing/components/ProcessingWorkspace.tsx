'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ProcessingTask } from '../types/processing.types';
import { useSubmitTask } from '../hooks/useProcessingAnalytics';
import { Keyboard, Send, Save, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { task?: ProcessingTask; }

export function ProcessingWorkspace({ task }: Props) {
  const { mutate: submit, isPending } = useSubmitTask();
  const [localData, setLocalData] = useState<Record<string, any>>({});

  // Reset local data when task changes
  React.useEffect(() => { if (task) setLocalData(task.formData); }, [task]);

  if (!task) return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col items-center justify-center">
      <Keyboard className="w-8 h-8 text-gray-600 mb-3" />
      <p className="text-gray-500 text-[13px] mb-1">Select a task from the execution queue</p>
      <p className="text-gray-600 text-[10px] font-mono border border-white/5 bg-black/20 px-2 py-1 rounded">Alt + ↓ to focus next</p>
    </Card>
  );

  const hasBlockingErrors = task.validationIssues.some(v => v.severity === 'Error');
  const isBlocked = task.status === 'Blocked';

  return (
    <Card className="border-blue-500/25 shadow-glass bg-[#030612] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />

      {/* Header */}
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex justify-between items-start">
        <div>
          <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
            {task.type}
            {task.priority === 'Critical' && <span className="text-[9px] bg-emergency/20 text-emergency-light border border-emergency/30 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Critical</span>}
          </h3>
          <span className="text-[11px] text-gray-500 font-mono mt-1 block">
            {task.referenceId} • Patient: {task.patientName}
          </span>
        </div>
        <div className="flex gap-2">
           <span className="text-[9px] font-mono bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-400 flex items-center gap-1.5"><Keyboard className="w-3 h-3" /> Ctrl + S to Save</span>
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto flex flex-col mt-2">
        <div className="flex-1 space-y-5">
          
          {/* Status Banner */}
          {isBlocked && (
            <div className="bg-emergency/10 border border-emergency/20 rounded-xl p-3 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-emergency-light shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[12px] font-bold text-emergency-light uppercase tracking-widest">Execution Blocked</h4>
                <p className="text-[11px] text-gray-300 mt-0.5">Please review the validation panel on the right. Errors must be resolved before submission.</p>
              </div>
            </div>
          )}

          {/* Documents Quick View (if any) */}
          {task.requiredDocuments.length > 0 && (
            <div className="flex gap-2 mb-4">
              {task.requiredDocuments.map((doc, i) => (
                <div key={i} className={cn("px-3 py-1.5 rounded border text-[10px] font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity", 
                  doc.status === 'Missing' ? "bg-warning/10 border-warning/20 text-warning-light" : "bg-white/5 border-white/10 text-gray-300"
                )}>
                  <FileText className="w-3 h-3" /> {doc.name}
                  {doc.status === 'Uploaded' && <CheckCircle2 className="w-3 h-3 text-success-light ml-1" />}
                </div>
              ))}
            </div>
          )}

          {/* High-Speed Data Entry Form */}
          <div className="bg-white/[0.015] border border-white/5 rounded-xl p-5">
             <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Data Form</h4>
             <div className="grid grid-cols-2 gap-x-5 gap-y-4">
               {Object.entries(localData).map(([key, value]) => {
                 const issue = task.validationIssues.find(v => v.field === key);
                 return (
                   <div key={key} className="flex flex-col gap-1.5">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{key}</label>
                     <input 
                       type={typeof value === 'number' ? 'number' : 'text'}
                       className={cn("w-full bg-black/40 border rounded py-2 px-3 text-[12px] text-white focus:outline-none focus:border-blue-500/50 font-mono transition-colors", 
                         issue ? (issue.severity === 'Error' ? "border-emergency/50 bg-emergency/[0.02]" : "border-warning/50 bg-warning/[0.02]") : "border-white/10"
                       )}
                       value={value as string | number}
                       onChange={(e) => setLocalData({...localData, [key]: e.target.value})}
                     />
                     {issue && <span className={cn("text-[9px] mt-0.5", issue.severity === 'Error' ? "text-emergency-light" : "text-warning-light")}>{issue.issue}</span>}
                   </div>
                 );
               })}
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-white/5 mt-4 flex gap-3">
          <Button className="flex-1 h-11 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-[12px] border border-white/10" leftIcon={<Save className="w-4 h-4" />}>Save Draft</Button>
          <Button disabled={hasBlockingErrors || isBlocked || isPending} onClick={() => submit({ taskId: task.id, data: localData })}
            className={cn("flex-[2] h-11 font-bold text-[13px]", (hasBlockingErrors || isBlocked) ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white")}
            leftIcon={<Send className="w-4 h-4" />}>
            Submit & Next <span className="ml-2 px-1.5 py-0.5 bg-black/20 rounded text-[9px] border border-black/10">Alt+Enter</span>
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
