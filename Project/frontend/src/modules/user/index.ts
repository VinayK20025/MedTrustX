/* ── User Module — Cross-Role Global Module ──────────── */

// Pages
export { ProfilePage } from './pages/ProfilePage';
export { SettingsPage } from './pages/SettingsPage';
export { SecurityPage } from './pages/SecurityPage';

// Components
export { AvatarUpload } from './components/AvatarUpload';
export { ProfileCard } from './components/ProfileCard';
export { ProfileForm } from './components/ProfileForm';
export { SettingsSection, SettingsRow } from './components/SettingsSection';
export { ToggleSwitch } from './components/ToggleSwitch';
export { PasswordForm } from './components/PasswordForm';
export { NotificationSettings } from './components/NotificationSettings';
export { AppearanceSettingsPanel, AccessibilitySettingsPanel } from './components/AppearanceSettings';
export { PreferencesSettings } from './components/PreferencesSettings';
export { SessionList, DeviceHistoryList } from './components/SessionList';

// Hooks
export { useUserProfile, useUpdateProfile, useUploadAvatar, useDeleteAvatar } from './hooks/useUserProfile';
export { useUserSettings, useUpdatePreferences, useUpdateNotifications, useUpdateAppearance, useUpdateAccessibility } from './hooks/useUserSettings';
export { useChangePassword, useEnableMfa, useDisableMfa, useActiveSessions, useDeviceHistory, useRevokeSession, useRevokeAllSessions } from './hooks/useUserSecurity';

// API
export { userApi } from './services/user.api';

// Types
export type * from './types/user.types';
