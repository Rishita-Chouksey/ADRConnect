'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { STATUS_CONFIG, SEVERITY_CONFIG } from '@/lib/types';
import {
  ListFilter,
  Search,
  Filter,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

export default function AdrHeadCasesPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [caseTypeFilter, setCaseTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCases();
  }, [statusFilter, caseTypeFilter]);

  const fetchCases = () => {
    setLoading(true);
    let url = `/api/reports?status=${statusFilter}&caseType=${caseTypeFilter}`;
    if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReports(data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCases();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Link href="/adr-head" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900">Clinical Case Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review nurse submissions, assign WHO-UMC causality assessments, transition case workflows, and forward to authorities.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/adr-head/batch-risk"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Batch Risk Matrix
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search drug, batch, manufacturer, patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-medred-500"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted (Pending Review)</option>
              <option value="under_review">Under Review</option>
              <option value="follow_up_required">Follow-Up Required</option>
              <option value="escalated">Escalated</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500">Type:</span>
            <select
              value={caseTypeFilter}
              onChange={(e) => setCaseTypeFilter(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-medred-500"
            >
              <option value="all">All Cases</option>
              <option value="initial">Initial Cases Only</option>
              <option value="follow_up">Follow-Up Cases Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading cases...</div>
        ) : reports.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            No ADR cases found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Patient / Incident</th>
                  <th className="p-3.5">Suspected Product &amp; Batch</th>
                  <th className="p-3.5">Clinical Reaction</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">WHO Causality</th>
                  <th className="p-3.5">Status Workflow</th>
                  <th className="p-3.5 text-right">Clinical Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => {
                  const statusConf = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.submitted;
                  const sevConf = SEVERITY_CONFIG[report.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.moderate;
                  const med = report.medications?.[0];

                  return (
                    <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">
                          {report.patientInitials} ({report.patientAge}, {report.patientSex})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {report.ward} &bull; {new Date(report.reactionStartDate).toLocaleDateString('en-IN')}
                        </div>
                        {report.caseType === 'follow_up' && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                            Follow-Up Report
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">
                          {med?.batch?.product?.name || 'Suspected Drug'}
                        </div>
                        <div className="font-mono text-medred-600 font-bold text-[11px]">
                          Batch: {med?.batch?.batchNo || 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-400">{med?.batch?.manufacturer?.name}</div>
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

                      <td className="p-3.5 font-semibold text-slate-800">
                        {med?.causalityAssessment ? (
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-medred-700 border border-rose-200 text-[11px] font-bold">
                            {med.causalityAssessment}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Pending</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}
                        >
                          {statusConf.label}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        <Link
                          href={`/adr-head/cases/${report.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-medred-600 hover:bg-medred-700 text-white shadow-sm transition-all"
                        >
                          <span>Review &amp; Assess</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
