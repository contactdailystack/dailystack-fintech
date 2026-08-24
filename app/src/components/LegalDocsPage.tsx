import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Language } from '../data/translations';

interface LegalDocsPageProps {
  doc: 'privacy' | 'terms';
  onBack: () => void;
  lang: Language;
}

const EFFECTIVE_DATE_EN = 'Last updated: 24 August 2026';
const EFFECTIVE_DATE_TH = 'อัปเดตล่าสุด: 24 สิงหาคม 2569';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-5">
    <h2 className="text-[14px] font-bold mb-1.5" style={{ color: '#E0F2FC' }}>{title}</h2>
    <div className="text-[13px] leading-relaxed space-y-1.5" style={{ color: 'rgba(224,242,252,0.75)' }}>
      {children}
    </div>
  </section>
);

export default function LegalDocsPage({ doc, onBack, lang }: LegalDocsPageProps) {
  const th = lang === 'th';

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: '#071838' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 flex items-center gap-3"
        style={{ backgroundColor: '#071838', borderBottom: '1px solid rgba(224,242,252,0.08)' }}>
        <button
          onClick={onBack}
          aria-label={th ? 'ย้อนกลับ' : 'Back'}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          style={{ backgroundColor: 'rgba(224,242,252,0.1)', color: '#E0F2FC' }}
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h1 className="text-[15px] font-bold leading-tight" style={{ color: '#E0F2FC' }}>
            {doc === 'privacy' ? (th ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy') : (th ? 'ข้อกำหนดการใช้บริการ' : 'Terms of Service')}
          </h1>
          <p className="text-[11px]" style={{ color: 'rgba(224,242,252,0.5)' }}>
            {th ? EFFECTIVE_DATE_TH : EFFECTIVE_DATE_EN}
          </p>
        </div>
      </div>

      <div className="px-5 pt-5 max-w-xl mx-auto">
        {doc === 'privacy' ? (
          <>
            <Section title={th ? '1. ผู้ควบคุมข้อมูลส่วนบุคคล' : '1. Data Controller'}>
              <p>
                {th
                  ? 'PicksWise ("เรา") เป็นผู้ควบคุมข้อมูลส่วนบุคคลที่เก็บผ่านแอปพลิเคชันนี้ ติดต่อเรื่องข้อมูลส่วนบุคคลได้ที่ privacy@pickswise.app'
                  : 'PicksWise ("we") is the controller of personal data collected through this app. Contact us about your data at privacy@pickswise.app.'}
              </p>
            </Section>

            <Section title={th ? '2. ข้อมูลที่เราเก็บ' : '2. Data We Collect'}>
              <p>{th
                ? '• ข้อมูลบัญชี: อีเมล และรหัสผ่าน (เข้ารหัสโดยผู้ให้บริการยืนยันตัวตน)'
                : '• Account data: email and password (hashed by our auth provider).'}</p>
              <p>{th
                ? '• ข้อมูลการเงินที่คุณกรอกเอง: ธุรกรรม การสมัครสมาชิก งบประมาณ เป้าหมาย และโน้ต'
                : '• Financial data you enter: transactions, subscriptions, budgets, goals and notes.'}</p>
              <p>{th
                ? '• ข้อมูลอุปกรณ์: โทเคนสำหรับการแจ้งเตือนแบบพุช (เมื่อคุณเปิดใช้)'
                : '• Device data: push notification token (only if you enable alerts).'}</p>
              <p>{th
                ? 'เราไม่เชื่อมต่อกับบัญชีธนาคารของคุณ และไม่เก็บข้อมูลบัตรเครดิต'
                : 'We never connect to your bank accounts and never store card numbers.'}</p>
            </Section>

            <Section title={th ? '3. วัตถุประสงค์การใช้ข้อมูล' : '3. Purposes of Processing'}>
              <p>{th
                ? 'เราใช้ข้อมูลของคุณเพื่อ: ให้บริการหลักของแอป คำนวณสถิติและข้อมูลเชิงลึกส่วนตัว ส่งการแจ้งเตือนที่คุณตั้งค่าไว้ และปรับปรุงความเสถียรของระบบ'
                : 'We use your data to: provide the app\'s core features, compute personal statistics and insights, deliver alerts you configured, and keep the service stable.'}</p>
            </Section>

            <Section title={th ? '4. การเก็บรักษาและความปลอดภัย' : '4. Retention & Security'}>
              <p>{th
                ? 'ข้อมูลถูกเก็บไว้ระหว่างที่คุณใช้บริการ เมื่อคุณลบบัญชี ข้อมูลทั้งหมดจะถูกลบถาวร การถ่ายโอนข้อมูลใช้การเข้ารหัส TLS และข้อมูลจัดเก็บด้วยการเข้ารหัสมาตรฐานอุตสาหกรรม'
                : 'Data is retained while your account is active. Deleting your account permanently removes all data. Transfers are encrypted with TLS and storage uses industry-standard encryption.'}</p>
            </Section>

            <Section title={th ? '5. สิทธิ์ของคุณตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล' : '5. Your Rights Under PDPA'}>
              <p>{th
                ? 'ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 คุณมีสิทธิ์:'
                : 'Under Thailand\'s Personal Data Protection Act B.E. 2562 (2019), you have the right to:'}</p>
              <p>• {th ? 'เข้าถึงและขอสำเนาข้อมูล (ส่งออกได้จากหน้าตั้งค่า)' : 'Access and obtain a copy of your data (export it from Settings).'}</p>
              <p>• {th ? 'แก้ไขข้อมูลให้ถูกต้อง' : 'Rectify inaccurate data.'}</p>
              <p>• {th ? 'ขอลบข้อมูล ("ลบบัญชี" ในหน้าตั้งค่า)' : 'Erasure ("Delete account" in Settings).'}</p>
              <p>• {th ? 'ถอนความยินยอมหรือคัดค้านการประมวลผลบางประเภท' : 'Withdraw consent or object to certain processing.'}</p>
              <p>• {th ? 'ร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล' : 'Lodge a complaint with the PDPC.'}</p>
            </Section>

            <Section title={th ? '6. การแชร์ข้อมูล' : '6. Data Sharing'}>
              <p>{th
                ? 'เราไม่ขายข้อมูลของคุณ ข้อมูลถูกประมวลผลโดยผู้ให้บริการโครงสร้างพื้นฐานเท่านั้น (โฮสติ้ง ฐานข้อมูล การยืนยันตัวตน และอีเมล) ซึ่งผูกพันด้วยข้อตกลงคุ้มครองข้อมูล'
                : 'We do not sell your data. Data is processed only by infrastructure providers (hosting, database, authentication, email) bound by data protection agreements.'}</p>
            </Section>

            <Section title={th ? '7. คุกกี้และที่เก็บข้อมูลในเครื่อง' : '7. Cookies & Local Storage'}>
              <p>{th
                ? 'แอปใช้ localStorage เพื่อจำการตั้งค่า (ภาษา งบประมาณ ความยินยอม) บนอุปกรณ์ของคุณเท่านั้น ไม่มีคุกกี้โฆษณาหรือติดตามข้ามเว็บไซต์'
                : 'The app uses localStorage to remember settings (language, budgets, consent) on your device only. No advertising or cross-site tracking cookies.'}</p>
            </Section>
          </>
        ) : (
          <>
            <Section title={th ? '1. การยอมรับข้อกำหนด' : '1. Acceptance of Terms'}>
              <p>{th
                ? 'การใช้งาน PicksWise ถือว่าคุณยอมรับข้อกำหนดนี้ หากไม่เห็นด้วยโปรดหยุดใช้งานและลบบัญชีของคุณ'
                : 'By using PicksWise you agree to these terms. If you disagree, please stop using the app and delete your account.'}</p>
            </Section>

            <Section title={th ? '2. การให้บริการ' : '2. The Service'}>
              <p>{th
                ? 'PicksWise เป็นเครื่องมือจดบันทึกและวิเคราะห์การเงินส่วนบุคคล ข้อมูลที่แสดงขึ้นอยู่กับข้อมูลที่คุณกรอกเท่านั้น'
                : 'PicksWise is a personal finance tracking and analysis tool. All outputs are derived solely from the data you enter.'}</p>
            </Section>

            <Section title={th ? '3. ไม่ใช่คำแนะนำทางการเงิน' : '3. Not Financial Advice'}>
              <p style={{ fontWeight: 600, color: '#0FB0CE' }}>
                {th
                  ? 'เนื้อหาทั้งหมดในแอปมีวัตถุประสงค์เพื่อการศึกษาและการจัดการส่วนตัวเท่านั้น ไม่ใช่คำแนะนำทางการเงิน การลงทุน หรือภาษี โปรดปรึกษาผู้ให้บริการทางการเงินที่ได้รับใบอนุญาตก่อนตัดสินใจ'
                  : 'All content is for educational and personal-management purposes only. It is not financial, investment or tax advice. Consult a licensed financial professional before making decisions.'}
              </p>
            </Section>

            <Section title={th ? '4. ความรับผิดชอบของคุณ' : '4. Your Responsibilities'}>
              <p>• {th ? 'ให้ข้อมูลที่ถูกต้องและรักษาความปลอดภัยของบัญชี' : 'Provide accurate information and keep your account secure.'}</p>
              <p>• {th ? 'ไม่ใช้แอปเพื่อวัตถุประสงค์ที่ผิดกฎหมาย' : 'Do not use the app for unlawful purposes.'}</p>
              <p>• {th ? 'ตรวจสอบความถูกต้องของข้อมูลก่อนใช้ตัดสินใจ' : 'Verify data accuracy before relying on it.'}</p>
            </Section>

            <Section title={th ? '5. ข้อจำกัดความรับผิด' : '5. Limitation of Liability'}>
              <p>{th
                ? 'บริการให้ "ตามสภาพ" โดยไม่รับประกันว่าจะไม่มีข้อผิดพลาดหรือไม่หยุดชะงัก เราไม่รับผิดต่อความเสียหายทางการเงินที่เกิดจากการใช้หรือไม่สามารถใช้บริการ ตามขอบเขตสูงสุดที่กฎหมายอนุญาต'
                : 'The service is provided "as is" without warranty of error-free or uninterrupted operation. To the maximum extent permitted by law, we are not liable for financial losses arising from use of or inability to use the service.'}</p>
            </Section>

            <Section title={th ? '6. การเปลี่ยนแปลง' : '6. Changes'}>
              <p>{th
                ? 'เราอาจปรับปรุงข้อกำหนดนี้ เมื่อมีการเปลี่ยนแปลงที่สำคัญเราจะแจ้งภายในแอป การใช้งานต่อหลังประกาศถือว่าคุณยอมรับฉบับปรับปรุง'
                : 'We may update these terms. Material changes will be announced in-app. Continued use after notice constitutes acceptance.'}</p>
            </Section>

            <Section title={th ? '7. กฎหมายที่ใช้' : '7. Governing Law'}>
              <p>{th
                ? 'ข้อกำหนดนี้อยู่ภายใต้กฎหมายไทย ข้อพิพาทเข้าอยู่ในเขตอำนาจศาลไทย'
                : 'These terms are governed by Thai law; disputes are subject to Thai jurisdiction.'}</p>
            </Section>
          </>
        )}

        <p className="text-[11px] mt-8 text-center" style={{ color: 'rgba(224,242,252,0.35)' }}>
          PicksWise © 2026 · {th ? 'ดำเนินการตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562' : 'Operated in accordance with Thailand PDPA B.E. 2562'}
        </p>
      </div>
    </div>
  );
}
