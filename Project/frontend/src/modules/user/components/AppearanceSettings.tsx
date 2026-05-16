'use client';
import React from 'react';
import { SettingsSection, SettingsRow } from './SettingsSection';
import { ToggleSwitch } from './ToggleSwitch';
import { Palette, Sun, Moon, Monitor, Minus, Equal, Menu } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { AppearanceSettings as AppearanceSettingsType, AccessibilitySettings as AccessibilitySettingsType } from '../types/user.types';

/* ══════════════════════════════════════════════════════════
   Appearance Settings
   ══════════════════════════════════════════════════════════ */

interface AppearanceSettingsProps {
  settings: AppearanceSettingsType;
  onUpdate: (data: Partial<AppearanceSettingsType>) => void;
}

const themeOptions: { value: AppearanceSettingsType['theme']; label: string; icon: React.ReactNode }[] = [
  { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
];

const densityOptions: { value: AppearanceSettingsType['density']; label: string; icon: React.ReactNode }[] = [
  { value: 'compact', label: 'Compact', icon: <Minus className="w-4 h-4" /> },
  { value: 'comfortable', label: 'Comfortable', icon: <Equal className="w-4 h-4" /> },
  { value: 'spacious', label: 'Spacious', icon: <Menu className="w-4 h-4" /> },
];

export function AppearanceSettingsPanel({ settings, onUpdate }: AppearanceSettingsProps) {
  return (
    <div className="space-y-6">
      <SettingsSection title="Theme" description="Choose your preferred color scheme" icon={<Palette className="w-4 h-4" />}>
        <div className="grid grid-cols-3 gap-3 py-2">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdate({ theme: opt.value })}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200',
                settings.theme === opt.value
                  ? 'bg-teal-500/10 border-teal-500/40 text-teal-400'
                  : 'bg-white/[0.02] border-white/[0.08] text-gray-400 hover:border-white/[0.16] hover:text-white',
              )}
            >
              {opt.icon}
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Density" description="Adjust the spacing and size of UI elements">
        <div className="grid grid-cols-3 gap-3 py-2">
          {densityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdate({ density: opt.value })}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200',
                settings.density === opt.value
                  ? 'bg-teal-500/10 border-teal-500/40 text-teal-400'
                  : 'bg-white/[0.02] border-white/[0.08] text-gray-400 hover:border-white/[0.16] hover:text-white',
              )}
            >
              {opt.icon}
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Font Scale" description="Adjust the base font size">
        <div className="py-2 max-w-sm">
          <input
            type="range"
            min={0.8}
            max={1.4}
            step={0.1}
            value={settings.fontScale}
            onChange={(e) => onUpdate({ fontScale: parseFloat(e.target.value) })}
            className="w-full h-2 bg-white/[0.08] rounded-full appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Small</span>
            <span className="text-teal-400 font-medium">{Math.round(settings.fontScale * 100)}%</span>
            <span>Large</span>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Accessibility Settings
   ══════════════════════════════════════════════════════════ */

interface AccessibilitySettingsProps {
  settings: AccessibilitySettingsType;
  onUpdate: (data: Partial<AccessibilitySettingsType>) => void;
}

export function AccessibilitySettingsPanel({ settings, onUpdate }: AccessibilitySettingsProps) {
  return (
    <SettingsSection
      title="Accessibility"
      description="Configure accessibility features for improved usability"
    >
      <div className="divide-y divide-white/[0.04]">
        <ToggleSwitch
          label="High Contrast Mode"
          description="Increase contrast for better visibility"
          checked={settings.highContrast}
          onChange={(v) => onUpdate({ highContrast: v })}
        />
        <ToggleSwitch
          label="Reduced Motion"
          description="Minimize animations and transitions"
          checked={settings.reducedMotion}
          onChange={(v) => onUpdate({ reducedMotion: v })}
        />
        <ToggleSwitch
          label="Screen Reader Mode"
          description="Optimize content for screen readers (ARIA enhancements)"
          checked={settings.screenReaderMode}
          onChange={(v) => onUpdate({ screenReaderMode: v })}
        />
        <ToggleSwitch
          label="Enhanced Focus Indicators"
          description="Show stronger focus outlines for keyboard navigation"
          checked={settings.focusIndicators}
          onChange={(v) => onUpdate({ focusIndicators: v })}
        />
        <div className="py-3">
          <p className="text-sm font-medium text-gray-200 mb-3">Font Size Increase</p>
          <div className="flex items-center gap-3">
            {[0, 1, 2, 3, 4].map((step) => (
              <button
                key={step}
                onClick={() => onUpdate({ fontSizeIncrease: step })}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all border',
                  settings.fontSizeIncrease === step
                    ? 'bg-teal-500/15 border-teal-500/40 text-teal-400'
                    : 'bg-white/[0.02] border-white/[0.08] text-gray-500 hover:text-white hover:border-white/[0.16]',
                )}
              >
                {step === 0 ? 'A' : `A${'⁺'.repeat(step)}`}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">Step {settings.fontSizeIncrease}: {settings.fontSizeIncrease === 0 ? 'Default' : `+${settings.fontSizeIncrease * 2}px`}</p>
        </div>
      </div>
    </SettingsSection>
  );
}
