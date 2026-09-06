'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Building2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export const DEFAULT_WARDS = [
  'ICU',
  'CCU',
  'Emergency Ward',
  'General Medicine',
  'General Surgery',
  'Pediatrics',
  'Orthopedics',
  'Gynecology',
  'Oncology',
  'Neurology',
  'Cardiology',
  'Nephrology',
  'ENT',
  'Dermatology',
  'Pulmonology',
  'Other',
];

interface WardSelectProps {
  value: string;
  onChange: (ward: string) => void;
  className?: string;
}

export default function WardSelect({ value, onChange, className = '' }: WardSelectProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustom, setIsCustom] = useState(
    value ? !DEFAULT_WARDS.includes(value) || value === 'Other' : false
  );
  const [customWard, setCustomWard] = useState(
    value && (!DEFAULT_WARDS.includes(value) || value === 'Other') ? value : ''
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredWards = DEFAULT_WARDS.filter((ward) =>
    ward.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (ward: string) => {
    if (ward === 'Other') {
      setIsCustom(true);
      onChange(customWard || 'Custom Ward');
    } else {
      setIsCustom(false);
      onChange(ward);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomWard(val);
    onChange(val || 'Other');
  };

  const displayLabel = isCustom
    ? customWard
      ? `Other (${customWard})`
      : 'Other (Custom Entry)'
    : value || t('form.ward_select_placeholder', 'Select hospital ward...');

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Selector Trigger Button */}
      <div className="space-y-2">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 cursor-pointer shadow-sm hover:border-medred-500 transition-colors"
        >
          <div className="flex items-center space-x-2 truncate">
            <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">{displayLabel}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </div>

        {/* Custom Input Field if "Other" is active */}
        {isCustom && (
          <input
            type="text"
            value={customWard}
            onChange={handleCustomChange}
            placeholder="Type custom ward name..."
            className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-medred-400 dark:border-medred-600 bg-rose-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-medred-500 animate-in fade-in duration-150"
            autoFocus
          />
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('common.search', 'Search ward...')}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-medred-500 text-slate-800 dark:text-slate-100"
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
            {filteredWards.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">No ward matching search</div>
            ) : (
              filteredWards.map((ward) => {
                const isSelected =
                  (ward === 'Other' && isCustom) || (!isCustom && value === ward);

                return (
                  <button
                    key={ward}
                    type="button"
                    onClick={() => handleSelect(ward)}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-md font-medium flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-medred-700 dark:text-rose-300 font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{ward}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-medred-600 dark:text-rose-400" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
