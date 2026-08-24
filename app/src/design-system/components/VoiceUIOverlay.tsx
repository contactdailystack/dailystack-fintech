/**
 * ============================================================
 * DailyStack — Voice UI Overlay v1.0
 * ============================================================
 * Sprint 3: Invisible UI - Voice Input Layer
 * 
 * Design Specs (UX Screens Inventory v4.2):
 * - Wave/ripple animation for voice capture
 * - Floating overlay with glassmorphism
 * - Supports natural language input (Thai + English)
 * - Crisp haptic feedback on activation
 * 
 * Experience:
 * - Swipe Down → Wave UI appears
 * - User speaks naturally: "กินข้าวเที่ยงไป 450 บาท อารมณ์แฮปปี้"
 * - AI extracts: amount (450), category (อาหาร), emotion (มีความสุข)
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, X, Sparkles } from 'lucide-react';
import { haptics } from '../../services/hapticService';
import { Language } from '../../data/translations';

interface VoiceUIOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
  lang: Language;
}

export default function VoiceUIOverlay({
  isOpen,
  onClose,
  onTranscript,
  lang,
}: VoiceUIOverlayProps) {
  const [isListening, setIsListening] = useState(false);
  const [waveHeight, setWaveHeight] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Fire haptic on open
  useEffect(() => {
    if (isOpen) {
      haptics.fire('THUD');
      setIsListening(true);
    } else {
      setIsListening(false);
    }
  }, [isOpen]);

  // Wave animation using canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let phase = 0;
    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw multiple wave layers
      for (let i = 0; i < 3; i++) {
        const amplitude = 20 + i * 10;
        const frequency = 0.02 - i * 0.005;
        const speed = 0.05 + i * 0.02;
        const opacity = 0.15 - i * 0.03;
        
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        
        for (let x = 0; x <= width; x += 5) {
          const y = height / 2 + Math.sin(x * frequency + phase + i * Math.PI) * amplitude;
          ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = `rgba(15, 176, 206, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      phase += 0.1;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen]);

  const handleSimulateTranscript = () => {
    // Simulate AI parsing from voice
    haptics.fire('DEEP_RESONANCE');
    const sampleTranscript = lang === 'th' 
      ? 'กินข้าวเที่ยงกับทีมไป 450 บาท อารมณ์แฮปปี้'
      : 'Lunch with team, 450 baht, feeling happy';
    onTranscript(sampleTranscript);
    onClose();
  };

  const handleClose = () => {
    haptics.fire('CRISP_CLICK');
    onClose();
  };

  // Simulate wave amplitude from "audio input"
  useEffect(() => {
    if (!isListening) {
      setWaveHeight(0);
      return;
    }

    const interval = setInterval(() => {
      // Simulate audio amplitude (random for demo)
      const newHeight = 30 + Math.random() * 70;
      setWaveHeight(newHeight);
    }, 100);

    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-end pb-20"
          style={{ backgroundColor: 'rgba(11, 15, 10, 0.95)', backdropFilter: 'blur(20px)' }}
          onClick={handleClose}
        >
          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={handleClose}
            className="absolute top-8 right-4 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>

          {/* Center content */}
          <div className="flex flex-col items-center">
            {/* Wave visualization */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative w-48 h-48 mb-8"
            >
              {/* Outer glow ring */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: '0 0 60px rgba(15, 176, 206, 0.2)',
                }}
              />

              {/* Canvas for wave animation */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ width: '100%', height: '100%' }}
              />

              {/* Mic button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSimulateTranscript}
                className="absolute inset-0 m-auto w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: '#0FB0CE',
                  boxShadow: '0 0 40px rgba(15, 176, 206, 0.4)',
                }}
              >
                <Mic className="w-10 h-10 text-black" />
              </motion.button>

              {/* Pulsing rings based on "audio" */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1 + waveHeight / 200],
                    opacity: [0.3 - i * 0.1, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  className="absolute inset-0 rounded-full border-2"
                  style={{
                    borderColor: `rgba(15, 176, 206, ${0.3 - i * 0.08})`,
                    transformOrigin: 'center',
                  }}
                />
              ))}
            </motion.div>

            {/* Instruction text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <p className="text-white/90 text-lg font-medium mb-2">
                {lang === 'th' ? 'พูดเลย...' : 'Speak now...'}
              </p>
              <p className="text-white/50 text-sm max-w-xs">
                {lang === 'th' 
                  ? 'เช่น "กินข้าวเที่ยงไป 450 บาท อารมณ์แฮปปี้"'
                  : 'e.g. "Lunch 450 baht, feeling happy"'}
              </p>
            </motion.div>

            {/* Example chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-2 mt-6 flex-wrap justify-center px-4"
            >
              {[
                lang === 'th' ? 'อาหาร' : 'Food',
                lang === 'th' ? 'เดินทาง' : 'Transport',
                lang === 'th' ? 'กาแฟ' : 'Coffee',
                lang === 'th' ? 'ช้อปปิ้ง' : 'Shopping',
              ].map((example) => (
                <button
                  key={example}
                  onClick={handleSimulateTranscript}
                  className="px-4 py-2 rounded-full text-sm"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {example}
                </button>
              ))}
            </motion.div>

            {/* AI parsing hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-2 mt-8 text-white/40 text-xs"
            >
              <Sparkles className="w-3 h-3" />
              <span>
                {lang === 'th' 
                  ? 'AI จะแยก: จำนวนเงิน, หมวดหมู่, อารมณ์'
                  : 'AI extracts: amount, category, emotion'}
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
