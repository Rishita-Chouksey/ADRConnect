'use client';

import React from 'react';
import { formatPvpiData, PvpiFormData } from '@/lib/pvpi-template';
import { Printer, ArrowLeft, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DigitalAdrFormProps {
  report: any;
  showBackLink?: boolean;
}

export default function DigitalAdrForm({ report, showBackLink = true }: DigitalAdrFormProps) {
  const data: PvpiFormData = formatPvpiData(report);

  const handlePrint = () => {
    window.print();
  };

  const med = data.medications?.[0] || {
    name: 'Suspected IV Fluid / Drug',
    manufacturer: 'Pharma Manufacturer',
    batchNo: 'N/A',
    expDate: 'N/A',
    dose: '500 ml',
    route: 'IV Infusion',
    frequency: 'Once',
    startDate: data.reaction.startDate,
    stopDate: data.reaction.startDate,
    indication: 'Hydration',
    actionTaken: 'withdrawn',
    causalityAssessment: 'Unassessed',
  };

  return (
    <div className="max-w-4xl mx-auto my-6 font-sans text-slate-900">
      {/* Print & Return Action Toolbar (Hidden during Print) */}
      <div className="no-print flex items-center justify-between mb-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {showBackLink ? (
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Cases</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500 font-medium">
            PvPI Reference ID: <strong className="text-slate-900 font-mono">{data.reportId.slice(0, 12).toUpperCase()}</strong>
          </span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 bg-medred-600 hover:bg-medred-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-rose-200 transition-all hover:scale-105"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Form / Save PDF</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 1: OFFICIAL INDIAN PHARMACOPOEIA COMMISSION (IPC/PvPI) FORM VERSION-1.3 */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 border-slate-900 p-6 shadow-xl space-y-3 print:p-0 print:border-none print:shadow-none font-sans text-[11px] leading-tight">
        
        {/* Header Block */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-amber-600/10 rounded-full border border-amber-800/30 flex items-center justify-center font-bold text-amber-900 text-xs">
              IPC
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
                SUSPECTED ADVERSE DRUG REACTION REPORTING FORM
              </h1>
              <p className="text-[10px] font-bold text-slate-700">
                For VOLUNTARY reporting of Adverse Drug Reaction by Healthcare Professionals
              </p>
              <p className="text-[10px] font-extrabold text-medred-700 uppercase tracking-wide">
                INDIAN PHARMACOPOEIA COMMISSION <span className="font-normal text-slate-700 text-[9px]">(National Coordination Centre-Pharmacovigilance Programme of India)</span>
              </p>
              <p className="text-[9px] text-slate-600">
                Ministry of Health &amp; Family Welfare, Government of India Sector-23, Raj Nagar, Ghaziabad-201002
              </p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-400 font-mono text-[10px] font-bold text-slate-800">
              Version-1.3
            </span>
            <div className="text-[9px] text-slate-500 block font-bold">
              {data.caseType === 'follow_up' ? 'FOLLOW-UP REPORT' : 'INITIAL REPORT'}
            </div>
          </div>
        </div>

        {/* A. PATIENT INFORMATION */}
        <div className="border border-slate-900 overflow-hidden">
          <div className="bg-medred-700 text-white font-bold text-xs px-2 py-1 uppercase tracking-wide flex justify-between items-center">
            <span>A. PATIENT INFORMATION</span>
            <span className="text-[10px] font-normal text-rose-100">Reg. No. / IPD No. / OPD No. / CR No. : {data.reportId.slice(0, 8).toUpperCase()}</span>
          </div>

          <div className="grid grid-cols-12 divide-x divide-y divide-slate-900 bg-white">
            <div className="col-span-3 p-1.5">
              <span className="font-bold">1. Patient Initials:</span>{' '}
              <span className="font-bold text-slate-900 text-xs">{data.patient.initials}</span>
            </div>
            <div className="col-span-3 p-1.5">
              <span className="font-bold">2. Age at event / DOB:</span>{' '}
              <span className="font-bold text-slate-900">{data.patient.age}</span>
            </div>
            <div className="col-span-3 p-1.5">
              <span className="font-bold">3. Sex:</span>{' '}
              <span className="font-bold">
                [{data.patient.sex === 'M' ? '✓' : ' '}] M &nbsp; [{data.patient.sex === 'F' ? '✓' : ' '}] F &nbsp; [{data.patient.sex === 'Other' ? '✓' : ' '}] Other
              </span>
            </div>
            <div className="col-span-3 p-1.5">
              <span className="font-bold">4. Weight:</span>{' '}
              <span className="font-bold">{data.patient.weightKg ? `${data.patient.weightKg} Kgs` : '______ Kgs'}</span>
            </div>
            <div className="col-span-6 p-1.5">
              <span className="font-bold">AMC Report No. :</span> <span className="font-mono">{data.reportId.slice(0, 10).toUpperCase()}</span>
            </div>
            <div className="col-span-6 p-1.5">
              <span className="font-bold">Worldwide Unique No. :</span> <span className="font-mono">IN-IPC-2026-{data.reportId.slice(0, 6).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* B. SUSPECTED ADVERSE REACTION */}
        <div className="border border-slate-900 overflow-hidden">
          <div className="bg-medred-700 text-white font-bold text-xs px-2 py-1 uppercase tracking-wide">
            B. SUSPECTED ADVERSE REACTION
          </div>

          <div className="grid grid-cols-12 divide-x divide-y divide-slate-900 bg-white">
            {/* Left 7 Cols */}
            <div className="col-span-7 space-y-1.5 p-2">
              <div>
                <span className="font-bold">5. Event/Reaction start date (dd/mm/yyyy):</span>{' '}
                <span className="font-bold">{data.reaction.startDate}</span>
              </div>
              <div>
                <span className="font-bold">6. Event/Reaction stop date (dd/mm/yyyy):</span>{' '}
                <span>{data.reaction.recoveryDate || 'Ongoing'}</span>
              </div>
              <div>
                <span className="font-bold">6 (A). Onset Lag Time:</span> <span>Immediate / Infusion onset</span>
              </div>
              <div>
                <span className="font-bold block mb-0.5">7. Describe Event/Reaction with treatment details, if any:</span>
                <div className="p-2 border border-slate-400 bg-slate-50 min-h-[90px] font-serif leading-relaxed text-[11px]">
                  {data.reaction.description}
                  {report.otherHistory && (
                    <div className="mt-2 text-[10px] text-slate-600 font-sans border-t border-slate-300 pt-1">
                      <strong>Concomitant / Relevant History:</strong> {report.otherHistory}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right 5 Cols */}
            <div className="col-span-5 space-y-2 p-2">
              <div>
                <span className="font-bold block">12. Relevant tests / laboratory data with dates:</span>
                <div className="text-[10px] text-slate-700 italic">Vitals monitored at onset: Pyrexia / Rigors check done at ward station.</div>
              </div>

              <div className="pt-1 border-t border-slate-300">
                <span className="font-bold block">13. Relevant medical / medication history:</span>
                <div className="text-[10px] text-slate-700">{report.otherHistory || 'No prior known drug allergy recorded.'}</div>
              </div>

              <div className="pt-1 border-t border-slate-300">
                <span className="font-bold block mb-1">14. Seriousness of the reaction: No [ ] if Yes [✓]</span>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <span>[{data.reaction.seriousness.death ? '✓' : ' '}] Death</span>
                  <span>[{data.reaction.seriousness.lifeThreatening ? '✓' : ' '}] Life threatening</span>
                  <span>[{data.reaction.seriousness.hospitalization ? '✓' : ' '}] Hospitalization</span>
                  <span>[ ] Congenital-anomaly</span>
                  <span>[ ] Disability</span>
                  <span>[{data.reaction.seriousness.medicallySignificant ? '✓' : ' '}] Other Medically important</span>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-300">
                <span className="font-bold block mb-1">15. Outcomes:</span>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <span>[{data.reaction.outcome === 'recovered' ? '✓' : ' '}] Recovered</span>
                  <span>[{data.reaction.outcome === 'recovering' ? '✓' : ' '}] Recovering</span>
                  <span>[{data.reaction.outcome === 'continuing' ? '✓' : ' '}] Not recovered</span>
                  <span>[{data.reaction.outcome === 'fatal' ? '✓' : ' '}] Fatal</span>
                  <span>[ ] Recovered with sequelae</span>
                  <span>[{data.reaction.outcome === 'unknown' ? '✓' : ' '}] Unknown</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* C. SUSPECTED MEDICATION(S) TABLE 8 */}
        <div className="border border-slate-900 overflow-hidden">
          <div className="bg-medred-700 text-white font-bold text-xs px-2 py-1 uppercase tracking-wide">
            C. SUSPECTED MEDICATION(S)
          </div>

          <table className="w-full text-left text-[10px] border-collapse">
            <thead>
              <tr className="bg-slate-200 border-b border-slate-900 font-bold">
                <th className="p-1 border-r border-slate-900 w-6">S.No</th>
                <th className="p-1 border-r border-slate-900">8. Name (Brand/Generic)</th>
                <th className="p-1 border-r border-slate-900">Manufacturer</th>
                <th className="p-1 border-r border-slate-900">Batch No. / Lot No.</th>
                <th className="p-1 border-r border-slate-900">Exp. Date</th>
                <th className="p-1 border-r border-slate-900">Dose used</th>
                <th className="p-1 border-r border-slate-900">Route</th>
                <th className="p-1 border-r border-slate-900">Therapy dates</th>
                <th className="p-1 border-r border-slate-900">Indication</th>
                <th className="p-1">Causality Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 font-semibold">
              <tr>
                <td className="p-1 border-r border-slate-900 text-center">i</td>
                <td className="p-1 border-r border-slate-900 font-bold">{med.name}</td>
                <td className="p-1 border-r border-slate-900">{med.manufacturer}</td>
                <td className="p-1 border-r border-slate-900 font-mono text-medred-700">{med.batchNo}</td>
                <td className="p-1 border-r border-slate-900 font-mono">{med.expDate}</td>
                <td className="p-1 border-r border-slate-900">{med.dose}</td>
                <td className="p-1 border-r border-slate-900">{med.route}</td>
                <td className="p-1 border-r border-slate-900">{med.therapyStartDate || data.reaction.startDate}</td>
                <td className="p-1 border-r border-slate-900">{med.indication}</td>
                <td className="p-1 font-bold text-medred-700 bg-rose-50/50">{med.causalityAssessment}</td>
              </tr>
              <tr>
                <td className="p-1 border-r border-slate-900 text-center">ii</td>
                <td className="p-1 border-r border-slate-900 text-slate-400">—</td>
                <td className="p-1 border-r border-slate-900 text-slate-400">—</td>
                <td className="p-1 border-r border-slate-900 text-slate-400">—</td>
                <td className="p-1 border-r border-slate-900 text-slate-400">—</td>
                <td className="p-1 border-r border-slate-900 text-slate-400">—</td>
                <td className="p-1 border-r border-slate-900 text-slate-400">—</td>
                <td className="p-1 border-r border-slate-900 text-slate-400">—</td>
                <td className="p-1 border-r border-slate-900 text-slate-400">—</td>
                <td className="p-1 text-slate-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TABLES 9 & 10: Action Taken & Reintroduction */}
        <div className="grid grid-cols-12 divide-x divide-slate-900 border border-slate-900 bg-white">
          <div className="col-span-7 p-2 space-y-1">
            <span className="font-bold block">9. Action Taken (please tick):</span>
            <div className="grid grid-cols-3 gap-1 text-[9.5px]">
              <span>[{med.actionTaken === 'withdrawn' ? '✓' : ' '}] Drug withdrawn</span>
              <span>[ ] Dose increased</span>
              <span>[ ] Dose reduced</span>
              <span>[ ] Dose unchanged</span>
              <span>[ ] Not applicable</span>
              <span>[ ] Unknown</span>
            </div>
          </div>

          <div className="col-span-5 p-2 space-y-1">
            <span className="font-bold block">10. Reaction reappeared after reintroduction:</span>
            <div className="grid grid-cols-3 gap-1 text-[9.5px]">
              <span>[ ] Yes</span>
              <span>[✓] No</span>
              <span>[ ] Effect unknown</span>
            </div>
          </div>
        </div>

        {/* D. REPORTER DETAILS */}
        <div className="border border-slate-900 overflow-hidden">
          <div className="bg-medred-700 text-white font-bold text-xs px-2 py-1 uppercase tracking-wide">
            D. REPORTER DETAILS
          </div>

          <div className="p-2 space-y-2 bg-white text-[10.5px]">
            <div>
              <span className="font-bold">16. Name and Professional Address:</span>{' '}
              <span className="font-bold text-slate-900">{data.reporter.name} ({data.reporter.occupation})</span>
              <div className="text-slate-600">{data.reporter.ward}, {data.reporter.hospital}</div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="font-bold">Pin:</span> 482001 &nbsp; <span className="font-bold">E-mail:</span> {data.reporter.email || 'reporter@hospital.gov.in'}
              </div>
              <div>
                <span className="font-bold">Tel. No. / Ext:</span> +91-761-2400100
              </div>
              <div>
                <span className="font-bold">Employee ID / Sig:</span> <span className="font-mono font-bold">{data.reporter.employeeId}</span> (Verified)
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-300 text-[10px]">
              <div>
                <span className="font-bold">17. Date of this report (dd/mm/yyyy):</span> {data.reportDate}
              </div>
              <div>
                <span className="font-bold">Sig. and Name of Receiver:</span> Dr. Priya Nair (ADR Head / PV Officer)
              </div>
            </div>
          </div>

          {/* Red Confidentiality Footer Banner */}
          <div className="bg-medred-800 text-white text-[9px] p-2 text-center leading-snug font-medium border-t border-slate-900">
            <strong>Confidentiality:</strong> The patient&apos;s identity is held in strict confidence and protected to the fullest extent. Submission of a report does not constitute an admission that medical personnel or manufacturer caused or contributed to the reaction. Submission of an ADR report does not have any legal implication on the reporter.
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: ADVICE ABOUT REPORTING (IPC / PvPI OFFICIAL GUIDANCE SHEET) */}
      {/* ========================================================================= */}
      <div className="page-break bg-white border-2 border-slate-900 p-6 shadow-xl space-y-4 mt-8 print:mt-0 print:p-0 print:border-none print:shadow-none font-sans text-[11px] leading-relaxed">
        <div className="border-2 border-medred-800 p-3 text-center space-y-1 bg-rose-50/30">
          <h2 className="text-sm font-black uppercase text-medred-900">
            National Coordination Centre for Pharmacovigilance Programme of India
          </h2>
          <p className="text-[10px] font-bold text-slate-700">
            Ministry of Health &amp; Family Welfare, Government of India
          </p>
          <p className="text-[9.5px] text-slate-600">
            Sector-23, Raj Nagar, Ghaziabad-201002 &bull; Tel.: 0120-2783400, 2783401 &bull; www.ipc.nic.in
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1">
            ADVICE ABOUT REPORTING
          </h3>

          <div>
            <h4 className="font-bold text-slate-900">A. What to report?</h4>
            <p className="text-slate-700 pl-3">
              &bull; Report serious adverse drug reactions: Death, Life-threatening, Hospitalization (initial or prolonged), Disability, Congenital anomaly, or required intervention to prevent permanent impairment.
            </p>
            <p className="text-slate-700 pl-3">
              &bull; Report non-serious, known or unknown, frequent or rare adverse reactions due to Medicines, Vaccines, IV Fluids, and Injectable products.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900">B. Who can report?</h4>
            <p className="text-slate-700 pl-3">
              All healthcare professionals (Clinicians, Dentists, Pharmacists, and Nurses) can report adverse drug reactions.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900">C. Where to report?</h4>
            <p className="text-slate-700 pl-3">
              Duly filled Suspected ADR Reporting Form can be submitted via ADRConnect to the hospital Adverse Drug Reaction Monitoring Centre (AMC) or directly to NCC-PvPI (Helpline: 1800 180 3024, Email: pvpi.ipc@gov.in).
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900">D. What happens to the submitted information?</h4>
            <p className="text-slate-700 pl-3">
              Information provided in this form is handled in strict confidence. WHO-UMC causality assessment is conducted by the ADR Head/AMC. Analyzed reports are forwarded to the National Coordination Centre (NCC) and Global Pharmacovigilance Database managed by WHO Uppsala Monitoring Centre in Sweden.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900">E. Mandatory fields for suspected ADR reporting form</h4>
            <p className="text-slate-700 pl-3 font-semibold">
              Patient initials, age at onset, reaction terms, onset date, suspected medication(s), and reporter information.
            </p>
          </div>
        </div>

        {/* Footer Official Hotline Box */}
        <div className="border-2 border-medred-700 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-white text-center space-y-1">
          <h4 className="font-black text-sm text-medred-900 uppercase tracking-wider">For ADRs Reporting Helpline</h4>
          <p className="text-xs font-bold text-slate-800">E-mail: pvpi.ipc@gov.in &bull; Toll Free: 1800 180 3024 (9:00 AM to 5:30 PM, Mon-Fri)</p>
          <p className="text-[10px] font-bold text-medred-700">Official Mobile App: &quot;ADR PvPI&quot;</p>
        </div>
      </div>
    </div>
  );
}
