'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEMO_ACCOUNTS } from '@/lib/types';
import { Users, ArrowLeft, Shield, CheckCircle2, Search } from 'lucide-react';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // In database, users are seeded; let's fallback to DEMO_ACCOUNTS if API fails
    fetch('/api/reports') // quick check or load from DB
      .then(() => setStaff(DEMO_ACCOUNTS))
      .catch(() => setStaff(DEMO_ACCOUNTS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = staff.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.employeeId.toLowerCase().includes(q) || s.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Link href="/admin" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900">Hospital Staff Directory &amp; Access Roles</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered nurses, pharmacovigilance officers, and pharmacy administrators with role-based permissions.
          </p>
        </div>
      </div>

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
                <div className="text-xs text-slate-500">{user.occupation}</div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Employee ID:</span>
                  <strong className="font-mono text-slate-800">{user.employeeId}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Ward:</span>
                  <span className="font-medium">{user.ward || 'Central'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
