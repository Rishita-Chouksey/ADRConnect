'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/lib/RoleContext';
import { Activity, ShieldCheck, ArrowRight, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { switchRole } = useRole();
  const [employeeId, setEmployeeId] = useState('N-1001');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Map employee ID to role
    if (employeeId.startsWith('N-')) {
      switchRole('nurse');
      router.push('/nurse');
    } else if (employeeId.startsWith('AH-')) {
      switchRole('adr_head');
      router.push('/adr-head');
    } else {
      switchRole('admin');
      router.push('/admin');
    }
  };

  const handleQuickLogin = (role: 'nurse' | 'adr_head' | 'admin', empId: string) => {
    setEmployeeId(empId);
    switchRole(role);
    router.push(role === 'nurse' ? '/nurse' : role === 'adr_head' ? '/adr-head' : '/admin');
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-medred-600 text-white flex items-center justify-center mx-auto shadow-md shadow-rose-200">
          <Activity className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">ADRConnect Login</h1>
        <p className="text-xs text-slate-500">
          Hospital Pharmacovigilance &amp; Batch Traceability Platform
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Employee / Staff ID</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. N-1001, AH-2001, AD-3001"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-medred-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-medred-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-medred-600 hover:bg-medred-700 text-white font-bold rounded-xl shadow-md shadow-rose-200 transition-all text-xs"
        >
          {loading ? 'Authenticating...' : 'Sign In to Hospital Station'}
        </button>
      </form>

      {/* Quick Evaluation Logins */}
      <div className="pt-4 border-t border-slate-100 space-y-2 text-center">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Or 1-Click Fast Sign-In:
        </span>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => handleQuickLogin('nurse', 'N-1001')}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-medred-700 border border-rose-200 font-semibold"
          >
            👩‍⚕️ Nurse
          </button>
          <button
            onClick={() => handleQuickLogin('adr_head', 'AH-2001')}
            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold"
          >
            🩺 ADR Head
          </button>
          <button
            onClick={() => handleQuickLogin('admin', 'AD-3001')}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold"
          >
            ⚙️ Admin
          </button>
        </div>
      </div>
    </div>
  );
}
