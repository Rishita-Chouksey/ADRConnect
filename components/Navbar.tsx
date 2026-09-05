'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/lib/RoleContext';
import {
  Activity,
  ShieldAlert,
  FilePlus2,
  ListFilter,
  BarChart3,
  Boxes,
  Users,
  Bell,
  CheckCircle2,
  ChevronRight,
  Printer,
  LogOut,
  FileText,
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, activeRole, logout } = useRole();
  const pathname = usePathname();

  // Hide navbar on login page
  if (pathname === '/login') return null;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Official Government Top Bar Header */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">Hospital:</span>
          <span className="text-white font-semibold">District Maternal Hospital</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">PvPI Vigilance Unit Active</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-slate-300 font-medium text-[11px] hidden sm:block">
            Role: <span className="text-emerald-400 font-bold uppercase">{activeRole.replace('_', ' ')}</span>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/60 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main App Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Portal Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medred-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900">ADR</span>
                  <span className="text-xl font-bold tracking-tight text-medred-600">Connect</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-rose-50 text-medred-600 border border-rose-200">
                    PvPI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-none">IV Fluids &amp; Injectables Pharmacovigilance</p>
              </div>
            </Link>

            <span className="h-6 w-px bg-slate-200 hidden md:block" />

            {/* Portal Badge */}
            <div className="hidden md:flex items-center space-x-1 text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              <span className="text-slate-400">Portal:</span>
              <span className="font-semibold text-slate-800 uppercase">
                {activeRole === 'adr_head' ? 'ADR Head (Doctor)' : activeRole}
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
                      ? 'bg-rose-50 text-medred-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/nurse/report"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/nurse/report'
                      ? 'bg-medred-600 text-white font-semibold shadow-sm'
                      : 'text-medred-600 bg-rose-50 hover:bg-rose-100 font-medium'
                  }`}
                >
                  <FilePlus2 className="w-4 h-4" />
                  <span>Report New ADR</span>
                </Link>
                <Link
                  href="/nurse/reports"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/nurse/reports'
                      ? 'bg-rose-50 text-medred-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  My Reports &amp; Drafts
                </Link>
                <Link
                  href="/nurse/follow-up"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/nurse/follow-up'
                      ? 'bg-rose-50 text-medred-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Submit Follow-Up
                </Link>
              </>
            )}

            {activeRole === 'adr_head' && (
              <>
                <Link
                  href="/adr-head"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/adr-head'
                      ? 'bg-rose-50 text-medred-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics &amp; Trends</span>
                </Link>
                <Link
                  href="/adr-head/cases"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/adr-head/cases'
                      ? 'bg-rose-50 text-medred-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ListFilter className="w-4 h-4" />
                  <span>Case Management</span>
                </Link>
                <Link
                  href="/adr-head/batch-risk"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/adr-head/batch-risk'
                      ? 'bg-rose-50 text-medred-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-medred-600" />
                  <span>Batch Risk Monitoring</span>
                </Link>
                <Link
                  href="/adr-head/staff"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/adr-head/staff'
                      ? 'bg-rose-50 text-medred-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4 text-slate-700" />
                  <span>Staff Directory</span>
                </Link>
              </>
            )}

            {activeRole === 'admin' && (
              <>
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin'
                      ? 'bg-rose-50 text-medred-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Admin Overview
                </Link>
                <Link
                  href="/admin/inventory"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin/inventory'
                      ? 'bg-rose-50 text-medred-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Boxes className="w-4 h-4" />
                  <span>Drug Inventory</span>
                </Link>
                <Link
                  href="/admin/risk-panel"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin/risk-panel'
                      ? 'bg-rose-50 text-medred-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Risk Monitoring Panel</span>
                </Link>
                <Link
                  href="/admin/notices"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin/notices'
                      ? 'bg-rose-50 text-medred-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>Safety Broadcasts</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right User Profile Info */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-end space-x-1">
                <span>{currentUser.name}</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <div className="text-[11px] text-slate-500">
                {currentUser.employeeId} &bull; {currentUser.ward}
              </div>
            </div>

            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs shadow-inner">
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
