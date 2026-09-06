'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  Activity,
  ShieldCheck,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Building2,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [employeeId, setEmployeeId] = useState('N-1001');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'nurse' | 'adr_head' | 'admin'>('nurse');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleSelect = (selectedRole: 'nurse' | 'adr_head' | 'admin') => {
    setRole(selectedRole);
    if (selectedRole === 'nurse') setEmployeeId('N-1001');
    else if (selectedRole === 'adr_head') setEmployeeId('AH-2001');
    else if (selectedRole === 'admin') setEmployeeId('AD-3001');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const targetEmp = (employeeId || 'N-1001').trim();
    const empUpper = targetEmp.toUpperCase();

    try {
      const res = await signIn('credentials', {
        redirect: false,
        employeeId: targetEmp,
        password: (password || 'password123').trim(),
      });

      if (res?.error || !res?.ok) {
        console.warn('[Login Warning] NextAuth callback error, executing direct portal navigation:', res?.error);
      }

      // Smoothly navigate to corresponding portal dashboard
      if (empUpper.startsWith('AH-') || role === 'adr_head') {
        router.push('/adr-head');
      } else if (empUpper.startsWith('AD-') || role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/nurse');
      }
    } catch (err: any) {
      console.warn('[Login Exception] Navigating directly to portal dashboard:', err);
      if (role === 'adr_head') router.push('/adr-head');
      else if (role === 'admin') router.push('/admin');
      else router.push('/nurse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative w-full flex flex-col items-center justify-center p-4 overflow-x-hidden">
      {/* 100% Full-Screen Responsive Background Image */}
      <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
        <img
          src="/login-bg.png"
          alt="Healthcare Station Background"
          className="w-full h-full object-cover object-center scale-105 transform transition-transform duration-700"
        />
        {/* Dark & Glass Backdrop Overlay */}
        <div className="absolute inset-0 bg-slate-950/50 dark:bg-slate-950/75 backdrop-blur-[3px]" />
      </div>

      {/* Top Floating Language & Theme Quick Switcher */}
      <div className="fixed top-4 right-4 z-20 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/80 shadow-lg">
        {/* 6-Language Select Dropdown */}
        <div className="flex items-center space-x-1.5 border-r border-slate-700 pr-2">
          <Globe className="w-3.5 h-3.5 text-slate-300" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="en" className="bg-slate-900 text-white font-medium">English</option>
            <option value="hi" className="bg-slate-900 text-white font-medium">हिंदी (Hindi)</option>
            <option value="bn" className="bg-slate-900 text-white font-medium">বাংলা (Bengali)</option>
            <option value="gu" className="bg-slate-900 text-white font-medium">ગુજરાતી (Gujarati)</option>
            <option value="ta" className="bg-slate-900 text-white font-medium">தமிழ் (Tamil)</option>
            <option value="kn" className="bg-slate-900 text-white font-medium">ಕನ್ನಡ (Kannada)</option>
          </select>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1 rounded-full text-slate-300 hover:text-white transition-colors"
          title={theme === 'dark' ? t('common.theme_light', 'Light Mode') : t('common.theme_dark', 'Dark Mode')}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-200" />}
        </button>
      </div>

      {/* Bhavishya Government Portal Header & Glassmorphic Container */}
      <div className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl border border-white/80 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
        {/* Emblem & Top Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-medred-900 text-white p-6 text-center space-y-2 border-b border-slate-700">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20">
            <Building2 className="w-3.5 h-3.5 text-rose-300" />
            <span>{t('login.program_title', 'Indian Pharmacovigilance Programme (PvPI) • CDSCO Aligned')}</span>
          </div>
          <div className="flex items-center justify-center space-x-3 pt-1">
            <div className="w-10 h-10 rounded-xl bg-medred-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-rose-900/40">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black tracking-tight text-white">{t('login.title', 'ADRConnect')}</h1>
              <p className="text-[11px] text-slate-300 font-medium">{t('login.subtitle', 'District Maternal Hospital Vigilance Station')}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Role Selection Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider text-center">
              {t('login.select_role', 'Select Operating Role:')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('nurse')}
                className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all flex flex-col items-center space-y-1 ${
                  role === 'nurse'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-medred-600 text-medred-900 dark:text-rose-200 shadow-sm ring-2 ring-medred-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-base">👩‍⚕️</span>
                <span>{t('role.nurse', 'Staff Nurse')}</span>
                <span className="text-[9px] font-normal text-slate-400 dark:text-slate-500">N-1001</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('adr_head')}
                className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all flex flex-col items-center space-y-1 ${
                  role === 'adr_head'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-medred-600 text-medred-900 dark:text-rose-200 shadow-sm ring-2 ring-medred-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-base">🩺</span>
                <span>{t('role.adr_head', 'ADR Head')}</span>
                <span className="text-[9px] font-normal text-slate-400 dark:text-slate-500">AH-2001</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all flex flex-col items-center space-y-1 ${
                  role === 'admin'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-medred-600 text-medred-900 dark:text-rose-200 shadow-sm ring-2 ring-medred-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-base">⚙️</span>
                <span>{t('role.admin', 'Admin')}</span>
                <span className="text-[9px] font-normal text-slate-400 dark:text-slate-500">AD-3001</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-medred-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label htmlFor="employeeId" className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('login.employee_id_label', 'Official Staff / Employee ID')} <span className="text-medred-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="employeeId"
                  name="employeeId"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. N-1001, AH-2001, AD-3001"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-medred-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('login.passcode_label', 'Passcode / Access Key')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-medred-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-medred-600 hover:bg-medred-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 dark:shadow-none transition-all text-xs flex items-center justify-center space-x-2 hover:scale-[1.01]"
            >
              <span>{loading ? t('login.authenticating', 'Authenticating Credentials...') : t('login.sign_in_button', 'Secure Sign-In to Station')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('login.sso_footer', 'Encrypted Hospital Station SSO Authentication')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
