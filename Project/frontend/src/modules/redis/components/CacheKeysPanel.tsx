import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useRedis } from '../hooks/useRedis';
import type { CacheKey } from '../types/redis.types';

export const CacheKeysPanel: React.FC = () => {
  const { useCacheKeys } = useRedis();
  const { data: response, isLoading } = useCacheKeys();

  const keys = response?.data || [
    { id: 'ck-1', cache_key: 'config:global:feature-flags', value: { new_ui: true, beta_access: false }, expires_at: null },
    { id: 'ck-2', cache_key: 'auth:jwt:u-889', value: { token_hash: 'abc123xyz' }, expires_at: '2026-05-03T14:00:00Z' },
    { id: 'ck-3', cache_key: 'dashboard:stats:hourly', value: { total_req: 1450, avg_latency_ms: 45 }, expires_at: '2026-05-02T15:00:00Z' },
  ];

  if (isLoading) return <div>Loading cache keys...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Cache Registry" />
      <CardBody>
        <div className="space-y-3">
          {keys.map((ck: CacheKey) => (
            <div key={ck.id} className="p-3 border border-white/10 rounded-lg bg-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-blue-400 break-all">{ck.cache_key}</span>
                {ck.expires_at ? (
                  <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded">Expires: {new Date(ck.expires_at).toLocaleTimeString()}</span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">Persistent</span>
                )}
              </div>
              <pre className="text-[10px] text-gray-400 font-mono bg-black/40 p-2 rounded m-0 overflow-x-auto">
                {JSON.stringify(ck.value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
