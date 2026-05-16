'use client';
import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { loginWithCredentials, buildUser, ssoLogin } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants';

/**
 * Login page — Custom JWT Authentication Login
 * This page is a branded login screen handling IAM backend authentication.
 */
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  const getDashboardRoute = (roles: string[]) => {
    const roleStr = roles.join(' ').toLowerCase();

    if (roleStr.includes('super administrator')) return ROUTES.SUPER_ADMIN_DASHBOARD;
    if (roleStr.includes('board member') || roleStr.includes('tenant_admin')) return ROUTES.BOARD_DASHBOARD;
    if (roleStr.includes('chief executive officer')) return ROUTES.CEO_DASHBOARD;
    if (roleStr.includes('chief operating officer')) return ROUTES.COO_DASHBOARD;
    if (roleStr.includes('chief medical officer')) return ROUTES.CMO_DASHBOARD;
    if (roleStr.includes('chief nursing officer')) return ROUTES.CNO_DASHBOARD;
    if (roleStr.includes('chief information officer')) return ROUTES.CIO_DASHBOARD;
    if (roleStr.includes('chief information security officer')) return ROUTES.CISO_DASHBOARD;
    if (roleStr.includes('chief financial officer')) return ROUTES.CFO_DASHBOARD;
    if (roleStr.includes('chief compliance officer')) return ROUTES.CCO_DASHBOARD;
    if (roleStr.includes('chief technology officer')) return ROUTES.CTO_DASHBOARD;
    if (roleStr.includes('marketing')) return ROUTES.MARKETING_DASHBOARD;
    if (roleStr.includes('medical director')) return ROUTES.MED_DIR_DASHBOARD;
    if (roleStr.includes('medical superintendent') && !roleStr.includes('deputy')) return ROUTES.SUPER_DASHBOARD;
    if (roleStr.includes('deputy') && roleStr.includes('superintendent') && !roleStr.includes('nursing')) return ROUTES.DEPUTY_DASHBOARD;
    if (roleStr.includes('head of department')) return ROUTES.HOD_DASHBOARD;
    if (roleStr.includes('unit head') || roleStr.includes('clinical director')) return ROUTES.UNIT_DASHBOARD;
    if (roleStr.includes('surgeon') && !roleStr.includes('orthopedic')) return ROUTES.SURGEON_DASHBOARD;
    if (roleStr.includes('emergency physician')) return ROUTES.ER_DASHBOARD;
    if (roleStr.includes('intensivist')) return ROUTES.INTENSIVIST_DASHBOARD;
    if (roleStr.includes('locum')) return ROUTES.LOCUM_DASHBOARD;
    if (roleStr.includes('senior resident')) return ROUTES.SR_DASHBOARD;
    if (roleStr.includes('junior resident')) return ROUTES.JR_DASHBOARD;
    if (roleStr.includes('resident') && !roleStr.includes('senior') && !roleStr.includes('junior')) return ROUTES.RESIDENT_DASHBOARD;
    if (roleStr.includes('intern')) return ROUTES.INTERN_DASHBOARD;
    if (roleStr.includes('student')) return ROUTES.STUDENT_DASHBOARD;
    if (roleStr.includes('nursing superintendent') && !roleStr.includes('deputy')) return ROUTES.NURSING_SUP_DASHBOARD;
    if (roleStr.includes('deputy') && roleStr.includes('nursing')) return ROUTES.DEPUTY_NURSING_DASHBOARD;
    if (roleStr.includes('ward in-charge') || roleStr.includes('head nurse')) return ROUTES.WARD_DASHBOARD;
    if (roleStr.includes('icu nurse')) return ROUTES.ICU_NURSE_DASHBOARD;
    if (roleStr.includes('er nurse')) return ROUTES.ER_NURSE_DASHBOARD;
    if (roleStr.includes('ot nurse')) return ROUTES.OT_NURSE_DASHBOARD;
    if (roleStr.includes('triage nurse')) return ROUTES.TRIAGE_NURSE_DASHBOARD;
    if (roleStr.includes('infection control nurse')) return ROUTES.ICN_DASHBOARD;
    if (roleStr.includes('nurse') && !roleStr.includes('icu') && !roleStr.includes('er') && !roleStr.includes('ot') && !roleStr.includes('triage') && !roleStr.includes('superintendent') && !roleStr.includes('head')) return ROUTES.NURSE_DASHBOARD;
    if (roleStr.includes('nursing assistant')) return ROUTES.ASSISTANT_DASHBOARD;
    if (roleStr.includes('anm') || roleStr.includes('auxiliary nurse')) return ROUTES.ANM_DASHBOARD;
    if (roleStr.includes('site reliability engineer') || roleStr.includes('sre')) return ROUTES.SRE_DASHBOARD;
    if (roleStr.includes('it operations')) return ROUTES.ITOPS_DASHBOARD;
    if (roleStr.includes('forensic')) return ROUTES.FORENSIC_DASHBOARD;
    if (roleStr.includes('blood bank officer')) return ROUTES.BLOODBANK_DASHBOARD;
    if (roleStr.includes('blood bank technician')) return ROUTES.BLOOD_TECH_DASHBOARD;
    if (roleStr.includes('pain management')) return ROUTES.PAIN_DASHBOARD;
    if (roleStr.includes('genetic counselor')) return ROUTES.GENETIC_DASHBOARD;
    if (roleStr.includes('infosec compliance')) return ROUTES.INFOSEC_DASHBOARD;
    if (roleStr.includes('infosec risk')) return ROUTES.RISK_DASHBOARD;
    if (roleStr.includes('data protection officer')) return ROUTES.DPO_DASHBOARD;
    if (roleStr.includes('internal auditor')) return ROUTES.AUDIT_DASHBOARD;
    if (roleStr.includes('devops')) return ROUTES.DEVOPS_DASHBOARD;
    if (roleStr.includes('devsecops')) return ROUTES.DEVSECOPS_DASHBOARD;
    if (roleStr.includes('software developer')) return ROUTES.SOFTDEV_DASHBOARD;
    if (roleStr.includes('integration engineer')) return ROUTES.INTEGRATION_DASHBOARD;
    if (roleStr.includes('gateway manager')) return ROUTES.APIGATEWAY_DASHBOARD;
    if (roleStr.includes('qa') || roleStr.includes('test engineer')) return ROUTES.QA_DASHBOARD;
    if (roleStr.includes('data engineer')) return ROUTES.DATAENG_DASHBOARD;
    if (roleStr.includes('data analyst')) return ROUTES.ANALYST_DASHBOARD;
    if (roleStr.includes('ml engineer')) return ROUTES.ML_DASHBOARD;
    if (roleStr.includes('clinical informaticist')) return ROUTES.INFORMATICIST_DASHBOARD;
    if (roleStr.includes('data scientist')) return ROUTES.DATASCI_DASHBOARD;
    if (roleStr.includes('ai ethics')) return ROUTES.ETHICS_DASHBOARD;
    if (roleStr.includes('ai governance')) return ROUTES.GOV_DASHBOARD;
    if (roleStr.includes('iomt')) return ROUTES.IOMT_DASHBOARD;
    if (roleStr.includes('service accounts')) return ROUTES.SA_DASHBOARD;
    if (roleStr.includes('automation')) return ROUTES.AUTO_DASHBOARD;
    if (roleStr.includes('soc analyst')) return ROUTES.SOC_DASHBOARD;
    if (roleStr.includes('incident responder')) return ROUTES.IR_DASHBOARD;
    if (roleStr.includes('security engineer')) return ROUTES.SE_DASHBOARD;
    if (roleStr.includes('threat intel')) return ROUTES.TI_DASHBOARD;
    if (roleStr.includes('doctor') && !roleStr.includes('locum') && !roleStr.includes('resident')) return ROUTES.DOC_DASHBOARD;
    if (roleStr.includes('general physician')) return ROUTES.GP_DASHBOARD;

    // Default fallback
    return ROUTES.DASHBOARD;
  };

  const handleSSO = async (provider: string) => {
    setError('');
    setLoading(true);
    try {
      const response = await ssoLogin(provider);
      if (response.access_token) {
        setToken(response.access_token);
        const user = buildUser(response.access_token);
        if (user) {
          setUser(user);
          document.cookie = `mt-auth=${response.access_token}; path=/; max-age=86400; SameSite=Lax`;
          router.push(getDashboardRoute(user.roles));
        } else {
          document.cookie = `mt-auth=${response.access_token}; path=/; max-age=86400; SameSite=Lax`;
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('SSO error', err);
      setError(`SSO Error: ${err.response?.data?.detail || 'Authentication failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('Login started. API URL:', process.env.NEXT_PUBLIC_API_URL);
    
    try {
      const response = await loginWithCredentials(username.trim(), password.trim());
      if (response.access_token) {
        setToken(response.access_token);
        const user = buildUser(response.access_token);
        if (user) {
          setUser(user);
          // Set cookie for Edge Middleware
          document.cookie = `mt-auth=${response.access_token}; path=/; max-age=86400; SameSite=Lax`;
          
          // Redirect based on role
          const targetRoute = getDashboardRoute(user.roles);
          router.push(targetRoute);
        } else {
          document.cookie = `mt-auth=${response.access_token}; path=/; max-age=86400; SameSite=Lax`;
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Login error', err);
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : (err.message || 'Invalid username or password');
      setError(`Error: ${msg} | Status: ${err.response?.status}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-to-br from-surface-dark via-primary-900 to-surface-dark">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500 rounded-full blur-[128px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-glow-teal">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">MedTrustX</h1>
              <p className="text-xs text-teal-400 uppercase tracking-widest">DHOS Platform</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Digital Hospital<br />
            <span className="text-gradient">Operating System</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-md leading-relaxed">
            Enterprise-grade, Zero Trust healthcare platform with multi-tenant isolation,
            real-time clinical intelligence, and PQC-enabled security.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { label: 'Zero Trust', value: 'Enforced' },
              { label: 'Compliance', value: 'HIPAA/ABDM' },
              { label: 'Services', value: '139+' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <p className="text-2xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg font-bold text-white mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 lg:max-w-xl flex items-center justify-center p-8 bg-surface-dark">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">MedTrustX</h1>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Email or Username</label>
              <input 
                type="text" 
                placeholder="user@medtrustx.in" 
                className="input-field" 
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <a href="#" className="text-xs text-teal-400 hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  className="input-field pl-10 pr-10" 
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Or continue with SSO</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button 
              type="button" 
              onClick={() => handleSSO('Azure AD')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all group"
            >
              <svg className="w-5 h-5 text-[#00a4ef] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
              </svg>
              <span className="text-sm font-medium text-gray-300">Azure AD</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleSSO('Okta')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all group"
            >
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-[10px] font-black text-black tracking-tighter">okta</span>
              </div>
              <span className="text-sm font-medium text-gray-300">Okta</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-600">Protected by Zero Trust & Post-Quantum Cryptography</p>
            <p className="text-xs text-gray-600 mt-1">© 2026 MedTrustX. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
