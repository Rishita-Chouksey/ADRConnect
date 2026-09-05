'use client';

import React from 'react';
import Link from 'next/link';
import { Users, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function AdminStaffPage() {
  return (
    <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
        <ShieldAlert className="w-6 h-6" />
      </div>

      <h1 className="text-xl font-bold text-slate-900">Module Relocated</h1>
      <p className="text-xs text-slate-600 leading-relaxed">
        The Staff Directory module has been relocated to the <strong>ADR Head Portal</strong> for clinical case investigation and reporter coordination purposes.
      </p>

      <div className="pt-2">
        <Link
          href="/admin"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Admin Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
