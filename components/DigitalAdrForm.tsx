'use client';

import React from 'react';
import { formatPvpiData, PvpiFormData } from '@/lib/pvpi-template';
import { Printer, Shield, CheckCircle2, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface DigitalAdrFormProps {
  report: any;
  showBackLink?: boolean;
}

export default function DigitalAdrForm({ report, showBackLink = true }: DigitalAdrFormProps) {
  const data: PvpiFormData = formatPvpiData(report);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto my-6">
      {/* Action Toolbar (Hidden during Print) */}
      <div className="no-print flex items-center justify-between mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {showBackLink ? (
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Cases</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500 font-medium">
            Case Ref: <strong className="text-slate-900">{data.reportId.slice(0, 8)}...</strong>
          </span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 bg-medred-600 hover:bg-medred-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Official Standardized PvPI Form Sheet */}
      <div className="pvpi-form-container bg-white border border-slate-300 rounded-lg p-8 shadow-sm text-slate-900 leading-normal">
        {/* Form Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center relative">
          <div className="flex items-center justify-center space-x-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-medred-600 text-white flex items-center justify-center font-bold text-sm">
              +
            </div>
            <h1 className="text-lg font-black tracking-wide uppercase text-slate-900">
              Pharmacovigilance Programme of India (PvPI)
            </h1>
          </div>
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Indian Pharmacopoeia Commission &bull; Ministry of Health & Family Welfare &bull; Govt. of India
          </p>
          <h2 className="text-sm font-bold text-medred-700 mt-2 uppercase tracking-wide">
            Suspected Adverse Drug Reaction (ADR) Reporting Form
          </h2>
          <p className="text-[11px] text-slate-500 italic mt-0.5">
            (For Voluntary Reporting by Healthcare Professionals: Doctors, Nurses, Pharmacists)
          </p>

          <div className="absolute top-0 right-0 text-right text-xs">
            <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-300 font-mono text-[11px] rounded font-bold">
              {data.caseType === 'follow_up' ? 'FOLLOW-UP REPORT' : 'INITIAL REPORT'}
            </span>
            <div className="text-[10px] text-slate-500 mt-1">Date: {data.reportDate}</div>
          </div>
        </div>

        {/* Section A: Patient Information */}
        <div className="mb-6">
          <div className="bg-slate-100 border-l-4 border-medred-600 px-3 py-1.5 font-bold text-xs uppercase tracking-wide text-slate-800 mb-2">
            Section A: Patient Information
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 border border-slate-200 rounded text-xs bg-slate-50/50">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">1. Patient Initials</span>
              <span className="font-bold text-sm text-slate-900">{data.patient.initials}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">2. Age / DOB</span>
              <span className="font-bold text-sm text-slate-900">{data.patient.age}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">3. Sex</span>
              <span className="font-bold text-sm text-slate-900">
                {data.patient.sex === 'M' ? 'Male (M)' : data.patient.sex === 'F' ? 'Female (F)' : 'Other'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">4. Weight (kg)</span>
              <span className="font-bold text-sm text-slate-900">
                {data.patient.weightKg ? `${data.patient.weightKg} kg` : 'Not recorded'}
              </span>
            </div>
          </div>
        </div>

        {/* Section B: Suspected Adverse Reaction */}
        <div className="mb-6">
          <div className="bg-slate-100 border-l-4 border-medred-600 px-3 py-1.5 font-bold text-xs uppercase tracking-wide text-slate-800 mb-2">
            Section B: Suspected Adverse Reaction
          </div>
          <div className="border border-slate-200 rounded p-4 text-xs space-y-3 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Date Reaction Started</span>
                <span className="font-bold text-slate-900">{data.reaction.startDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Date of Recovery (if recovered)</span>
                <span className="font-bold text-slate-900">{data.reaction.recoveryDate || 'Ongoing / Under Observation'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Assessed Severity</span>
                <span className="font-bold uppercase text-medred-600">{data.reaction.severity}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Description of Reaction</span>
              <div className="p-3 bg-white border border-slate-200 rounded mt-1 font-medium text-slate-900 text-xs leading-relaxed">
                {data.reaction.description}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-1">
                  Seriousness Criteria (Check all that apply)
                </span>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <span className={data.reaction.seriousness.death ? 'font-bold text-medred-600' : 'text-slate-400'}>
                    [{data.reaction.seriousness.death ? '✓' : ' '}] Patient Died
                  </span>
                  <span className={data.reaction.seriousness.lifeThreatening ? 'font-bold text-medred-600' : 'text-slate-400'}>
                    [{data.reaction.seriousness.lifeThreatening ? '✓' : ' '}] Life Threatening
                  </span>
                  <span className={data.reaction.seriousness.hospitalization ? 'font-bold text-medred-600' : 'text-slate-400'}>
                    [{data.reaction.seriousness.hospitalization ? '✓' : ' '}] Hospitalization
                  </span>
                  <span className={data.reaction.seriousness.medicallySignificant ? 'font-bold text-medred-600' : 'text-slate-400'}>
                    [{data.reaction.seriousness.medicallySignificant ? '✓' : ' '}] Medically Significant
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-1">Outcome of ADR</span>
                <span className="inline-block px-3 py-1 bg-white border border-slate-300 font-bold uppercase text-slate-800 rounded">
                  {data.reaction.outcome}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section C: Suspected Medication(s) */}
        <div className="mb-6">
          <div className="bg-slate-100 border-l-4 border-medred-600 px-3 py-1.5 font-bold text-xs uppercase tracking-wide text-slate-800 mb-2">
            Section C: Suspected Medication(s) Details
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-700">
                  <th className="p-2 border-r border-slate-200">Drug / IV Fluid</th>
                  <th className="p-2 border-r border-slate-200">Manufacturer & Batch No.</th>
                  <th className="p-2 border-r border-slate-200">Exp. Date</th>
                  <th className="p-2 border-r border-slate-200">Dose & Route</th>
                  <th className="p-2 border-r border-slate-200">Indication</th>
                  <th className="p-2 border-r border-slate-200">Action Taken</th>
                  <th className="p-2">Causality (WHO)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.medications.map((med, idx) => (
                  <tr key={idx} className="bg-white hover:bg-slate-50">
                    <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                      {med.name}
                      {med.genericName && (
                        <div className="text-[10px] font-normal text-slate-500 italic">({med.genericName})</div>
                      )}
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      <div className="font-semibold text-slate-800">{med.manufacturer}</div>
                      <div className="font-mono text-[11px] font-bold text-medred-700">Batch: {med.batchNo}</div>
                    </td>
                    <td className="p-2 border-r border-slate-200 font-mono text-slate-600">{med.expDate || 'N/A'}</td>
                    <td className="p-2 border-r border-slate-200">
                      <div>{med.dose}</div>
                      <div className="text-[10px] text-slate-500">{med.route}</div>
                    </td>
                    <td className="p-2 border-r border-slate-200 text-slate-700">{med.indication || '—'}</td>
                    <td className="p-2 border-r border-slate-200 font-medium capitalize">{med.actionTaken || 'Withdrawn'}</td>
                    <td className="p-2 font-bold text-slate-800 bg-rose-50/30">{med.causalityAssessment || 'Unassessed'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section D: Reporter Details */}
        <div className="mb-6">
          <div className="bg-slate-100 border-l-4 border-medred-600 px-3 py-1.5 font-bold text-xs uppercase tracking-wide text-slate-800 mb-2">
            Section D: Healthcare Professional (Reporter) Details
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 border border-slate-200 rounded text-xs bg-slate-50/50">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Name of Reporter</span>
              <span className="font-bold text-slate-900">{data.reporter.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Professional Role</span>
              <span className="font-bold text-slate-900">{data.reporter.occupation}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Employee / License ID</span>
              <span className="font-mono font-bold text-slate-900">{data.reporter.employeeId}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Hospital & Ward</span>
              <span className="font-bold text-slate-900">{data.reporter.ward}, {data.reporter.hospital}</span>
            </div>
          </div>
        </div>

        {/* Section E: Pharmacovigilance Forwarding & Amendments Audit Trail */}
        {((data.forwardingRecords && data.forwardingRecords.length > 0) ||
          (data.amendments && data.amendments.length > 0)) && (
          <div className="pt-4 border-t-2 border-slate-200">
            <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500 mb-2">
              Official Digital Audit Trail & Forwarding Log
            </div>

            {data.forwardingRecords && data.forwardingRecords.length > 0 && (
              <div className="mb-3 space-y-1">
                {data.forwardingRecords.map((f, idx) => (
                  <div key={idx} className="p-2.5 bg-rose-50/80 border border-rose-200 rounded text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-medred-800">Forwarded to: {f.forwardedTo}</span>
                      <span className="text-slate-600 block text-[11px] mt-0.5">Notes: {f.notes}</span>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      <div>Tracking Ref: <strong>{f.referenceNo}</strong></div>
                      <div>By {f.forwardedBy} on {f.forwardedAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {data.amendments && data.amendments.length > 0 && (
              <div className="space-y-1">
                {data.amendments.map((a, idx) => (
                  <div key={idx} className="text-[11px] text-slate-600 p-2 bg-slate-50 rounded border border-slate-200 flex justify-between">
                    <span>
                      <strong>Clinical Evaluation Amendment:</strong> {a.fieldName} set to &quot;{a.newValue}&quot;
                    </span>
                    <span className="text-slate-400">
                      {a.editedBy} &bull; {a.editedAt}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-medium">
          Confidential Medical Record &bull; Generated digitally by ADRConnect Pharmacovigilance System &bull; National Coordination Centre - PvPI compliant
        </div>
      </div>
    </div>
  );
}
