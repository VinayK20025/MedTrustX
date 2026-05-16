'use client';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/store/ui.store';
import { ROUTES } from '@/utils/constants';
import {
  Search, Users, Stethoscope, Pill, Calendar, CreditCard, Shield, Settings,
  BarChart3, FileText, Heart, Thermometer, Siren, Video, Monitor, ArrowRight,
  Command, type LucideIcon,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  section: string;
  keywords?: string[];
}

const commandItems: CommandItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: ROUTES.DASHBOARD, section: 'Navigation' },
  { id: 'patients', label: 'Patients', icon: Users, href: ROUTES.PATIENTS, section: 'Navigation', keywords: ['mrn', 'patient'] },
  { id: 'clinical', label: 'Clinical', icon: Stethoscope, href: ROUTES.CLINICAL, section: 'Navigation' },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill, href: ROUTES.PHARMACY, section: 'Navigation', keywords: ['medicine', 'drug'] },
  { id: 'appointments', label: 'Appointments', icon: Calendar, href: ROUTES.APPOINTMENTS, section: 'Navigation', keywords: ['schedule', 'booking'] },
  { id: 'billing', label: 'Billing', icon: CreditCard, href: ROUTES.BILLING, section: 'Navigation', keywords: ['invoice', 'payment'] },
  { id: 'nursing', label: 'Nursing', icon: Heart, href: ROUTES.NURSING, section: 'Navigation' },
  { id: 'icu', label: 'ICU', icon: Thermometer, href: ROUTES.ICU, section: 'Navigation', keywords: ['critical', 'intensive'] },
  { id: 'er', label: 'Emergency', icon: Siren, href: ROUTES.ER, section: 'Navigation', keywords: ['accident', 'urgent'] },
  { id: 'telemedicine', label: 'Telemedicine', icon: Video, href: ROUTES.TELEMEDICINE, section: 'Navigation', keywords: ['video', 'call'] },
  { id: 'records', label: 'Medical Records', icon: FileText, href: ROUTES.RECORDS, section: 'Navigation', keywords: ['ehr', 'health record'] },
  { id: 'iam', label: 'IAM & ZTA', icon: Shield, href: ROUTES.IAM, section: 'Platform', keywords: ['security', 'access', 'zero trust'] },
  { id: 'monitoring', label: 'Monitoring', icon: Monitor, href: ROUTES.MONITORING, section: 'Platform', keywords: ['grafana', 'prometheus'] },
  { id: 'settings', label: 'Settings', icon: Settings, href: ROUTES.SETTINGS, section: 'System' },
];

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(!open); }
      if (e.key === 'Escape' && open) setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, setOpen]);

  // Focus input when opened
  useEffect(() => { if (open) { setQuery(''); setSelectedIndex(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);

  const filtered = useMemo(() => {
    if (!query) return commandItems;
    const q = query.toLowerCase();
    return commandItems.filter((item) =>
      item.label.toLowerCase().includes(q) ||
      item.keywords?.some((kw) => kw.includes(q)),
    );
  }, [query]);

  const handleSelect = useCallback((item: CommandItem) => {
    setOpen(false);
    router.push(item.href);
  }, [router, setOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[selectedIndex]) { handleSelect(filtered[selectedIndex]); }
  }, [filtered, selectedIndex, handleSelect]);

  if (!open) return null;

  const sections = [...new Set(filtered.map((i) => i.section))];

  return (
    <div className="fixed inset-0 z-modal flex items-start justify-center pt-[20vh]" role="dialog">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg bg-surface-light border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b border-white/[0.06]">
          <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, pages..."
            className="flex-1 py-3.5 bg-transparent text-white text-sm placeholder:text-gray-500 focus:outline-none"
          />
          <kbd className="text-2xs px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-600 font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">No results found</p>
          ) : (
            sections.map((section) => (
              <div key={section}>
                <p className="px-4 py-1.5 text-2xs text-gray-600 uppercase tracking-wider font-medium">{section}</p>
                {filtered.filter((i) => i.section === section).map((item) => {
                  const idx = filtered.indexOf(item);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors',
                        idx === selectedIndex ? 'bg-teal-500/10 text-teal-400' : 'text-gray-300 hover:bg-white/[0.04]',
                      )}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      <ArrowRight className="w-3 h-3 opacity-40" />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
