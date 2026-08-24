/**
 * SkeletonLoader.tsx
 * ProfilePage Design System — Dark card skeleton loading states
 */

import { memo } from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'stats' | 'list' | 'full';
  message?: string;
}

// Loading messages — friendly, contextual
const LOADING_MESSAGES = {
  stats: ['กำลังจัดเรียงรายจ่าย...', 'คำนวณค่าใช้จ่ายเดือนนี้...', 'เช็คบิลที่กำลังจะมา...', 'กำลังจัดระเบียบเงินของคุณ...'],
  list: ['กำลังโหลดรายการ...', 'เช็ครายการล่าสุด...', 'โหลดข้อมูลเสร็จแล้ว เกือบเสร็จแล้ว...'],
  full: ['รอแป๊บนึงนะ...', 'กำลังจัดการเงินของคุณ...', 'เตรียม Dashboard...'],
};

function SkeletonCard({ height = 80, delay = 0 }: { height?: number; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-[24px] overflow-hidden"
      style={{ backgroundColor: '#18181B' }}
    >
      <div className="p-5 space-y-3">
        <div className="h-3 w-24 rounded-full" style={{ backgroundColor: '#27272A' }} />
        <div className="h-8 w-32 rounded-full" style={{ backgroundColor: '#27272A' }} />
        <div className="h-16 rounded-xl" style={{ backgroundColor: '#27272A' }} />
      </div>
    </motion.div>
  );
}

function SkeletonList({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          className="flex items-center gap-4 bg-[#F4F5F7] rounded-full px-6 py-4"
        >
          <div className="w-11 h-11 rounded-full" style={{ backgroundColor: '#E5E7EB' }} />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-28 rounded-full" style={{ backgroundColor: '#E5E7EB' }} />
            <div className="h-2.5 w-20 rounded-full" style={{ backgroundColor: '#F3F4F6' }} />
          </div>
          <div className="h-4 w-16 rounded-full" style={{ backgroundColor: '#E5E7EB' }} />
        </motion.div>
      ))}
    </div>
  );
}

export const SkeletonLoader = memo(function SkeletonLoader({
  variant = 'stats',
  message,
}: SkeletonLoaderProps) {
  const messages = LOADING_MESSAGES[variant];
  const displayMessage = message || messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="animate-pulse">
      {/* Loading message */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 rounded-full border-2 border-gray-600 border-t-transparent"
        />
        <span className="text-xs" style={{ fontFamily: '"Inter", sans-serif', color: '#6B7280' }}>
          {displayMessage}
        </span>
      </div>

      {variant === 'stats' && (
        <>
          {/* Stats card skeleton */}
          <div className="bg-black rounded-[32px] px-8 py-6 mb-6">
            <div className="h-3 w-36 rounded-full mb-4" style={{ backgroundColor: '#27272A' }} />
            <div className="h-10 w-40 rounded-full mb-4" style={{ backgroundColor: '#27272A' }} />
            <div className="h-32 rounded-xl" style={{ backgroundColor: '#27272A' }} />
          </div>

          {/* Accounts skeleton */}
          <div className="space-y-3 mb-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex items-center justify-between bg-[#F4F5F7] rounded-full px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: '#D1D5DB' }} />
                  <div className="space-y-1.5">
                    <div className="h-3 w-20 rounded-full" style={{ backgroundColor: '#D1D5DB' }} />
                    <div className="h-2.5 w-14 rounded-full" style={{ backgroundColor: '#E5E7EB' }} />
                  </div>
                </div>
                <div className="h-4 w-16 rounded-full" style={{ backgroundColor: '#D1D5DB' }} />
              </motion.div>
            ))}
          </div>

          {/* Bills skeleton */}
          <div className="bg-[#F4F5F7] rounded-[32px] p-5">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.15, duration: 0.3 }}
                  className="flex items-center gap-4 bg-white rounded-full px-5 py-4"
                >
                  <div className="w-11 h-11 rounded-full" style={{ backgroundColor: '#E5E7EB' }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 rounded-full" style={{ backgroundColor: '#E5E7EB' }} />
                    <div className="h-2.5 w-16 rounded-full" style={{ backgroundColor: '#F3F4F6' }} />
                  </div>
                  <div className="h-4 w-14 rounded-full" style={{ backgroundColor: '#E5E7EB' }} />
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      {variant === 'list' && <SkeletonList items={3} />}

      {variant === 'full' && (
        <div className="space-y-4">
          <SkeletonCard height={200} delay={0} />
          <SkeletonCard height={120} delay={0.1} />
          <SkeletonList items={4} />
        </div>
      )}
    </div>
  );
});
