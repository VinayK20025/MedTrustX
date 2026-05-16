'use client';
import React from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function ChartCard({ title, subtitle, action, children, className, bodyClassName }: ChartCardProps) {
  return (
    <Card className={cn('border-white/[0.06] shadow-glass bg-surface-light flex flex-col', className)}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04]">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <CardBody className={cn('p-6 flex-1 min-h-[300px]', bodyClassName)}>
        {children}
      </CardBody>
    </Card>
  );
}
