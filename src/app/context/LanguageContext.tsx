/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'th';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionary: Record<Language, Record<string, string>> = {
  en: {
    joinEcosystem: "Join the Ecosystem",
    enterEmail: "Enter your email to create a unified account",
    emailLabel: "Email address",
    btnContinue: "Continue with Email",
    verifyEmail: "Verify your email",
    codeSent: "We sent a verification code to",
    btnVerify: "Verify Code",
    didNotReceive: "Didn't receive the code?",
    resendBtn: "Resend Code",
    backToEmail: "Back to Email",
    editProfileTitle: "Set Up Profile",
    editProfileSub: "Complete your account registration details",
    displayName: "Display Name",
    birthday: "Birthday (Optional)",
    lifestyle: "Lifestyle & Interests",
    saveChanges: "Complete Registration",
    successTitle: "Account Created",
    successDesc: "Your unified account is verified and ready for live discovery deployment.",
    testAgain: "Test Registration Again"
  },
  th: {
    joinEcosystem: "เข้าสู่ระบบนิเวศ DailyStack",
    enterEmail: "กรอกอีเมลของคุณเพื่อสร้างบัญชีเครือข่ายร่วม",
    emailLabel: "ที่อยู่อีเมล",
    btnContinue: "ดำเนินการต่อด้วยอีเมล",
    verifyEmail: "ยืนยันรหัสอีเมล",
    codeSent: "ระบบได้จัดส่งรหัสยืนยันไปที่",
    btnVerify: "ยืนยันรหัส OTP",
    didNotReceive: "ไม่ได้รับรหัสยืนยันใช่ไหม",
    resendBtn: "ส่งรหัสใหม่อีกครั้ง",
    backToEmail: "กลับไปแก้ไขอีเมล",
    editProfileTitle: "ตั้งค่าโปรไฟล์สมาชิก",
    editProfileSub: "กรุณากรอกข้อมูลเพื่อลงทะเบียนบัญชีส่วนบุคคลของคุณ",
    displayName: "ชื่อที่ใช้แสดงผล",
    birthday: "วันเกิด (ไม่บังคับ)",
    lifestyle: "ไลฟ์สไตล์และความสนใจ",
    saveChanges: "เสร็จสิ้นการลงทะเบียน",
    successTitle: "สร้างบัญชีสำเร็จ",
    successDesc: "บัญชีเครือข่ายร่วมของคุณได้รับการยืนยันและพร้อมใช้งานในระบบนิเวศแล้วครับ",
    testAgain: "ทดสอบการลงทะเบียนอีกครั้ง"
  }
};

export const LanguageProvider = ({ children }: React.PropsWithChildren) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return dictionary[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};