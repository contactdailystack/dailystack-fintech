/**
 * SplitBillsModal Component
 * Modal for splitting bills with friends (Rocket Money style)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, UserPlus, Send, Check } from 'lucide-react';

export interface SplitData {
  friends: string[];
  amounts: number[];
  type: 'equal' | 'custom';
}

export interface SplitBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: {
    id: string;
    name: string;
    amount: number;
    icon?: string;
    color?: string;
  };
  onSendSplit?: (splitData: SplitData) => void;
  lang?: 'en' | 'th';
}

export const SplitBillsModal: React.FC<SplitBillsModalProps> = ({
  isOpen,
  onClose,
  bill,
  onSendSplit,
  lang = 'en'
}) => {
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [friends, setFriends] = useState<string[]>(['']);
  const [customAmounts, setCustomAmounts] = useState<string[]>(['']);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const translations = {
    en: {
      title: 'Split Bill',
      selectFriend: 'Add friend',
      emailPlaceholder: 'Friend email',
      splitEqually: 'Split equally',
      customAmount: 'Custom amount',
      yourShare: 'Your share',
      friendShare: 'Friend share',
      sendInvite: 'Send Invite',
      total: 'Total',
      you: 'You',
      success: 'Invite sent!',
      addAnother: 'Add another',
    },
    th: {
      title: 'แบ่งค่าใช้จ่าย',
      selectFriend: 'เพิ่มเพื่อน',
      emailPlaceholder: 'อีเมลเพื่อน',
      splitEqually: 'แบ่งเท่ากัน',
      customAmount: 'จำนวนเอง',
      yourShare: 'ส่วนของคุณ',
      friendShare: 'ส่วนของเพื่อน',
      sendInvite: 'ส่งคำเชิญ',
      total: 'รวม',
      you: 'คุณ',
      success: 'ส่งคำเชิญแล้ว!',
      addAnother: 'เพิ่มอีกคน',
    }
  };

  const t = translations[lang];

  // Calculate splits
  const getSplitAmount = (index: number): number => {
    const totalPeople = friends.filter(f => f.trim()).length + 1; // +1 for you
    if (splitType === 'equal') {
      return bill.amount / totalPeople;
    } else {
      return parseFloat(customAmounts[index] || '0') || 0;
    }
  };

  const yourShare = getSplitAmount(-1);
  const totalSplit = friends.reduce((sum, f, i) => {
    if (f.trim()) return sum + getSplitAmount(i);
    return sum;
  }, 0) + yourShare;

  // Add friend
  const addFriend = () => {
    setFriends([...friends, '']);
    setCustomAmounts([...customAmounts, '']);
  };

  // Remove friend
  const removeFriend = (index: number) => {
    const newFriends = friends.filter((_, i) => i !== index);
    const newAmounts = customAmounts.filter((_, i) => i !== index);
    setFriends(newFriends);
    setCustomAmounts(newAmounts);
  };

  // Send split invite
  const handleSend = () => {
    setSending(true);
    
    // Simulate sending
    setTimeout(() => {
      setSending(false);
      setSent(true);
      
      if (onSendSplit) {
        onSendSplit({
          friends: friends.filter(f => f.trim()),
          amounts: friends.map((_, i) => getSplitAmount(i)),
          type: splitType
        });
      }

      // Close after showing success
      setTimeout(() => {
        onClose();
        setSent(false);
        setFriends(['']);
        setCustomAmounts(['']);
        setSplitType('equal');
      }, 1500);
    }, 1500);
  };

  // Calculate if amounts match
  const isValidSplit = Math.abs(totalSplit - bill.amount) < 0.01;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none"
        >
          <div className="bg-white rounded-[32px] w-full max-w-md pointer-events-auto overflow-hidden shadow-2xl">
            {/* Success State */}
            {sent ? (
              <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4"
                >
                  <Check className="w-10 h-10 text-emerald-500" />
                </motion.div>
                <h3 className="font-display font-bold text-gray-900 text-xl mb-2">
                  {t.success}
                </h3>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-[#F7F7F9] p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Bill Icon */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: bill.color || '#6366F1' }}
                      >
                        {bill.icon || bill.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-gray-900">
                          {t.title}
                        </h3>
                        <p className="text-sm text-gray-500">{bill.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  {/* Split Type Toggle */}
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                    <button
                      onClick={() => setSplitType('equal')}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        splitType === 'equal'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {t.splitEqually}
                    </button>
                    <button
                      onClick={() => setSplitType('custom')}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        splitType === 'custom'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {t.customAmount}
                    </button>
                  </div>

                  {/* Your Share */}
                  <div className="bg-[#0FB0CE]/10 rounded-2xl p-4 border border-[#0FB0CE]/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#0FB0CE] flex items-center justify-center">
                          <span className="text-xs font-bold text-black">Y</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{t.you}</span>
                      </div>
                      <span className="font-mono font-bold text-gray-900">
                        ${yourShare.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Friends List */}
                  <div className="space-y-3">
                    {friends.map((friend, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1 relative">
                          <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            value={friend}
                            onChange={(e) => {
                              const newFriends = [...friends];
                              newFriends[index] = e.target.value;
                              setFriends(newFriends);
                            }}
                            placeholder={t.emailPlaceholder}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0FB0CE] focus:ring-2 focus:ring-[#0FB0CE]/20 transition-all"
                          />
                        </div>
                        
                        {splitType === 'custom' && friend.trim() && (
                          <div className="relative w-24">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <input
                              type="number"
                              value={customAmounts[index]}
                              onChange={(e) => {
                                const newAmounts = [...customAmounts];
                                newAmounts[index] = e.target.value;
                                setCustomAmounts(newAmounts);
                              }}
                              placeholder="0.00"
                              className="w-full pl-7 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#0FB0CE] focus:ring-2 focus:ring-[#0FB0CE]/20 transition-all"
                            />
                          </div>
                        )}

                        {friends.length > 1 && (
                          <button
                            onClick={() => removeFriend(index)}
                            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Add Another */}
                    <button
                      onClick={addFriend}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0FB0CE] transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      {t.addAnother}
                    </button>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{t.total}</span>
                      <span className="font-mono font-bold text-gray-900">
                        ${bill.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-gray-200">
                      <span className="text-gray-500">{t.friendShare}</span>
                      <span className={`font-mono ${isValidSplit ? 'text-emerald-500' : 'text-red-500'}`}>
                        ${totalSplit.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={sending || !isValidSplit || !friends.some(f => f.trim())}
                    className="w-full py-4 rounded-2xl bg-[#0FB0CE] text-black font-display font-bold text-sm uppercase tracking-wider hover:bg-[#3FC4DB] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {sending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Users className="w-4 h-4" />
                        </motion.div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {t.sendInvite}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplitBillsModal;
