/**
 * DailyStack — Icebreaker Component
 * AI-generated conversation starters
 */

import React, { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, Send } from 'lucide-react';

interface IcebreakerProps {
  suggestions: string[];
  onSelect?: (message: string) => void;
  onCustomInput?: (message: string) => void;
}

// ─── Icebreaker Card ───────────────────────────────────────────────────────────
const IcebreakerCard: React.FC<{
  text: string;
  onSelect: () => void;
  onCopy: () => void;
  copied: boolean;
}> = ({ text, onSelect, onCopy, copied }) => (
  <div className="group p-4 rounded-2xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] transition-all cursor-pointer"
    onClick={onSelect}>
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B81] to-[#FF3B30] flex items-center justify-center shrink-0">
        <Sparkles size={16} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white leading-relaxed">{text}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCopy();
        }}
        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.10)] transition-all"
      >
        {copied ? (
          <Check size={16} className="text-[#22C55E]" />
        ) : (
          <Copy size={16} className="text-[var(--text-muted)]" />
        )}
      </button>
    </div>
  </div>
);

// ─── Main Icebreaker Component ────────────────────────────────────────────────
const Icebreaker: React.FC<IcebreakerProps> = ({
  suggestions,
  onSelect,
  onCustomInput,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCopy = (index: number) => {
    navigator.clipboard.writeText(suggestions[index]);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSelect = (message: string) => {
    onSelect?.(message);
  };

  const handleSendCustom = () => {
    if (customMessage.trim()) {
      onCustomInput?.(customMessage.trim());
      setCustomMessage('');
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Regenerate suggestions with key
  const currentSuggestions = suggestions;

  return (
    <div className="bg-[rgba(13,17,23,0.95)] backdrop-blur-xl rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.10)]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#FFD700]" />
          <h4 className="text-sm font-bold text-white">AI Icebreakers</h4>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.10)] hover:bg-[rgba(255,255,255,0.15)] transition-all"
        >
          <RefreshCw size={14} />
          <span className="text-xs text-white/80">Refresh</span>
        </button>
      </div>

      {/* Suggestions */}
      <div className="p-4 space-y-3">
        {currentSuggestions.map((suggestion, index) => (
          <IcebreakerCard
            key={`${refreshKey}-${index}`}
            text={suggestion}
            onSelect={() => handleSelect(suggestion)}
            onCopy={() => handleCopy(index)}
            copied={copiedIndex === index}
          />
        ))}
      </div>

      {/* Custom input */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[rgba(255,255,255,0.05)]">
          <input
            type="text"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Or write your own message..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleSendCustom()}
          />
          <button
            onClick={handleSendCustom}
            disabled={!customMessage.trim()}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B81] to-[#FF3B30] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Footer note */}
      <div className="px-4 pb-4">
        <p className="text-[10px] text-[var(--text-muted)] text-center leading-relaxed">
          AI suggestions based on your shared interests and compatibility insights.
        </p>
      </div>
    </div>
  );
};

export default Icebreaker;