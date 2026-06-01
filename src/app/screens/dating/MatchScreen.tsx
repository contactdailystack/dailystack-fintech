/**
 * DailyStack — Match Screen
 * Celebration screen when two users match
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, MessageCircle, Sparkles, X, Crown, Zap } from 'lucide-react';
import { DatingService } from '../../services/datingService';

interface MatchData {
  id: string;
  name: string;
  age: number;
  photo: string;
  compatibility: number;
  sharedInterests: string[];
  matchTime: Date;
}

// ─── Confetti Particle ─────────────────────────────────────────────────────────
const ConfettiParticle: React.FC<{ delay: number; x: number; color: string }> = ({ delay, x, color }) => (
  <div
    className="absolute w-2 h-2 rounded-full animate-confetti"
    style={{
      left: `${x}%`,
      backgroundColor: color,
      animationDelay: `${delay}ms`,
      animationDuration: '2000ms',
    }}
  />
);

// ─── Main Match Screen ─────────────────────────────────────────────────────────
const MatchScreen: React.FC = () => {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const [showContent, setShowContent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Load match data ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadMatch = async () => {
      if (!matchId) {
        setLoading(false);
        return;
      }

      try {
        const matches = await DatingService.match.getMatches();
        const found = matches.find(m => m.id === matchId);
        
        if (found) {
          setMatch({
            id: found.partnerId,
            name: found.partnerName,
            age: 0,
            photo: found.partnerAvatar || '',
            compatibility: Math.round(found.compatibilityScore),
            sharedInterests: found.sharedInterests || [],
            matchTime: new Date(found.matchedAt || Date.now()),
          });
        }
      } catch (error) {
        console.error('Failed to load match:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [matchId]);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = () => {
    navigate(`/dating/chat/${match.id}`);
  };

  const handleKeepSwiping = () => {
    navigate('/dating/discover');
  };

  const handleBackToDashboard = () => {
    navigate('/dating');
  };

  // Confetti colors
  const confettiColors = ['#56be89', '#D9FD82', '#22C55E', '#3D9E6E', '#9CA3AF', '#3D9E6E'];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-[#1C232A] via-[#232D38] to-[#1C232A] 
      text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden feature-dating">
      
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiParticle
              key={i}
              delay={Math.random() * 1000}
              x={Math.random() * 100}
              color={confettiColors[Math.floor(Math.random() * confettiColors.length)]}
            />
          ))}
        </div>
      )}

      {/* Close button */}
      <button
        onClick={handleBackToDashboard}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[rgba(255,255,255,0.10)] flex items-center justify-center"
      >
        <X size={20} />
      </button>

      {/* Content */}
      <div className={`text-center transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Celebration header */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#56be89] to-[#3D9E6E] 
            flex items-center justify-center mb-6 animate-pulse-glow">
            <Heart size={48} className="text-white" fill="white" />
          </div>
          
          <h1 className="text-4xl font-black mb-3">
            <span className="bg-gradient-to-r from-[#FF6B81] to-[#FFD700] bg-clip-text text-transparent">
              It's a Match!
            </span>
          </h1>
          
          <p className="text-lg text-white/70">
            You and {loading ? '...' : match?.name || 'someone'} liked each other
          </p>
        </div>

        {/* Photos */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Current user placeholder */}
          <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#56be89] shadow-lg shadow-[#56be89]/30">
            <div className="w-full h-full bg-gradient-to-br from-[#21262D] to-[#0D1117] flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
          </div>

          {/* Heart connector */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56be89] to-[#3D9E6E] 
              flex items-center justify-center animate-heartbeat">
              <Sparkles size={24} className="text-white" />
            </div>
          </div>

          {/* Match photo */}
          <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#FF6B81] shadow-lg shadow-[#FF6B81]/30">
            {loading ? (
              <div className="w-full h-full bg-[#21262D] animate-pulse" />
            ) : match?.photo ? (
              <img
                src={match.photo}
                alt={match?.name || 'Match'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#21262D] flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
            )}
          </div>
        </div>

        {/* Compatibility badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(86,190,137,0.15)] rounded-full mb-8">
          <Zap size={16} className="text-[#FFD700]" />
          <span className="text-sm font-bold text-[#FFD700]">
            {loading ? '...' : `${match?.compatibility || 0}% Compatible`}
          </span>
          <Crown size={14} className="text-[#FFD700]" />
        </div>

        {/* Shared interests */}
        <div className="mb-10">
          <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Shared Interests</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
            {loading ? (
              <span className="text-sm text-white/50">Loading...</span>
            ) : match?.sharedInterests.length ? (
              match.sharedInterests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1.5 border border-[rgba(86,190,137,0.2)] rounded-full text-xs font-medium text-[#FF6B81]"
                >
                  {interest}
                </span>
              ))
            ) : (
              <span className="text-sm text-white/50">No shared interests</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-4 max-w-sm mx-auto">
          <button
            onClick={handleSendMessage}
            disabled={loading || !match}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#56be89] to-[#3D9E6E]
              font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-[#FF6B81]/30
              active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageCircle size={24} />
            Send a Message
          </button>
          
          <button
            onClick={handleKeepSwiping}
            className="w-full py-4 rounded-2xl bg-[rgba(255,255,255,0.10)]
              font-semibold text-base flex items-center justify-center gap-3
              hover:bg-[rgba(255,255,255,0.15)] transition-all"
          >
            <Sparkles size={20} />
            Keep Swiping
          </button>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 107, 129, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 107, 129, 0.6);
          }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.1);
          }
          50% {
            transform: scale(1);
          }
          75% {
            transform: scale(1.1);
          }
        }
        
        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MatchScreen;