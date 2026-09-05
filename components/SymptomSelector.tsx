'use client';

import React from 'react';
import { COMMON_SYMPTOMS } from '@/lib/types';
import { Sparkles, Plus, Check } from 'lucide-react';

interface SymptomSelectorProps {
  currentText: string;
  onChange: (newText: string) => void;
}

export default function SymptomSelector({ currentText, onChange }: SymptomSelectorProps) {
  const isSelected = (symptom: string) => {
    return currentText.toLowerCase().includes(symptom.toLowerCase());
  };

  const toggleSymptom = (symptom: string) => {
    if (isSelected(symptom)) {
      // Remove symptom regex match cleanly
      const regex = new RegExp(`(^|,\\s*|\\n\\s*)${symptom}(?:,\\s*|\\.\\s*)?`, 'gi');
      let cleaned = currentText.replace(regex, '$1').trim();
      // clean trailing/leading punctuation
      cleaned = cleaned.replace(/^,\s*/, '').replace(/,\s*,/g, ',').trim();
      onChange(cleaned);
    } else {
      if (!currentText.trim()) {
        onChange(`Patient presented with ${symptom.toLowerCase()}`);
      } else {
        onChange(`${currentText.trim()}, ${symptom.toLowerCase()}`);
      }
    }
  };

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-medred-600" />
          <span>Smart Standardized Symptom Suggestions (Click to Add / Remove):</span>
        </label>
        <span className="text-[11px] text-slate-400">PvPI Standard Terms</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {COMMON_SYMPTOMS.map((symptom) => {
          const active = isSelected(symptom);
          return (
            <button
              type="button"
              key={symptom}
              onClick={() => toggleSymptom(symptom)}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                active
                  ? 'bg-medred-600 text-white shadow-sm ring-2 ring-rose-200 ring-offset-1'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {active ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3 h-3 text-slate-400" />}
              <span>{symptom}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
