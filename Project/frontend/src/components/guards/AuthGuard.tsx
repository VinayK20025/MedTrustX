'use client';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/auth.types';
import { PageLoader } from '@/components/ui/Spinner';
import type { DeviceTrustError, PdpTrustDecision } from '@/services/deviceTrust.service';
import {
  ShieldOff, ShieldAlert, ShieldCheck, Laptop,
  Fingerprint, Activity, XCircle, AlertTriangle,
  Lock, Cpu, Monitor, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// ─── Verification Phase Types ────────────────────────────────────────────────

type VerificationPhase =
  | 'idle'          // Not started
  | 'collecting'    // Gathering device posture telemetry
  | 'submitting'    // Sending to PEP
  | 'evaluating'    // PDP evaluation in progress
  | 'granted'       // PDP approved
  | 'denied'        // PDP rejected
  | 'quarantined'   // PDP quarantined device
  | 'mfa_challenge' // PDP requires step-up MFA
  | 'error';        // Network / PEP unavailable

interface VerificationState {
  phase: VerificationPhase;
  error: DeviceTrustError | null;
  decision: PdpTrustDecision | null;
}

// ─── Phase Messaging ─────────────────────────────────────────────────────────

const PHASE_MESSAGES: Record<VerificationPhase, string> = {
  idle:        'Awaiting device verification',
  collecting:  'Collecting device posture telemetry...',
  submitting:  'Submitting to Policy Enforcement Point...',
  evaluating:  'Policy Decision Point is evaluating your device...',
  granted:     'Device trust granted',
  denied:      'Device trust denied by Policy Decision Point',
  quarantined: 'Device has been quarantined',
  mfa_challenge: 'Additional authentication required',
  error:       'Verification failed',
};

// ─── AuthGuard ───────────────────────────────────────────────────────────────

export function AuthGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { isAuthenticated, isLoading, isDeviceTrusted, deviceRiskLevel, verifyDeviceTrust, verifyDeviceMfa } = useAuth();
  const [state, setState] = React.useState<VerificationState>({
    phase: 'idle',
    error: null,
    decision: null,
  });
  const [mfaCode, setMfaCode] = React.useState('');

  if (isLoading) return <PageLoader message="Authenticating..." />;
  if (!isAuthenticated) return fallback ?? <RedirectToLogin />;

  // ── Device already trusted by PDP (persisted from previous session) ────────
  if (isDeviceTrusted) return <>{children}</>;

  // ── Device not trusted — show ZTA verification UI ─────────────────────────
  const handleVerify = async () => {
    setState({ phase: 'collecting', error: null, decision: null });

    try {
      // Phase 1: Collecting posture (brief UI pause for feedback)
      await new Promise(r => setTimeout(r, 600));
      setState(s => ({ ...s, phase: 'submitting' }));

      // Phase 2: Submit to PEP (brief UI pause for feedback)
      await new Promise(r => setTimeout(r, 400));
      setState(s => ({ ...s, phase: 'evaluating' }));

      // Phase 3 & 4: Real PEP→PDP call (no bypass)
      const decision = await verifyDeviceTrust();
      if (decision.mfa_required) {
        setState({ phase: 'mfa_challenge', error: null, decision });
      } else {
        setState({ phase: 'granted', error: null, decision });
      }

    } catch (err) {
      const trustErr = err as DeviceTrustError;
      const phase: VerificationPhase =
        trustErr.code === 'QUARANTINED' ? 'quarantined' :
        trustErr.code === 'POSTURE_REJECTED' ? 'denied' :
        'error';
      setState({ phase, error: trustErr, decision: null });
    }
  };

  const handleMfaSubmit = async () => {
    if (!state.decision?.device_session_token) return;
    setState(s => ({ ...s, phase: 'evaluating', error: null }));
    try {
      const decision = await verifyDeviceMfa(state.decision.device_session_token, mfaCode);
      setState({ phase: 'granted', error: null, decision });
    } catch (err) {
      setState(s => ({ ...s, phase: 'mfa_challenge', error: err as DeviceTrustError }));
    }
  };

  const isVerifying = ['collecting', 'submitting', 'evaluating'].includes(state.phase);
  const isDenied    = ['denied', 'quarantined', 'error'].includes(state.phase);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface-dark text-center p-8 animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* Ambient glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none transition-colors duration-700 ${
        isDenied ? 'bg-red-500/10' : isVerifying ? 'bg-indigo-500/10' : 'bg-orange-500/10'
      }`} />

      <div className="max-w-md w-full bg-surface-light border border-white/10 shadow-2xl rounded-2xl p-8 relative z-10 backdrop-blur-xl">

        {/* Header icon */}
        <div className="flex justify-center mb-6 relative">
          <div className={`absolute inset-0 blur-xl rounded-full transition-colors duration-500 ${
            isDenied ? 'bg-red-500/20' : isVerifying ? 'bg-indigo-500/20' : 'bg-orange-500/20'
          }`} />
          <div className={`p-4 rounded-full border relative transition-colors duration-500 ${
            isDenied
              ? 'bg-red-500/10 border-red-500/30'
              : isVerifying
              ? 'bg-indigo-500/10 border-indigo-500/30'
              : 'bg-orange-500/10 border-orange-500/30'
          }`}>
            <Laptop className={`w-12 h-12 transition-colors duration-500 ${
              isDenied ? 'text-red-400' : isVerifying ? 'text-indigo-400' : 'text-orange-400'
            }`} />
            <div className="absolute bottom-2 right-2">
              {isDenied
                ? <XCircle className="w-6 h-6 text-red-400 drop-shadow-lg" />
                : isVerifying
                ? <Activity className="w-6 h-6 text-indigo-400 animate-pulse drop-shadow-lg" />
                : <ShieldAlert className="w-6 h-6 text-orange-400 drop-shadow-lg" />}
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">
          {state.phase === 'quarantined' ? 'Device Quarantined'
            : state.phase === 'denied'  ? 'Trust Denied by PDP'
            : state.phase === 'error'   ? 'Verification Unavailable'
            : state.phase === 'mfa_challenge' ? 'MFA Required'
            : 'Untrusted Device Detected'}
        </h1>

        <p className="text-sm text-gray-400 mb-6">
          {state.phase === 'quarantined'
            ? 'This device has been quarantined by the Zero Trust Policy Decision Point due to a high-risk posture assessment. Contact your security administrator.'
            : state.phase === 'denied'
            ? state.error?.message ?? 'The Policy Decision Point rejected this device based on posture evaluation criteria.'
            : state.phase === 'error'
            ? state.error?.message ?? 'Unable to reach the ZTA Policy Enforcement Point. Check your network and try again.'
            : state.phase === 'mfa_challenge'
            ? 'This device exhibits a restricted posture. Please enter your Multi-Factor Authentication code to continue.'
            : 'Zero-Trust Architecture (ZTA) requires all devices to be explicitly verified by the Policy Decision Point before accessing MedTrustX.'}
        </p>

        {/* Posture Status Panel */}
        <div className="bg-black/40 rounded-xl p-4 border border-white/5 text-left mb-6 space-y-2.5">
          <StatusRow
            label="Device Posture"
            value={
              state.phase === 'collecting' ? 'SCANNING...' :
              isVerifying ? 'COLLECTED' :
              state.phase === 'granted' ? 'COMPLIANT' :
              isDenied ? 'NON-COMPLIANT' : 'UNKNOWN'
            }
            icon={<Monitor className="w-3.5 h-3.5" />}
            accent={
              state.phase === 'granted' ? 'success' :
              isDenied ? 'danger' :
              isVerifying ? 'info' : 'warning'
            }
          />
          <StatusRow
            label="ZTA Agent"
            value={
              state.phase === 'submitting' || state.phase === 'evaluating' ? 'ACTIVE' :
              state.phase === 'collecting' ? 'INITIALIZING' :
              state.phase === 'granted' ? 'VERIFIED' :
              isDenied ? 'REJECTED' : 'PENDING'
            }
            icon={<Cpu className="w-3.5 h-3.5" />}
            accent={
              state.phase === 'granted' ? 'success' :
              isDenied ? 'danger' :
              isVerifying ? 'info' : 'warning'
            }
          />
          <StatusRow
            label="PEP Submission"
            value={
              state.phase === 'submitting' ? 'IN PROGRESS' :
              state.phase === 'evaluating' || state.phase === 'granted' ? 'SUBMITTED' :
              isDenied ? 'COMPLETE' : 'AWAITING'
            }
            icon={<Globe className="w-3.5 h-3.5" />}
            accent={
              state.phase === 'granted' || isDenied ? 'success' :
              state.phase === 'submitting' ? 'info' : 'muted'
            }
          />
          <StatusRow
            label="PDP Decision"
            value={
              state.phase === 'evaluating' ? 'EVALUATING...' :
              state.phase === 'granted' ? 'TRUSTED' :
              state.phase === 'denied' ? 'DENIED' :
              state.phase === 'quarantined' ? 'QUARANTINED' :
              state.phase === 'error' ? 'UNAVAILABLE' : 'PENDING'
            }
            icon={<Lock className="w-3.5 h-3.5" />}
            accent={
              state.phase === 'granted' ? 'success' :
              isDenied ? 'danger' :
              state.phase === 'evaluating' ? 'info' : 'muted'
            }
          />
        </div>

        {/* Phase progress indicator */}
        {isVerifying && (
          <div className="mb-6">
            <div className="flex justify-between text-[10px] text-gray-500 font-mono mb-1.5">
              <span>POSTURE</span><span>PEP</span><span>PDP</span><span>DECISION</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full bg-indigo-500 rounded-full transition-all duration-500 ${
                state.phase === 'collecting' ? 'w-1/4' :
                state.phase === 'submitting' ? 'w-2/4' :
                state.phase === 'evaluating' ? 'w-3/4' : 'w-full'
              }`} />
            </div>
          </div>
        )}

        {/* Risk level badge (if granted) */}
        {state.phase === 'granted' && deviceRiskLevel && (
          <div className="flex items-center justify-center gap-2 mb-6 py-2.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-300 font-mono">TRUST GRANTED · RISK: {deviceRiskLevel}</span>
          </div>
        )}

        {/* Quarantine notice */}
        {state.phase === 'quarantined' && (
          <div className="flex items-start gap-3 mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-left">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-300 leading-relaxed">
              This device is under active quarantine. No retry is permitted. Please contact your
              Information Security Administrator with incident reference: <span className="font-mono">ZTA-QUARANTINE-{Date.now().toString(36).toUpperCase()}</span>
            </p>
          </div>
        )}

        {/* Action button */}
        {state.phase === 'mfa_challenge' ? (
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Enter 6-digit code (e.g. 000000 for demo)" 
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center text-white font-mono tracking-widest focus:outline-none focus:border-indigo-500 transition-colors"
              maxLength={6}
            />
            {state.error && <p className="text-xs text-red-400">{state.error.message}</p>}
            <Button
              className="w-full font-medium py-3 rounded-xl transition-all shadow-glow-sm bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2"
              onClick={handleMfaSubmit}
              disabled={mfaCode.length < 6 || isVerifying}
            >
              {isVerifying ? <Activity className="w-5 h-5 animate-pulse" /> : <Lock className="w-5 h-5" />}
              Verify MFA
            </Button>
          </div>
        ) : state.phase !== 'quarantined' && (
          <Button
            className={`w-full font-medium py-3 rounded-xl transition-all shadow-glow-sm flex items-center justify-center gap-2 ${
              isDenied && state.phase !== 'error'
                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
            onClick={handleVerify}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <><Activity className="w-5 h-5 animate-pulse" />{PHASE_MESSAGES[state.phase]}</>
            ) : isDenied ? (
              <><ShieldAlert className="w-5 h-5" />Retry Verification</>
            ) : (
              <><Fingerprint className="w-5 h-5" />Verify Device with ZTA</>
            )}
          </Button>
        )}

        {/* Footer note */}
        <p className="text-[10px] text-gray-600 mt-4 font-mono">
          ZTA · PEP/PDP ENFORCEMENT · NO CLIENT-SIDE BYPASS
        </p>
      </div>
    </div>
  );
}

// ─── Status Row Helper ───────────────────────────────────────────────────────

type Accent = 'success' | 'danger' | 'warning' | 'info' | 'muted';
const ACCENT_CLASSES: Record<Accent, string> = {
  success: 'text-emerald-400',
  danger:  'text-red-400',
  warning: 'text-orange-400',
  info:    'text-indigo-400',
  muted:   'text-gray-600',
};

function StatusRow({ label, value, icon, accent }: {
  label: string; value: string; icon: React.ReactNode; accent: Accent;
}) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="flex items-center gap-1.5 text-gray-500">
        {icon}{label}
      </span>
      <span className={`font-mono font-semibold transition-colors duration-300 ${ACCENT_CLASSES[accent]}`}>
        {value}
      </span>
    </div>
  );
}

// ─── RoleGuard ───────────────────────────────────────────────────────────────
// No executive bypass. All roles are evaluated strictly through the RBAC engine.

export function RoleGuard({ children, roles, requireAll = false, fallback }: {
  children: React.ReactNode;
  roles: UserRole[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}) {
  const { user, isLoading, hasRole, hasAnyRole } = useAuth();
  if (isLoading) return <PageLoader />;

  const allowed = requireAll
    ? roles.every((r) => hasRole(r))
    : hasAnyRole(roles);

  if (!allowed) return fallback ?? <AccessDenied />;
  return <>{children}</>;
}

// ─── PermissionGuard ─────────────────────────────────────────────────────────
// No executive bypass. All permissions are evaluated strictly.

export function PermissionGuard({ children, permission, fallback }: {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}) {
  const { user, isLoading, hasPermission } = useAuth();
  if (isLoading) return <PageLoader />;

  if (!hasPermission(permission)) return fallback ?? <AccessDenied />;
  return <>{children}</>;
}

// ─── AccessDenied ────────────────────────────────────────────────────────────

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-surface-dark text-center p-8 animate-fade-in relative overflow-hidden rounded-2xl border border-white/[0.04] shadow-glass m-4">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emergency/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-lg w-full bg-surface-light border border-emergency/20 shadow-2xl rounded-2xl p-10 backdrop-blur-xl">
        <div className="flex justify-center mb-6 relative">
          <div className="absolute inset-0 bg-emergency/20 blur-xl rounded-full" />
          <div className="p-4 rounded-full bg-emergency/10 border border-emergency/30 relative shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <ShieldOff className="w-14 h-14 text-emergency-light" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Restricted Module</h1>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 font-mono mb-6">
          <span className="w-2 h-2 rounded-full bg-emergency-light animate-pulse" />
          ZTA POLICY ENFORCEMENT
        </div>

        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          Your current Identity and Access Management (IAM) role does not contain the necessary privileges
          to view this service dashboard. The Zero-Trust Architecture has actively blocked this request.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-black/40 rounded-xl p-4 border border-white/5 text-left">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Access Level</p>
            <p className="text-emergency-light font-mono text-sm font-bold">DENIED</p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-white/5 text-left">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Audit Log</p>
            <p className="text-warning-light font-mono text-sm font-bold">RECORDED</p>
          </div>
        </div>

        <a
          href="/dashboard"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all shadow-glow-sm hover:shadow-card-hover hover:-translate-y-0.5 border border-white/10"
        >
          Return to Dashboard Homepage
        </a>
      </div>
    </div>
  );
}

// ─── RedirectToLogin ──────────────────────────────────────────────────────────

function RedirectToLogin() {
  if (typeof window !== 'undefined') window.location.href = '/login';
  return <PageLoader message="Redirecting to login..." />;
}


