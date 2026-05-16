import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useRedis } from '../hooks/useRedis';
import type { RateLimit } from '../types/redis.types';

export const RateLimitsPanel: React.FC = () => {
  const { useRateLimits } = useRedis();
  const { data: response, isLoading } = useRateLimits();

  const limits = response?.data || [
    { id: 'rl-1', key: 'ratelimit:api:/v1/clinical:10.0.1.5', request_count: 85, window_start: '2026-05-02T13:40:00Z' },
    { id: 'rl-2', key: 'ratelimit:api:/v1/auth:10.0.4.12', request_count: 3, window_start: '2026-05-02T13:40:00Z' },
    { id: 'rl-3', key: 'ratelimit:api:/v1/reports:10.0.8.99', request_count: 998, window_start: '2026-05-02T13:00:00Z' },
  ];

  if (isLoading) return <div>Loading rate limits...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="API Rate Limit States" />
      <CardBody>
        <div className="space-y-4">
          {limits.map((rl: RateLimit) => {
            const isHigh = rl.request_count > 800; // Mock threshold
            return (
              <div key={rl.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-amber-400 break-all">{rl.key}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isHigh ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {rl.request_count} REQ
                  </span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-1.5 mt-1">
                  <div 
                    className={`h-1.5 rounded-full ${isHigh ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min((rl.request_count / 1000) * 100, 100)}%` }} 
                  />
                </div>
                <span className="text-[10px] text-gray-500 font-mono self-end">Window Start: {new Date(rl.window_start).toLocaleTimeString()}</span>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
