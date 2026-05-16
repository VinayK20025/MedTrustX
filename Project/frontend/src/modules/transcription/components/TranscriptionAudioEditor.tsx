'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ActiveTranscription } from '../types/transcription.types';
import { useSubmitTranscription } from '../hooks/useTranscriptionAnalytics';
import { Mic, Play, Pause, SkipBack, SkipForward, Save, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { active?: ActiveTranscription; }

export function TranscriptionAudioEditor({ active }: Props) {
  const [content, setContent] = useState(active?.content || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30); // Mock progress percentage
  const { mutate: submit, isPending } = useSubmitTranscription();

  useEffect(() => {
    if (active) setContent(active.content);
  }, [active]);

  if (!active) return null;

  return (
    <Card className="border-blue-500/30 shadow-glass bg-[#080b14] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
      
      {/* Audio Player Header */}
      <CardHeader className="border-b border-white/[0.04] p-4 flex flex-col gap-3 bg-black/40">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Mic className="w-4 h-4 text-blue-400" />
             <span className="text-[11px] font-mono text-gray-400">Dictation: {active.dictationId}</span>
           </div>
           <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-bold uppercase tracking-widest">Speed: 1.2x</span>
         </div>
         
         {/* Player Controls */}
         <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-4">
               <Button size="sm" className="h-8 w-8 p-0 rounded-full bg-white/5 hover:bg-white/10 text-gray-300"><SkipBack className="w-4 h-4"/></Button>
               <Button size="sm" onClick={() => setIsPlaying(!isPlaying)} className={cn("h-10 w-10 p-0 rounded-full", isPlaying ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-white/10 hover:bg-white/20 text-white")}>
                 {isPlaying ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5 ml-1"/>}
               </Button>
               <Button size="sm" className="h-8 w-8 p-0 rounded-full bg-white/5 hover:bg-white/10 text-gray-300"><SkipForward className="w-4 h-4"/></Button>
            </div>
            {/* Timeline */}
            <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500">
              <span>01:45</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer">
                 <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <span>05:15</span>
            </div>
         </div>
      </CardHeader>

      {/* Editor Body */}
      <CardBody className="p-0 flex-1 flex flex-col">
        <div className="px-5 py-2 flex justify-between text-[10px] font-mono text-gray-500 bg-white/[0.02] border-b border-white/[0.02]">
           <span className="flex items-center gap-1"><Save className="w-3 h-3 text-success-light"/> Auto-saved just now</span>
           <span>Words: {content.split(/\s+/).filter(w => w.length > 0).length}</span>
        </div>
        
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 w-full p-5 bg-transparent border-none text-[14px] text-gray-200 leading-relaxed font-mono focus:outline-none resize-none"
          placeholder="Start typing transcription here..."
          spellCheck="false"
        />

        {/* Action Bar */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center">
          <div className="text-[11px] text-gray-400 font-mono">
            Shortcuts: Alt+← (Rewind) | Ctrl+Space (Play/Pause)
          </div>
          <Button 
            disabled={isPending} 
            onClick={() => submit(active.id)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-8"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            SUBMIT TO MRO
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
