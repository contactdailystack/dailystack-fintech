/**
 * ============================================================
 * DailyStack — Alerts Page Wrapper
 * ============================================================
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Language } from '../data/translations';
import AlertsPageContent from './AlertsPage';

interface AlertsPageWrapperProps {
  onBack: () => void;
  lang: Language;
}

export default function AlertsPageWrapper({ onBack, lang }: AlertsPageWrapperProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050D1F' }}>
      {/* Header */}
      <div className="flex items-center px-4 pt-12 pb-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1A1D17' }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 
          className="flex-1 text-center text-lg font-bold text-white mr-10"
          style={{ fontFamily: lang === 'th' ? '"Noto Sans Thai", sans-serif' : '"Inter", sans-serif' }}
        >
          {lang === 'th' ? 'การแจ้งเตือน' : 'Notifications'}
        </h1>
      </div>

      {/* Alerts Content */}
      <AlertsPageContent />
    </div>
  );
}
