'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DigitalAdrForm from '@/components/DigitalAdrForm';
import { Activity } from 'lucide-react';

export default function DedicatedPvpiFormPage() {
  const params = useParams();
  const id = params?.id as string;
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/reports/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Report not found');
        return res.json();
      })
      .then((data) => setReport(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-slate-400">
        <Activity className="w-8 h-8 text-medred-600 animate-spin mx-auto mb-2" />
        <span>Compiling Official PvPI Digital ADR Reporting Form...</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-16 text-center text-xs text-rose-600 font-bold">
        Error loading report: {error || 'Not found'}
      </div>
    );
  }

  return <DigitalAdrForm report={report} showBackLink={true} />;
}
