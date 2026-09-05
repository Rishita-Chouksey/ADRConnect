'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Upload, Download, CheckCircle2, ArrowLeft, Trash2, Eye, ShieldCheck, FileCheck } from 'lucide-react';

interface PdfDoc {
  id: string;
  name: string;
  category: string;
  version: string;
  uploadedAt: string;
  size: string;
  isDefault: boolean;
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<PdfDoc[]>([
    {
      id: 'doc-1',
      name: 'PvPI_Official_Suspected_ADR_Reporting_Form_v1.4.pdf',
      category: 'PvPI / CDSCO National Format',
      version: 'v1.4 (2026 Edition)',
      uploadedAt: '2026-08-15',
      size: '1.2 MB',
      isDefault: true,
    },
    {
      id: 'doc-2',
      name: 'Hospital_IV_Fluid_Adverse_Event_Protocol.pdf',
      category: 'Hospital Internal Guidelines',
      version: 'v2.0',
      uploadedAt: '2026-07-20',
      size: '850 KB',
      isDefault: false,
    },
  ]);

  const [newFileTitle, setNewFileTitle] = useState('');
  const [category, setCategory] = useState('PvPI / CDSCO National Format');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileTitle.trim()) return;

    const newDoc: PdfDoc = {
      id: `doc-${Date.now()}`,
      name: `${newFileTitle.trim().replace(/\s+/g, '_')}.pdf`,
      category,
      version: 'v1.0 (Uploaded)',
      uploadedAt: new Date().toISOString().slice(0, 10),
      size: '950 KB',
      isDefault: false,
    };

    setDocuments([newDoc, ...documents]);
    setNewFileTitle('');
    setSuccessMsg('Official ADR Reporting Form PDF template uploaded successfully!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSetDefault = (id: string) => {
    setDocuments(documents.map((d) => ({ ...d, isDefault: d.id === id })));
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Link href="/admin" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900">Official ADR Reporting Forms &amp; Templates</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Upload and manage official Indian Pharmacovigilance Programme (PvPI) / CDSCO PDF forms for hospital staff download.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Upload Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Upload className="w-5 h-5 text-medred-600" />
          <h2 className="text-base font-bold text-slate-900">Upload Official PDF Form Template</h2>
        </div>

        <form onSubmit={handleSimulateUpload} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Document Title / Standard Name *</label>
              <input
                type="text"
                placeholder="e.g. Official_PvPI_ADR_Form_2026"
                value={newFileTitle}
                onChange={(e) => setNewFileTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Regulatory Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
              >
                <option value="PvPI / CDSCO National Format">PvPI / CDSCO National Format</option>
                <option value="Hospital Internal Guidelines">Hospital Internal Guidelines</option>
                <option value="Medical Device Vigilance">Medical Device Vigilance</option>
              </select>
            </div>
          </div>

          <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center space-y-1">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-700 text-xs">Drag and drop official PDF document here</p>
            <p className="text-[10px] text-slate-400">Supports PDF format up to 10 MB</p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-medred-600 hover:bg-medred-700 text-white font-bold text-xs shadow-md shadow-rose-200"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Official PDF Form</span>
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">Active Official Reporting Form Repository</h2>
          <p className="text-xs text-slate-500">Official PDFs available to Nurses &amp; ADR Head for digital attaching &amp; print</p>
        </div>

        <div className="divide-y divide-slate-100">
          {documents.map((doc) => (
            <div key={doc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-start space-x-3">
                <div className="p-3 rounded-xl bg-rose-50 text-medred-600 border border-rose-200">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{doc.name}</span>
                    {doc.isDefault && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Default Official Form
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Category: <strong>{doc.category}</strong> &bull; Version: {doc.version} &bull; Size: {doc.size}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {!doc.isDefault && (
                  <button
                    onClick={() => handleSetDefault(doc.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100"
                  >
                    Set Default
                  </button>
                )}
                <a
                  href={`#download-${doc.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Downloading official PDF template: ${doc.name}`);
                  }}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete Template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
