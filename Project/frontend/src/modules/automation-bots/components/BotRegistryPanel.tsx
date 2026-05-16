'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Bot, Pause, Play, AlertTriangle, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { AutomationBot } from '../types/automation-bots.types';

interface BotRegistryPanelProps {
  bots: AutomationBot[];
  activeBotId?: string;
  onSelectBot: (id: string) => void;
  onPauseBot: (id: string) => void;
}

const statusColors: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Paused: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Error: 'text-red-400 bg-red-500/10 border-red-500/30',
  Deploying: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
};

export const BotRegistryPanel: React.FC<BotRegistryPanelProps> = ({ bots, activeBotId, onSelectBot, onPauseBot }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Autonomous Agents"
        icon={<Bot className="w-4 h-4" />}
        action={<span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">{bots.length} Active</span>}
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-white/[0.04]">
          {bots.map(bot => (
            <div
              key={bot.id}
              onClick={() => onSelectBot(bot.id)}
              className={cn(
                "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                activeBotId === bot.id ? "bg-white/[0.04] border-l-indigo-500" : "border-l-transparent"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 mr-2">
                  <h4 className="text-sm font-medium text-white leading-snug">{bot.name}</h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{bot.id}</p>
                </div>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0", statusColors[bot.status])}>
                  {bot.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
                <div className="bg-black/20 rounded p-1.5 border border-white/5 flex flex-col justify-center">
                  <p className="text-[9px] text-gray-500 uppercase">Agent Type</p>
                  <p className="text-xs font-medium text-gray-300 mt-0.5 truncate flex items-center gap-1">
                    <Workflow className="w-3 h-3 text-indigo-400" /> {bot.type}
                  </p>
                </div>
                <div className="bg-black/20 rounded p-1.5 border border-white/5 flex flex-col justify-center">
                  <p className="text-[9px] text-gray-500 uppercase">Success Rate</p>
                  <p className={cn("text-xs font-mono mt-0.5", bot.successRate >= 99 ? "text-emerald-400" : "text-amber-400")}>
                    {bot.successRate}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">
                    Last Run: {new Date(bot.lastExecution).toLocaleTimeString()}
                  </span>
                </div>

                {bot.status === 'Active' ? (
                  <Button size="sm" variant="outline" className="h-6 px-2 text-[9px] text-amber-400 border-amber-500/30 hover:bg-amber-500/10" onClick={(e) => { e.stopPropagation(); onPauseBot(bot.id); }}>
                    <Pause className="w-2.5 h-2.5 mr-1" /> Pause Bot
                  </Button>
                ) : bot.status === 'Paused' ? (
                  <Button size="sm" variant="outline" className="h-6 px-2 text-[9px] text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" onClick={(e) => { e.stopPropagation(); }}>
                    <Play className="w-2.5 h-2.5 mr-1" /> Resume
                  </Button>
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
