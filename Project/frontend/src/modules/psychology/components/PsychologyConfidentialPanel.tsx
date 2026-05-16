'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUnlockConfidentialVault } from '../hooks/usePsychologyAnalytics';
import { Lock, Unlock, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { unreadAlerts: number; }

export function PsychologyConfidentialPanel({ unreadAlerts }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const { mutate: unlock, isError } = useUnlockConfidentialVault();

  const handleUnlock = () => {
    unlock(pin, {
      onSuccess: () => setUnlocked(true),
      onError: () => setPin(''),
    });
  };

  return (
    <Card className={cn("shadow-glass h-full flex flex-col bg-surface-dark border-white/[0.06]", unlocked ? 'border-success/30' : 'border-purple-500/30')}>
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg", unlocked ? "bg-success/15" : "bg-purple-500/15")}>
            {unlocked ? <Unlock className="w-4 h-4 text-success-light" /> : <Lock className="w-4 h-4 text-purple-400" />}
          </div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Confidential Vault</h3>
        </div>
      </CardHeader>

      <CardBody className="p-6 flex-1 flex flex-col items-center justify-center text-center">
        {!unlocked ? (
          <div className="max-w-[200px] w-full">
            <Lock className="w-12 h-12 text-purple-500/50 mx-auto mb-4" />
            <p className="text-[11px] text-gray-400 mb-4">Enter 4-digit PIN to decrypt private psychotherapy notes. (Hint: 1234)</p>
            <input 
              type="password" 
              value={pin} 
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              className="w-full bg-surface-light border border-white/10 rounded-lg p-2 text-center text-white tracking-[1em] mb-3 focus:outline-none focus:border-purple-500"
            />
            {isError && <p className="text-[10px] text-emergency-light mb-3">Invalid PIN. Access denied.</p>}
            <Button className="w-full bg-purple-600 hover:bg-purple-500 border-none font-bold" onClick={handleUnlock}>
              Decrypt Vault
            </Button>
          </div>
        ) : (
          <div className="w-full text-left">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.04]">
               <span className="text-success-light text-[11px] font-bold flex items-center gap-1"><Unlock className="w-3 h-3"/> Vault Decrypted</span>
               <Button size="xs" variant="ghost" onClick={() => setUnlocked(false)} className="text-gray-400 h-6">Lock</Button>
            </div>
            <div className="p-4 bg-surface-light rounded-xl border border-white/[0.04] relative group">
               <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded font-mono"><ShieldAlert className="w-2.5 h-2.5"/> HIPAA RESTRICTED</span>
               <p className="text-[10px] text-gray-500 mb-1">PAT-PSY-02 | 2026-04-20</p>
               <p className="text-[11px] text-gray-300 italic">"Client disclosed severe childhood trauma related to the accident. Expressed significant guilt and shame. This requires very delicate pacing in EMDR sessions moving forward. High risk of dissociation."</p>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
