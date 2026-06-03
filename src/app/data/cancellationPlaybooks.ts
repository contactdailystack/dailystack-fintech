// Cancellation playbooks — legally-researched Thai consumer rights
// Source: พ.ร.บ. คุ้มครองผู้บริโภค, ประกาศ คณะกรรมการคุ้มครองผู้บริโภค เรื่องหลักเกณฑ์การจัดการข้อร้องเรียน (ฉบับที่ 2)
// Keep this file as the single source of truth for cancellation info.

export interface PlaybookContactInfo {
  channel: string;
  details: string;
  hours?: string;
  phone?: string;
  url?: string;
}

export interface Playbook {
  provider_name: string;
  category: string;
  notice_period_days: number;
  cancellation_method: string;
  required_documents: string[];
  estimated_duration: string;
  penalty_information: string;
  contact_information: PlaybookContactInfo;
}

export const CANCELLATION_PLAYBOOKS: Record<string, Playbook> = {
  'Premium Gym Club': {
    provider_name: 'Premium Gym Club',
    category: 'Health & Fitness',
    notice_period_days: 30,
    cancellation_method: 'ติดต่อยื่นคำร้องด้วยตนเอง ณ คลับสาขาที่สมัครสมาชิก',
    required_documents: ['บัตรสมาชิก (Physical หรือ Digital Card)', 'บัตรประจำตัวประชาชน'],
    estimated_duration: '30 วัน (มีผลในรอบบิลถัดไปหลังจากได้รับการยืนยัน)',
    penalty_information: 'หากยกเลิกก่อนครบกำหนดตามสัญญา (สัญญา 12 เดือน) มีค่าธรรมเนียมยกเลิกก่อนกำหนด 3,000 บาท ยกเว้นกรณีเจ็บป่วย/ประสบอุบัติเหตุที่ไม่สามารถออกกำลังกายได้ตามความเห็นแพทย์ (ต้องใช้ใบรับรองแพทย์จากโรงพยาบาล) หรือศูนย์บริการไม่สามารถเปิดให้บริการได้ติดต่อกันเกิน 7 วัน ตามประกาศควบคุมธุรกิจฟิตเนส สคบ. พ.ศ. 2554',
    contact_information: {
      channel: 'ฝ่ายบริการลูกค้าประจำสาขา (Customer Service)',
      details: 'กรุณาเดินทางไปติดต่อ ณ คลับสาขาที่ท่านลงนามสมัครใช้บริการ เพื่อทำการกรอกแบบฟอร์มยืนยันตัวตน',
      phone: 'ติดต่อสาขาที่สมัครโดยตรง',
      hours: 'จันทร์ - ศุกร์ 06:00 - 22:00 น. / เสาร์ - อาทิตย์ 08:00 - 22:00 น.'
    }
  },
  'Netflix Premium': {
    provider_name: 'Netflix Premium',
    category: 'Entertainment',
    notice_period_days: 0,
    cancellation_method: 'กดยกเลิกออนไลน์ผ่านทางเว็บเบราว์เซอร์หรือแอปพลิเคชัน',
    required_documents: ['ไม่มีเอกสารหลักฐานที่ต้องยื่น'],
    estimated_duration: 'มีผลทันที (ท่านสามารถรับชมต่อได้จนกว่าจะสิ้นสุดรอบการคิดเงินปัจจุบัน)',
    penalty_information: 'ไม่มีค่าปรับหรือข้อผูกมัดสัญญาใดๆ สามารถยกเลิกและเปิดใช้งานใหม่ได้ทุกเมื่อ',
    contact_information: {
      channel: 'Netflix Help Center',
      details: 'กดยกเลิกที่เมนู บัญชี > ยกเลิกสมาชิก บนเว็บไซต์หลัก',
      url: 'https://netflix.com/youraccount'
    }
  },
  'Spotify Duo': {
    provider_name: 'Spotify Duo',
    category: 'Entertainment',
    notice_period_days: 0,
    cancellation_method: 'กดยกเลิกผ่านหน้าจัดการบัญชีบนเว็บไซต์',
    required_documents: ['ไม่มีเอกสารหลักฐานที่ต้องยื่น'],
    estimated_duration: 'มีผลทันที เมื่อครบรอบบิลระบบจะปรับสถานะเป็นบัญชีทั่วไป (Free) โดยไม่มีค่าใช้จ่าย',
    penalty_information: 'ไม่มีค่าปรับหรือข้อผูกมัด สามารถกดยกเลิกสิทธิ์พรีเมียมเพื่อหยุดการเรียกเก็บเงินได้ตลอดเวลา',
    contact_information: {
      channel: 'Spotify Account Settings',
      details: 'เข้าเว็บไซต์หลัก ไปที่โปรไฟล์ > บัญชี > แผนบริการของคุณ > เปลี่ยนแผนบริการ > ยกเลิกพรีเมียม',
      url: 'https://accounts.spotify.com'
    }
  },
  'ChatGPT Plus': {
    provider_name: 'ChatGPT Plus',
    category: 'Productivity',
    notice_period_days: 1,
    cancellation_method: 'กดยกเลิกแผนบริการผ่าน Stripe Billing Portal',
    required_documents: ['ไม่มีเอกสารหลักฐานที่ต้องยื่น'],
    estimated_duration: 'มีผลทันที (ต้องดำเนินการก่อนครบกำหนดตัดเงินอย่างน้อย 24 ชั่วโมง)',
    penalty_information: 'ไม่มีค่าปรับ ต้องกดยกเลิกล่วงหน้า 24 ชั่วโมงก่อนถึงกำหนดต่ออายุเพื่อระงับการเรียกชำระค่าบริการรอบถัดไป',
    contact_information: {
      channel: 'OpenAI Billing Settings',
      details: 'เข้าหน้าเว็บ ChatGPT ไปที่ Settings > My Plan > Manage my subscription เพื่อเปิดหน้าต่าง Stripe Customer Portal และกดยกเลิกแผนบริการ',
      url: 'https://chatgpt.com'
    }
  }
};
