'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { Card, CardBody } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Edit, Mail, Phone, Building2, Shield, Calendar, MapPin, Stethoscope, IdCard } from 'lucide-react';
import { formatDate, timeAgo } from '@/utils/date';
import { formatPhone } from '@/utils/format';
import { isClinicalStaff, isAdmin } from '@/utils/permissions';
import type { UserProfile } from '../types/user.types';

interface ProfileCardProps {
  profile: UserProfile;
  onEdit?: () => void;
  className?: string;
}

export function ProfileCard({ profile, onEdit, className }: ProfileCardProps) {
  const roleLabel = profile.roles[0]?.replace(/_/g, ' ') ?? 'User';
  const isClinical = isClinicalStaff({ ...profile, fullName: '', permissions: [] } as any);

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Banner gradient */}
      <div className="h-24 bg-gradient-to-r from-primary-800 via-primary-700 to-teal-800 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h20v20H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M10%200v20M0%2010h20%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.03)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
      </div>

      <CardBody className="relative -mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar name={profile.fullName} src={profile.avatar} size="xl" status="online" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-2 sm:pt-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white">{profile.fullName}</h1>
              <Badge variant="info" size="sm">{roleLabel}</Badge>
              <Badge variant={profile.status === 'active' ? 'success' : 'danger'} size="sm" dot>
                {profile.status}
              </Badge>
            </div>
            {profile.designation && (
              <p className="text-sm text-gray-400 mt-0.5">{profile.designation}</p>
            )}
          </div>

          {/* Edit button */}
          {onEdit && (
            <Button variant="secondary" size="sm" leftIcon={<Edit className="w-4 h-4" />} onClick={onEdit}>
              Edit Profile
            </Button>
          )}
        </div>

        {/* Detail rows */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
          <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={profile.email} />
          <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={profile.phone ? formatPhone(profile.phone) : undefined} />
          <InfoRow icon={<Building2 className="w-4 h-4" />} label="Department" value={profile.department} />
          <InfoRow icon={<IdCard className="w-4 h-4" />} label="Employee ID" value={profile.employeeId} />
          {isClinical && profile.specialization && (
            <InfoRow icon={<Stethoscope className="w-4 h-4" />} label="Specialization" value={profile.specialization} />
          )}
          {isClinical && profile.licenseNumber && (
            <InfoRow icon={<Shield className="w-4 h-4" />} label="License #" value={profile.licenseNumber} />
          )}
          <InfoRow icon={<Calendar className="w-4 h-4" />} label="Joined" value={profile.joinedAt ? formatDate(profile.joinedAt) : undefined} />
          {profile.lastLoginAt && (
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Last Login" value={`${timeAgo(profile.lastLoginAt)}${profile.lastLoginIp ? ` • ${profile.lastLoginIp}` : ''}`} />
          )}
        </div>

        {/* Read-only metadata */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center gap-6 text-xs text-gray-600 flex-wrap">
          <span>User ID: <span className="font-mono text-gray-500">{profile.id}</span></span>
          <span>Tenant: <span className="text-gray-500">{profile.tenantId}</span></span>
          <span>MFA: <span className={profile.mfaEnabled ? 'text-success-light' : 'text-warning-light'}>{profile.mfaEnabled ? 'Enabled' : 'Disabled'}</span></span>
        </div>
      </CardBody>
    </Card>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-gray-600 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-2xs text-gray-600 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-300 truncate">{value ?? '—'}</p>
      </div>
    </div>
  );
}
