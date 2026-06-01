import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Delete, Lock, HelpCircle } from 'lucide-react';

interface PINLockScreenProps {
  onUnlock: () => void;
  correctPIN: string;
}

export const PINLockScreen: React.FC<PINLockScreenProps> = ({ onUnlock, correctPIN }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setError(false);
      const nextPin = pin + num;
      setPin(nextPin);

      // Trigger automatic verification when 6 digits are reached
      if (nextPin.length === 6) {
        if (nextPin === correctPIN) {
          // Play success sequence
          setTimeout(() => {
            onUnlock();
          }, 200);
        } else {
          // Play fail sequence
          setShake(true);
          setError(true);
          setTimeout(() => {
            setShake(false);
            setPin('');
          }, 500);
        }
      }
    }
  };

  const handleBackspace = () => {
    setError(false);
    setPin(pin.slice(0, -1));
  };

  const handleClear = () => {
    setError(false);
    setPin('');
  };

  return (
    <div className="absolute inset-0 bg-[#0C0E12] flex flex-col justify-center items-center z-40 px-5 font-sans text-gray-200 rounded-[32px] overflow-hidden select-none">
      
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#D6453E]/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-[#C0F500]/4 rounded-full blur-[120px] pointer-events-none" />

      {/* Cyberpunk Border & Frame */}
      <div className="w-full relative overflow-hidden flex flex-col items-center">
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-[#D6453E]/15 border border-[#D6453E]/50 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-[#D6453E] animate-pulse" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            DAILYSTACK <span className="text-xs px-2 py-0.5 bg-[#D6453E]/20 text-[#D6453E] border border-[#D6453E]/40 rounded font-mono">SHIELD v1.0</span>
          </h1>
          <p className="text-xs tracking-[0.25em] text-[#C0F500] font-mono mt-1">SECURE FINTECH LAYER</p>
        </div>

        {/* Input indicators */}
        <motion.div 
          animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex justify-center items-center gap-4 mb-10"
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const isFilled = pin.length > i;
            return (
              <motion.div
                key={i}
                initial={{ scale: 1 }}
                animate={isFilled ? { scale: [1, 1.25, 1], backgroundColor: error ? '#EF4444' : '#C0F500' } : { backgroundColor: '#21262d' }}
                className={`w-4 h-4 rounded-full border border-gray-700 transition-colors duration-150`}
              />
            );
          })}
        </motion.div>

        {/* Feedback message */}
        <div className="h-6 flex justify-center items-center mb-6">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-red-500 text-xs font-mono font-bold tracking-wider"
              >
                <ShieldAlert className="w-4 h-4" /> ACCESS DENIED - SYSTEM LOCKED
              </motion.div>
            )}
            {!error && pin.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500 text-xs font-mono tracking-widest"
              >
                ENTERING {pin.length} / 6
              </motion.div>
            )}
            {!error && pin.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                className="text-gray-400 text-xs font-mono flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" /> PIN CODE REQUIRED
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Numeric keypad (Tactile buttons) */}
        <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-full bg-[#21262d] border border-gray-800 flex flex-col justify-center items-center text-xl font-bold font-mono text-white transition-all hover:bg-gray-800 active:scale-95 active:bg-[#D6453E]/20 active:border-[#D6453E]/40"
            >
              {num}
            </button>
          ))}
          
          {/* Action Left */}
          <button
            onClick={handleClear}
            className="w-16 h-16 rounded-full bg-transparent flex justify-center items-center text-xs font-mono font-semibold tracking-wider text-gray-500 hover:text-gray-300"
          >
            CLEAR
          </button>
          
          {/* Zero */}
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-[#21262d] border border-gray-800 flex justify-center items-center text-xl font-bold font-mono text-white transition-all hover:bg-gray-800 active:scale-95 active:bg-[#D6453E]/20 active:border-[#D6453E]/40"
          >
            0
          </button>
          
          {/* Backspace */}
          <button
            onClick={handleBackspace}
            className="w-16 h-16 rounded-full bg-transparent flex justify-center items-center text-gray-500 hover:text-gray-300"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Informative footer */}
        <div className="text-center">
          <div className="inline-block px-3.5 py-1.5 bg-gray-900/60 border border-gray-800 rounded-lg text-[10px] font-mono text-gray-500">
            Simulated PIN is <span className="text-[#C0F500] font-bold tracking-widest">{correctPIN}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
export default PINLockScreen;
