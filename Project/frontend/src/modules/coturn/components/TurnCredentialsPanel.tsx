import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useCoturn } from '../hooks/useCoturn';
import type { TurnCredential } from '../types/coturn.types';

export const TurnCredentialsPanel: React.FC = () => {
  const { useCredentials } = useCoturn();
  const { data: response, isLoading } = useCredentials();

  const credentials = response?.data || [
    { id: 'cred-1', username: 'telemed-usr-881', credential: '***', expires_at: '2026-05-02T15:00:00Z' },
    { id: 'cred-2', username: 'jitsi-bridge-01', credential: '***', expires_at: '2026-05-03T00:00:00Z' },
    { id: 'cred-3', username: 'device-cam-9a', credential: '***', expires_at: '2026-05-02T14:30:00Z' },
  ];

  if (isLoading) return <div>Loading credentials...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Ephemeral TURN Credentials" />
      <CardBody>
        <div className="space-y-3">
          {credentials.map((cred: TurnCredential) => (
            <div key={cred.id} className="p-3 border border-white/10 rounded-lg bg-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-gray-200">{cred.username}</span>
                <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded">
                  Expires: {new Date(cred.expires_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                <span className="font-mono text-xs text-gray-500 tracking-widest">{cred.credential}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
