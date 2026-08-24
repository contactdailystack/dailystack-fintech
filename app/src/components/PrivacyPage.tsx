/**
 * ============================================================
 * DailyStack — Privacy & Security Page
 * ============================================================
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, Lock, Eye, EyeOff, Download, Trash2, LogOut } from 'lucide-react';
import { Language } from '../data/translations';

interface PrivacyPageProps {
  onBack: () => void;
  onLogout: () => void;
  lang: Language;
}

export default function PrivacyPage({ onBack, onLogout, lang }: PrivacyPageProps) {
  const [showBalance, setShowBalance] = useState(true);

  const settings = [
    {
      id: 'hideBalance',
      label: lang === 'th' ? 'ซ่อนยอดเงิน' : 'Hide Balance',
      sublabel: lang === 'th' ? 'ปิดบังยอดในหน้าหลัก' : 'Hide balance on main screen',
      icon: showBalance ? Eye : EyeOff,
      value: showBalance,
      onChange: () => setShowBalance(!showBalance),
    },
    {
      id: 'biometric',
      label: lang === 'th' ? 'ล็อกด้วยลายนิ้วมือ' : 'Biometric Lock',
      sublabel: lang === 'th' ? 'ใช้ลายนิ้วมือเพื่อเข้าถึง' : 'Use fingerprint to access app',
      icon: Lock,
      value: false,
      onChange: () => {},
    },
    {
      id: 'autoLock',
      label: lang === 'th' ? 'ล็อกอัตโนมัติ' : 'Auto Lock',
      sublabel: lang === 'th' ? 'ล็อกหลังไม่ใช้งาน 5 นาที' : 'Lock after 5 min of inactivity',
      icon: Shield,
      value: true,
      onChange: () => {},
    },
  ];

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <div className="flex items-center px-4 pt-12 pb-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <h1 
          className="flex-1 text-center text-lg font-bold text-black mr-10"
          style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}
        >
          {lang === 'th' ? 'ความเป็นส่วนตัว' : 'Privacy & Security'}
        </h1>
      </div>

      {/* Privacy Settings */}
      <div className="px-4 pb-6">
        <h3 
          className="text-sm font-semibold text-gray-500 uppercase mb-3"
          style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}
        >
          {lang === 'th' ? 'การตั้งค่าความเป็นส่วนตัว' : 'Privacy Settings'}
        </h3>
        
        <div className="space-y-3">
          {settings.map((setting) => (
            <div 
              key={setting.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white">
                  <setting.icon className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-black font-semibold text-sm">{setting.label}</p>
                  <p className="text-gray-500 text-xs">{setting.sublabel}</p>
                </div>
              </div>
              
              <button
                onClick={setting.onChange}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  setting.value ? 'bg-[#56be89]' : 'bg-gray-300'
                }`}
              >
                <div 
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    setting.value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="px-4 pb-6">
        <h3 
          className="text-sm font-semibold text-gray-500 uppercase mb-3"
          style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}
        >
          {lang === 'th' ? 'จัดการข้อมูล' : 'Data Management'}
        </h3>
        
        <div className="space-y-3">
          <button 
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white">
                <Download className="w-5 h-5 text-black" />
              </div>
              <div className="text-left">
                <p className="text-black font-semibold text-sm">
                  {lang === 'th' ? 'ดาวน์โหลดข้อมูล' : 'Download Data'}
                </p>
                <p className="text-gray-500 text-xs">
                  {lang === 'th' ? 'รับสำเนาข้อมูลของคุณ' : 'Get a copy of your data'}
                </p>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <button 
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-left">
                <p className="text-red-500 font-semibold text-sm">
                  {lang === 'th' ? 'ลบข้อมูล' : 'Delete Data'}
                </p>
                <p className="text-gray-500 text-xs">
                  {lang === 'th' ? 'ลบข้อมูลทั้งหมดของคุณ' : 'Delete all your data'}
                </p>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        </div>
      </div>

      {/* Security Info */}
      <div className="px-4 pb-6">
        <div 
          className="p-4 rounded-2xl"
          style={{ backgroundColor: 'rgba(86, 190, 137, 0.1)' }}
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 mt-0.5" style={{ color: '#56be89' }} />
            <div>
              <p className="text-black font-semibold text-sm mb-1">
                {lang === 'th' ? 'ข้อมูลของคุณปลอดภัย' : 'Your Data is Secure'}
              </p>
              <p className="text-gray-600 text-xs">
                {lang === 'th' 
                  ? 'เราเข้ารหัสข้อมูลทั้งหมดด้วย AES-256 และไม่เปิดเผยข้อมูลของคุณแก่บุคคลที่สาม'
                  : 'We encrypt all data with AES-256 and never share your information with third parties.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-4">
        <button 
          onClick={onLogout}
          className="w-full py-4 rounded-full flex items-center justify-center gap-2"
          style={{ backgroundColor: '#FEE2E2' }}
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="font-bold text-red-500">
            {lang === 'th' ? 'ออกจากระบบ' : 'Log Out'}
          </span>
        </button>
      </div>
    </div>
  );
}
