'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
      <a href="/dashboard" className="text-gray-500 hover:text-gray-300 transition-colors p-1">
        <Home className="w-3.5 h-3.5" />
      </a>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
          {item.href ? (
            <a href={item.href} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
              {item.icon}
              <span>{item.label}</span>
            </a>
          ) : (
            <span className="text-gray-300 font-medium flex items-center gap-1">
              {item.icon}
              <span>{item.label}</span>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
