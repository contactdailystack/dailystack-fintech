/**
 * DailyStack — MatchCelebration Component
 * Phase 3: Scalable Architecture
 * 
 * Cinematic match celebration modal with:
 * - Particle effects
 * - Confetti animation
 * - Profile reveal
 * - Action buttons (Send Message, Keep Swiping)
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, ArrowRight, Sparkles, Star } from 'lucide-react';

export interface MatchCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
  myProfile: {
    name: string;
    photo: string;
  };
  matchedProfile: {
    name: string;
    photo: string;
    bio: string;
    compatibility: number;
  };
  isUltraMatch?: boolean;
}

const MatchCelebration: React.FC<MatchCelebrationProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  onKeepSwiping,
  myProfile,
  matchedProfile,
  isUltraMatch = false,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string; delay: number }>>([]);
  
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      
      // Generate particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 50,
        size: Math.random() * 8 + 4,
        color: ['#D9FD82', '#fbbf24', '#f472b6', '#818cf8', '#ffffff'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.5,
      }));
      
      setParticles(newParticles);
      
      // Clear confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isOpen]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Confetti Particles */}
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  initial={{ y: -20, x: `${particle.x}%`, opacity: 1 }}
                  animate={{ 
                    y: '100vh', 
                    rotate: Math.random() * 360,
                    opacity: [1, 1, 0],
                  }}
                  transition={{ 
                    duration: 2.5, 
                    delay: particle.delay,
                    ease: 'easeOut',
                  }}
                  className="absolute"
                  style={{
                    left: `${particle.x}%`,
                    top: '-20px',
                  }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: `${particle.size}px`,
                      height: `${particle.size}px`,
                      backgroundColor: particle.color,
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-sm bg-[#18181B] rounded-[28px] p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Match Type Badge */}
            {isUltraMatch ? (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-[#f472b6] to-[#a855f7] rounded-full shadow-lg"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-bold">ULTRA MATCH</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#D9FD82] rounded-full shadow-lg"
              >
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-white" fill="white" />
                  <span className="text-white text-xs font-bold">NEW MATCH</span>
                </div>
              </motion.div>
            )}
            
            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black text-white mb-2"
            >
              {isUltraMatch ? "It's a Spark!" : "It's a Match!"}
            </motion.h2>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/60 text-sm mb-8"
            >
              {isUltraMatch
                ? "You both hit Super Like! This is rare ✨"
                : "You and this person liked each other"}
            </motion.p>
            
            {/* Profile Photos */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="relative flex justify-center mb-8"
            >
              {/* My Photo */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#D9FD82] shadow-lg">
                  <img
                    src={myProfile.photo}
                    alt={myProfile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#D9FD82] rounded-full flex items-center justify-center"
                >
                  <Heart className="w-4 h-4 text-white" fill="white" />
                </motion.div>
              </div>
              
              {/* Partner Photo */}
              <div className="relative -ml-4">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#18181B] shadow-lg">
                  <img
                    src={matchedProfile.photo}
                    alt={matchedProfile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Compatibility Badge */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 px-3 py-1 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] rounded-full shadow-lg">
                <span className="text-black text-xs font-bold">{matchedProfile.compatibility}% Match</span>
              </div>
            </motion.div>
            
            {/* Partner Name */}
            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl font-bold text-white mb-2"
            >
              {matchedProfile.name}
            </motion.h3>
            
            {/* Bio */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-white/60 text-sm mb-8 line-clamp-2"
            >
              "{matchedProfile.bio}"
            </motion.p>
            
            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-3"
            >
              {/* Send Message Button */}
              <motion.button
                onClick={onSendMessage}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-[#D9FD82] hover:bg-[#4ade80] text-black font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-colors"
                style={{ boxShadow: '0 4px 20px rgba(86, 190, 137, 0.4)' }}
              >
                <MessageCircle className="w-5 h-5" />
                Send Message
              </motion.button>
              
              {/* Keep Swiping Button */}
              <motion.button
                onClick={onKeepSwiping}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-[#27272a] hover:bg-[#3f3f46] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors"
              >
                Keep Swiping
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
            
            {/* Skip Link */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={onClose}
              className="mt-4 text-white/40 text-sm hover:text-white/60 transition-colors"
            >
              Maybe later
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchCelebration;