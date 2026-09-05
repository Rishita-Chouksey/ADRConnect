'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEMO_ACCOUNTS } from '@/lib/types';
import { Users, ArrowLeft, Shield, Search, Mail, Phone, Building2 } from 'lucide-react';

export default function AdrHeadStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/reports')
      .then(() => setStaff(DEMO_ACCOUNTS))
      .catch(() => setStaff(DEMO_ACCOUNTS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = staff.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.employeeId.toLowerCase().includes(q) || s.role.toLowerCase().includes(q) || (s.ward && s.ward.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Link href="/adr-head" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900">Hospital Staff &amp; Reporter Directory</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Clinical case reporter contacts, ward nursing stations, and pharmacovigilance coordination directory.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search staff, employee ID, ward..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500 font-medium"
          />
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {filtered.map((user) => {
          const isNurse = user.role === 'nurse';
          const isAdr = user.role === 'adr_head';

          return (
            <div
              key={user.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-sm">
                  {user.name.split(' ').map((n: string) => n[0]).join('')}
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isNurse
                      ? 'bg-rose-100 text-rose-800'
                      : isAdr
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {user.role.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900">{user.name}</h3>
                <div className="text-xs text-slate-500">{user.occupation || 'Hospital Staff'}</div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Employee ID:</span>
                  <strong className="font-mono text-slate-800">{user.employeeId}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Ward:</span>
                  <span className="font-medium text-slate-800">{user.ward || 'Central'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email Contact:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[160px]">{user.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
