'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { SimpleBarChart, DonutChart, MonthlyTrendChart } from '@/components/Charts';
import SafetyAlertBanner from '@/components/SafetyAlertBanner';
import {
  Activity,
  BarChart3,
  ShieldAlert,
  AlertTriangle,
  FileText,
  ListFilter,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Boxes,
  Factory,
} from 'lucide-react';

export default function AdrHeadDashboard() {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !analytics) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        <Activity className="w-8 h-8 text-medred-600 animate-spin mx-auto mb-2" />
        <span>Loading Pharmacovigilance Analytics &amp; Risk Intelligence...</span>
      </div>
    );
  }

  const { kpi, mostReportedDrugs, mostReportedIvFluids, manufacturerFrequency, severityDistribution, monthlyTrends, batchRiskMonitoring } =
    analytics;

  const dangerousBatches = batchRiskMonitoring.filter((b: any) => b.riskLevel === 'high_risk');

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-medred-600" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {t('adr_head.command_title', 'ADR Head Pharmacovigilance Command')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('adr_head.command_subtitle', 'Clinical case evaluation, WHO-UMC causality assessments, batch failure signal detection, and regulatory reporting.')}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/adr-head/batch-risk"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-medred-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-medred-600" />
            <span>Batch Risk Matrix ({dangerousBatches.length})</span>
          </Link>
          <Link
            href="/adr-head/cases"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-medred-600 hover:bg-medred-700 shadow-sm transition-all"
          >
            <ListFilter className="w-4 h-4" />
            <span>Review Pending Cases ({kpi.pendingReview})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Total ADRs</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{kpi.totalReports}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Recorded to date</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Pending Review</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{kpi.pendingReview}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Needs doctor review</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Open Cases</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{kpi.openCases}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active investigation</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Severe / Critical</div>
          <div className="text-2xl font-black text-medred-600 mt-1">{kpi.severeCases}</div>
          <div className="text-[10px] text-medred-600 mt-0.5">High clinical impact</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Follow-Up Cases</div>
          <div className="text-2xl font-black text-purple-600 mt-1">{kpi.followUpCases}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Linked updates</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Resolved / Closed</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{kpi.closedCases}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Causality confirmed</div>
        </div>
      </div>

      {/* Critical Signal Callout: Dangerous Batches Detected */}
      {dangerousBatches.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-medred-600 text-white mt-0.5 flex-shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950">
                Early Risk Warning: {dangerousBatches.length} High-Risk Drug Batch(es) Detected
              </h3>
              <p className="text-xs text-rose-800 mt-0.5">
                Cluster analysis indicates multiple repeated reactions on batch{' '}
                <strong>{dangerousBatches.map((b: any) => b.batchNo).join(', ')}</strong>. Urgent quarantine or clinical notice recommended.
              </p>
            </div>
          </div>

          <Link
            href="/adr-head/batch-risk"
            className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-medred-600 text-white font-bold text-xs hover:bg-medred-700 shadow-sm flex-shrink-0"
          >
            <span>Review &amp; Flag Alerts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Reported Drugs & IV Fluids */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Most Reported Drugs &amp; IV Fluids</h2>
              <p className="text-xs text-slate-500">Products with highest recorded adverse events</p>
            </div>
            <Boxes className="w-5 h-5 text-medred-600" />
          </div>

          <SimpleBarChart
            items={mostReportedDrugs.slice(0, 5).map((d: any) => ({
              name: d.name,
              count: d.count,
              subtext: d.form || 'IV Formulation',
            }))}
            valueLabel="Incidents"
          />
        </div>

        {/* Severity Distribution Donut */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">ADR Severity Distribution</h2>
              <p className="text-xs text-slate-500">Clinical categorization across all hospital wards</p>
            </div>
            <Activity className="w-5 h-5 text-medred-600" />
          </div>

          <div className="py-2">
            <DonutChart data={severityDistribution} />
          </div>
        </div>

        {/* Monthly Incident Trends */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Monthly Incident Trends</h2>
              <p className="text-xs text-slate-500">Timeline of adverse reaction occurrences</p>
            </div>
            <TrendingUp className="w-5 h-5 text-medred-600" />
          </div>

          <MonthlyTrendChart trends={monthlyTrends} />
        </div>

        {/* Manufacturer ADR Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">ADR Frequency by Manufacturer</h2>
              <p className="text-xs text-slate-500">Cross-batch supplier correlation</p>
            </div>
            <Factory className="w-5 h-5 text-medred-600" />
          </div>

          <SimpleBarChart
            items={manufacturerFrequency.slice(0, 5).map((m: any) => ({
              name: m.name,
              count: m.count,
            }))}
            valueLabel="Reports"
          />
        </div>
      </div>

      {/* Batch Risk Monitoring Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Batch Risk Monitoring &amp; Early Warnings</h2>
            <p className="text-xs text-slate-500">Identifies batches with repeated failures or active alerts</p>
          </div>

          <Link
            href="/adr-head/batch-risk"
            className="text-xs font-semibold text-medred-600 hover:text-medred-700 flex items-center space-x-1"
          >
            <span>Full Risk Matrix</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Batch Number</th>
                <th className="p-3.5">Product &amp; Manufacturer</th>
                <th className="p-3.5">Total Hospital ADRs</th>
                <th className="p-3.5">Risk Status</th>
                <th className="p-3.5">Signal Notes</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batchRiskMonitoring.slice(0, 5).map((b: any) => {
                const isHigh = b.riskLevel === 'high_risk';
                const isWatch = b.riskLevel === 'watchlist';

                return (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{b.batchNo}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{b.productName}</div>
                      <div className="text-[10px] text-slate-500">{b.manufacturerName}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block font-black text-sm ${
                          isHigh ? 'text-medred-600' : isWatch ? 'text-amber-600' : 'text-slate-700'
                        }`}
                      >
                        {b.reactionCount} {b.reactionCount === 1 ? 'reaction' : 'reactions'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isHigh
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : isWatch
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isHigh ? 'High Risk' : isWatch ? 'Watchlist' : 'Safe'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">
                      {b.alertReason || (isHigh ? '3+ repeated pyrogenic reactions' : 'Normal surveillance')}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/adr-head/cases?search=${encodeURIComponent(b.batchNo)}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        <span>Filter Cases</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
