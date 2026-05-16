'use client';
import React, { useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Camera, Trash2, Upload } from 'lucide-react';

interface AvatarUploadProps {
  name: string;
  currentUrl?: string | null;
  onUpload: (file: File) => void;
  onRemove?: () => void;
  uploading?: boolean;
  size?: 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = { md: 'w-20 h-20', lg: 'w-28 h-28', xl: 'w-36 h-36' };
const iconSizeMap = { md: 'w-8 h-8', lg: 'w-10 h-10', xl: 'w-12 h-12' };

export function AvatarUpload({ name, currentUrl, onUpload, onRemove, uploading, size = 'lg', className }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB max

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    onUpload(file);
  };

  const displayUrl = preview ?? currentUrl;

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Avatar with overlay */}
      <div className="relative group">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={name}
            className={cn('rounded-full object-cover ring-4 ring-white/[0.06]', sizeMap[size])}
          />
        ) : (
          <div className={cn('rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-teal-400 to-teal-600 ring-4 ring-white/[0.06] text-2xl', sizeMap[size])}>
            {name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        )}

        {/* Hover overlay */}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          aria-label="Change photo"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload avatar"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="xs"
          leftIcon={<Upload className="w-3 h-3" />}
          onClick={() => inputRef.current?.click()}
          loading={uploading}
        >
          Upload
        </Button>
        {currentUrl && onRemove && (
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<Trash2 className="w-3 h-3" />}
            onClick={() => { setPreview(null); onRemove(); }}
            className="text-gray-500 hover:text-emergency-light"
          >
            Remove
          </Button>
        )}
      </div>
      <p className="text-2xs text-gray-600">JPG, PNG or WebP. Max 5MB.</p>
    </div>
  );
}
