'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRole } from '@/lib/RoleContext';
import SafetyAlertBanner from '@/components/SafetyAlertBanner';
import {
  Activity,
  FilePlus2,
  BarChart3,
  Boxes,
  ShieldAlert,
  ArrowRight,
  ClipboardList,
  Layers,
  Sparkles,
  Users,
  CheckCircle2,
  FileText,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  const { currentUser, activeRole } = useRole();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => setStats(data.kpi))
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Safety Banner */}
      <SafetyAlertBanner />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-medred-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-medred-600/20 text-rose-300 border border-medred-500/30 text-xs font-semibold mb-4">
            <Activity className="w-3.5 h-3.5 text-medred-400" />
            <span>Digital Pharmacovigilance &amp; Batch Traceability</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Intelligent Adverse Drug Reaction Monitoring for <span className="text-rose-400">IV Fluids &amp; Injections</span>
          </h1>

          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate manual paperwork. ADRConnect links bedside nurse reporting directly to pharmacovigilance officer investigations, automated batch failure clustering, and hospital-wide safety recalls.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/nurse"
              className="inline-flex items-center space-x-2 bg-medred-600 hover:bg-medred-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-rose-900/30 transition-all hover:scale-105"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Launch Nurse Portal</span>
            </Link>
            <Link
              href="/adr-head"
              className="inline-flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Open ADR Head Analytics</span>
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm px-5 py-2.5 rounded-xl border border-slate-700 transition-all"
            >
              <Boxes className="w-4 h-4" />
              <span>Drug Inventory &amp; Alerts</span>
            </Link>
          </div>
        </div>

        {/* Live Quick Counters */}
        {stats && (
          <div className="mt-8 pt-6 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
            <div>
              <div className="text-2xl font-black text-white">{stats.totalReports}</div>
              <div className="text-xs text-slate-400 font-medium">Total ADRs Reported</div>
            </div>
            <div>
              <div className="text-2xl font-black text-rose-400">{stats.severeCases}</div>
              <div className="text-xs text-slate-400 font-medium">Severe / High Risk</div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-400">{stats.pendingReview}</div>
              <div className="text-xs text-slate-400 font-medium">Pending Doctor Review</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">{stats.closedCases}</div>
              <div className="text-xs text-slate-400 font-medium">Cases Resolved / Closed</div>
            </div>
          </div>
        )}
      </div>

      {/* Role Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Nurse Portal */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-medred-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FilePlus2 className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">1. Nurse Portal</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-medred-700">
                Frontline Reporting
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Fast, bedside ADR reporting with smart symptom suggestions, automatic batch lookup, partial draft saving, and 1-click official PvPI digital form export.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Smart symptom auto-suggestions (Shivering, Fever...)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant &quot;Has this batch reacted before?&quot; alert</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Follow-up submission linked to original case</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/nurse"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-medred-600 hover:text-medred-700"
            >
              <span>Access Nurse Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/nurse/report"
              className="px-3 py-1.5 bg-medred-600 hover:bg-medred-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              + New Report
            </Link>
          </div>
        </div>

        {/* 2. ADR Head Portal */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">2. ADR Head Portal</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                Doctor / PV Officer
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Analytics dashboard with interactive charts, batch failure monitoring, WHO-UMC causality evaluation, clinical status workflow, and regulatory forwarding.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Multi-stage workflow (Draft &rarr; Under Review &rarr; Closed)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Batch Risk Matrix &amp; automatic danger highlighting</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Pharmacovigilance Forwarding (PvPI / CDSCO)</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/adr-head"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>Open Analytics Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/adr-head/cases"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Review Cases
            </Link>
          </div>
        </div>

        {/* 3. Administrator Portal */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Boxes className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">3. Admin Portal</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                Pharmacy / IT Admin
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Maintain verified drug inventory (products, manufacturers, batches), monitor the 3-tier Drug Risk Panel (Safe, Watchlist, High-Risk), and broadcast safety notices to nurses.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Manage hospital IV fluids &amp; drug batch numbers</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                <span>3-tier Drug Risk Panel: Safe vs Watchlist vs High-Risk</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Broadcast urgent recall advisories to nurses</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/admin"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              <span>Manage Hospital Systems</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/admin/inventory"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Inventory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
