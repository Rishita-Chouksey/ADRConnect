'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRole } from '@/lib/RoleContext';
import SafetyAlertBanner from '@/components/SafetyAlertBanner';
import { STATUS_CONFIG, SEVERITY_CONFIG } from '@/lib/types';
import {
  FilePlus2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Printer,
  FileText,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function NurseDashboard() {
  const { currentUser } = useRole();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReports(data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const drafts = reports.filter((r) => r.status === 'draft');
  const submitted = reports.filter((r) => r.status !== 'draft');
  const followUps = reports.filter((r) => r.caseType === 'follow_up');

  return (
    <div className="space-y-6">
      {/* Header & Role Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-medred-600" />
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Nurse Station & ADR Reporting</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong>{currentUser.name}</strong> ({currentUser.employeeId}) &bull; Assigned to{' '}
            <span className="font-semibold text-slate-800">{currentUser.ward || 'Maternity Ward'}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/nurse/follow-up"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>Submit Follow-Up</span>
          </Link>

          <Link
            href="/nurse/report"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-medred-600 hover:bg-medred-700 shadow-sm shadow-rose-200 transition-all hover:scale-105"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>+ Report Initial ADR</span>
          </Link>
        </div>
      </div>

      {/* Real-Time Nurse Safety Alert Ticker (Recalls & Notices) */}
      <SafetyAlertBanner wardFilter={currentUser.ward || undefined} />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900">{submitted.length}</div>
            <div className="text-xs text-slate-500 font-medium">Submitted to ADR Head</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-amber-600">{drafts.length}</div>
            <div className="text-xs text-slate-500 font-medium">Incomplete Drafts (Saved)</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-purple-600">{followUps.length}</div>
            <div className="text-xs text-slate-500 font-medium">Follow-Up Reports Filed</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Fast Action Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/nurse/report"
          className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-white border border-rose-200 hover:border-rose-300 shadow-sm transition-all group flex items-start space-x-4"
        >
          <div className="w-10 h-10 rounded-xl bg-medred-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <FilePlus2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-medred-600 transition-colors">
              Initial Case Reporting Form
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Patient experiencing fever, shivering, vomiting, or rashes during IV fluid/injection? Log initial case with smart symptoms and batch check.
            </p>
          </div>
        </Link>

        <Link
          href="/nurse/follow-up"
          className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-white border border-blue-200 hover:border-blue-300 shadow-sm transition-all group flex items-start space-x-4"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Submit Patient Follow-Up
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Record new symptoms, treatment response (antihistamines/antipyretics given), and recovery status for any previous ADR case.
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Reports & Incomplete Drafts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent ADR Incident Reports</h2>
            <p className="text-xs text-slate-500">Live feed of cases logged in the hospital</p>
          </div>

          <Link
            href="/nurse/reports"
            className="text-xs font-semibold text-medred-600 hover:text-medred-700 flex items-center space-x-1"
          >
            <span>View All ({reports.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading ADR incidents...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No ADR reports found. Click &quot;+ Report Initial ADR&quot; to log the first incident.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Patient / Ward</th>
                  <th className="p-3.5">Suspected Drug & Batch</th>
                  <th className="p-3.5">Reaction Observed</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Workflow Status</th>
                  <th className="p-3.5 text-right">Digital PvPI Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.slice(0, 6).map((report) => {
                  const statusConf = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.submitted;
                  const sevConf = SEVERITY_CONFIG[report.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.moderate;
                  const firstMed = report.medications?.[0];

                  return (
                    <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">
                          {report.patientInitials} ({report.patientAge}, {report.patientSex})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {report.ward} &bull;{' '}
                          {new Date(report.reactionStartDate || report.createdAt).toLocaleDateString('en-IN')}
                        </div>
                        {report.caseType === 'follow_up' && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                            Follow-Up Case
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">
                          {firstMed?.batch?.product?.name || 'Suspected Medication'}
                        </div>
                        <div className="text-[11px] font-mono text-medred-600 font-bold">
                          Batch: {firstMed?.batch?.batchNo || 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {firstMed?.batch?.manufacturer?.name || 'Unknown Mfr'}
                        </div>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                          {report.reactionDescription}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${sevConf.bg} ${sevConf.color} ${sevConf.border}`}
                        >
                          {sevConf.label}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}
                        >
                          {statusConf.label}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <Link
                          href={`/report/${report.id}/form`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-medred-600" />
                          <span>Official PvPI</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
