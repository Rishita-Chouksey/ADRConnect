'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Activity, ShieldCheck, Lock, User, CheckCircle2, AlertCircle, ArrowRight, Building2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('N-1001');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'nurse' | 'adr_head' | 'admin'>('nurse');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleSelect = (selectedRole: 'nurse' | 'adr_head' | 'admin') => {
    setRole(selectedRole);
    if (selectedRole === 'nurse') setEmployeeId('N-1001');
    else if (selectedRole === 'adr_head') setEmployeeId('AH-2001');
    else if (selectedRole === 'admin') setEmployeeId('AD-3001');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      setErrorMsg('Please enter valid Employee / Staff ID');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        employeeId: employeeId.trim(),
        password: password.trim(),
      });

      if (res?.error) {
        throw new Error('Authentication failed. Please check Employee ID.');
      }

      // Redirect to respective portal
      if (employeeId.startsWith('N-')) router.push('/nurse');
      else if (employeeId.startsWith('AH-')) router.push('/adr-head');
      else router.push('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      {/* Bhavishya Government Portal Header Banner */}
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Emblem & Top Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-medred-900 text-white p-6 text-center space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
            <Building2 className="w-3.5 h-3.5 text-rose-300" />
            <span>Indian Pharmacovigilance Programme (PvPI) &bull; CDSCO Aligned</span>
          </div>
          <div className="flex items-center justify-center space-x-3 pt-1">
            <div className="w-10 h-10 rounded-xl bg-medred-600 text-white flex items-center justify-center font-black text-xl shadow-md">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black tracking-tight text-white">ADRConnect</h1>
              <p className="text-[11px] text-slate-300 font-medium">District Maternal Hospital Vigilance Station</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Role Selection Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider text-center">
              Select Operating Role:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('nurse')}
                className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all flex flex-col items-center space-y-1 ${
                  role === 'nurse'
                    ? 'bg-rose-50 border-medred-600 text-medred-900 shadow-sm ring-2 ring-medred-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">👩‍⚕️</span>
                <span>Staff Nurse</span>
                <span className="text-[9px] font-normal text-slate-400">N-1001</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('adr_head')}
                className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all flex flex-col items-center space-y-1 ${
                  role === 'adr_head'
                    ? 'bg-rose-50 border-medred-600 text-medred-900 shadow-sm ring-2 ring-medred-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">🩺</span>
                <span>ADR Head</span>
                <span className="text-[9px] font-normal text-slate-400">AH-2001</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all flex flex-col items-center space-y-1 ${
                  role === 'admin'
                    ? 'bg-rose-50 border-medred-600 text-medred-900 shadow-sm ring-2 ring-medred-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">⚙️</span>
                <span>Admin</span>
                <span className="text-[9px] font-normal text-slate-400">AD-3001</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-medred-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Official Staff / Employee ID <span className="text-medred-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. N-1001, AH-2001, AD-3001"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-medred-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Passcode / Access Key</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-medred-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-medred-600 hover:bg-medred-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition-all text-xs flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating Credentials...' : 'Secure Sign-In to Station'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Hospital Station SSO Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
