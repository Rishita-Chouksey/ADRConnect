'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/lib/RoleContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';
import {
  Activity,
  ShieldAlert,
  FilePlus2,
  ListFilter,
  BarChart3,
  Boxes,
  Users,
  Bell,
  LogOut,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, activeRole, logout } = useRole();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  // Hide navbar on login page
  if (pathname === '/login') return null;

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Official Government Top Bar Header */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">{t('nav.hospital', 'Hospital:')}</span>
          <span className="text-white font-semibold">{t('nav.hospital_name', 'District Maternal Hospital')}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{t('nav.pvpi_active', 'PvPI Vigilance Unit Active')}</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* 6-Language Dropdown Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-slate-900 text-white font-medium">English</option>
              <option value="hi" className="bg-slate-900 text-white font-medium">हिंदी (Hindi)</option>
              <option value="bn" className="bg-slate-900 text-white font-medium">বাংলা (Bengali)</option>
              <option value="gu" className="bg-slate-900 text-white font-medium">ગુજરાતી (Gujarati)</option>
              <option value="ta" className="bg-slate-900 text-white font-medium">தமிழ் (Tamil)</option>
              <option value="kn" className="bg-slate-900 text-white font-medium">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>

          {/* Dark/Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title={theme === 'dark' ? t('common.theme_light', 'Light Mode') : t('common.theme_dark', 'Dark Mode')}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-200" />}
          </button>

          <div className="text-slate-300 font-medium text-[11px] hidden sm:block">
            {t('nav.role', 'Role')}: <span className="text-emerald-400 font-bold uppercase">{activeRole.replace('_', ' ')}</span>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/60 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('nav.sign_out', 'Sign Out')}</span>
          </button>
        </div>
      </div>

      {/* Main App Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Portal Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medred-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-200 dark:shadow-none group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">ADR</span>
                  <span className="text-xl font-bold tracking-tight text-medred-600">Connect</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-medred-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                    PvPI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">{t('nav.subtitle', 'IV Fluids & Injectables Pharmacovigilance')}</p>
              </div>
            </Link>

            <span className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

            {/* Portal Badge */}
            <div className="hidden md:flex items-center space-x-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400">{t('nav.portal', 'Portal')}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 uppercase">
                {activeRole === 'adr_head' ? t('role.adr_head', 'ADR Head (Doctor)') : activeRole === 'nurse' ? t('role.nurse', 'Staff Nurse') : t('role.admin', 'Administrator')}
              </span>
            </div>
          </div>

          {/* Role Specific Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {activeRole === 'nurse' && (
              <>
                <Link
                  href="/nurse"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/nurse'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-medred-600 dark:text-rose-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {t('nav.dashboard', 'Dashboard')}
                </Link>
                <Link
                  href="/nurse/report"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/nurse/report'
                      ? 'bg-medred-600 text-white font-semibold shadow-sm'
                      : 'text-medred-600 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-medium'
                  }`}
                >
                  <FilePlus2 className="w-4 h-4" />
                  <span>{t('nav.report_new_adr', 'Report New ADR')}</span>
                </Link>
                <Link
                  href="/nurse/reports"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/nurse/reports'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-medred-600 dark:text-rose-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {t('nav.my_reports', 'My Reports & Drafts')}
                </Link>
                <Link
                  href="/nurse/follow-up"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/nurse/follow-up'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-medred-600 dark:text-rose-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {t('nav.submit_followup', 'Submit Follow-Up')}
                </Link>
              </>
            )}

            {activeRole === 'adr_head' && (
              <>
                <Link
                  href="/adr-head"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/adr-head'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-medred-600 dark:text-rose-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>{t('nav.analytics', 'Analytics & Trends')}</span>
                </Link>
                <Link
                  href="/adr-head/cases"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/adr-head/cases'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-medred-600 dark:text-rose-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <ListFilter className="w-4 h-4" />
                  <span>{t('nav.case_management', 'Case Management')}</span>
                </Link>
                <Link
                  href="/adr-head/batch-risk"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/adr-head/batch-risk'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-medred-600 dark:text-rose-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-medred-600 dark:text-rose-400" />
                  <span>{t('nav.batch_risk', 'Batch Risk Monitoring')}</span>
                </Link>
                <Link
                  href="/adr-head/staff"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/adr-head/staff'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-medred-600 dark:text-rose-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <span>{t('nav.staff_directory', 'Staff Directory')}</span>
                </Link>
              </>
            )}

            {activeRole === 'admin' && (
              <>
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-medred-600 dark:text-rose-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {t('nav.admin_overview', 'Admin Overview')}
                </Link>
                <Link
                  href="/admin/inventory"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin/inventory'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-medred-600 dark:text-rose-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Boxes className="w-4 h-4" />
                  <span>{t('nav.drug_inventory', 'Drug Inventory')}</span>
                </Link>
                <Link
                  href="/admin/risk-panel"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin/risk-panel'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-medred-600 dark:text-rose-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>{t('nav.risk_panel', 'Risk Monitoring Panel')}</span>
                </Link>
                <Link
                  href="/admin/notices"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin/notices'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-medred-600 dark:text-rose-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>{t('nav.safety_broadcasts', 'Safety Broadcasts')}</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right User Profile Info */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-end space-x-1">
                <span>{currentUser.name}</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentUser.employeeId} &bull; {t('ward.' + (currentUser.ward || 'Maternity Ward'), t(currentUser.ward || 'Maternity Ward'))}
              </div>
            </div>

            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs shadow-inner">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
