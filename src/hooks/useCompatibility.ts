/**
 * DailyStack — useCompatibility Hook
 * Custom hook for managing compatibility calculations
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  UserProfile,
  CompatibilityScore,
  MatchCandidate,
} from '../services/datingAI';
import {
  calculateCompatibility,
  generateIcebreakers,
  isUltraMatch,
  sortByCompatibility,
  filterByThreshold,
} from '../services/datingAI';

// ─── Hook Types ───────────────────────────────────────────────────────────────
interface UseCompatibilityOptions {
  threshold?: number;
  sortBy?: 'overall' | 'lifestyle' | 'personality' | 'emotional';
  limit?: number;
}

interface UseCompatibilityReturn {
  // State
  candidates: MatchCandidate[];
  selectedCandidate: MatchCandidate | null;
  isCalculating: boolean;
  
  // Actions
  setCandidates: (candidates: MatchCandidate[]) => void;
  selectCandidate: (id: string) => void;
  clearSelection: () => void;
  
  // Computed
  ultraMatches: MatchCandidate[];
  filteredCandidates: MatchCandidate[];
  compatibleCount: number;
  
  // AI Features
  getCompatibility: (userId: string, candidateId: string) => CompatibilityScore | null;
  getIcebreakers: (userId: string, candidateId: string) => string[];
}

// ─── Hook Implementation ──────────────────────────────────────────────────────
export const useCompatibility = (
  options: UseCompatibilityOptions = {}
): UseCompatibilityReturn => {
  const {
    threshold = 70,
    sortBy = 'overall',
    limit,
  } = options;

  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Get selected candidate
  const selectedCandidate = useMemo(() => {
    return candidates.find(c => c.profile.id === selectedCandidateId) ?? null;
  }, [candidates, selectedCandidateId]);

  // Filter candidates by threshold
  const filteredCandidates = useMemo(() => {
    let filtered = filterByThreshold(candidates, threshold);
    
    // Sort
    filtered = sortByCompatibility(filtered);
    
    // Sort by specific dimension if not 'overall'
    if (sortBy !== 'overall') {
      const scoreKey = `${sortBy}Score` as keyof CompatibilityScore;
      filtered = [...filtered].sort((a, b) => 
        (b.compatibility[scoreKey] as number) - (a.compatibility[scoreKey] as number)
      );
    }
    
    // Limit
    if (limit) {
      filtered = filtered.slice(0, limit);
    }
    
    return filtered;
  }, [candidates, threshold, sortBy, limit]);

  // Get Ultra Matches (85%+)
  const ultraMatches = useMemo(() => {
    return candidates.filter(c => isUltraMatch(c.compatibility));
  }, [candidates]);

  // Count of compatible candidates
  const compatibleCount = useMemo(() => {
    return filteredCandidates.length;
  }, [filteredCandidates]);

  // Actions
  const selectCandidate = useCallback((id: string) => {
    setSelectedCandidateId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCandidateId(null);
  }, []);

  // Get compatibility between two users
  const getCompatibility = useCallback((
    userId: string,
    candidateId: string
  ): CompatibilityScore | null => {
    const candidate = candidates.find(c => c.profile.id === candidateId);
    return candidate?.compatibility ?? null;
  }, [candidates]);

  // Get icebreaker suggestions
  const getIcebreakers = useCallback((
    userId: string,
    candidateId: string
  ): string[] => {
    const candidate = candidates.find(c => c.profile.id === candidateId);
    if (!candidate) return [];
    
    // Create a mock user for demonstration
    const mockUser: UserProfile = {
      id: userId,
      name: 'You',
      age: 0,
      location: '',
      interests: [],
      lifestyle: {
        wakeUpTime: '6:30 AM',
        sleepTime: '11:00 PM',
        exerciseTime: 'morning',
        workStyle: 'flexible',
        socialEnergy: 'medium',
      },
      personality: {
        type: '',
        communicationStyle: 'balanced',
        loveLanguage: 'words',
        conflictStyle: 'calm',
      },
      relationshipGoal: 'long-term relationship',
      bio: '',
      photos: [],
    };
    
    return generateIcebreakers(mockUser, candidate.profile);
  }, [candidates]);

  return {
    // State
    candidates,
    selectedCandidate,
    isCalculating,
    
    // Actions
    setCandidates,
    selectCandidate,
    clearSelection,
    
    // Computed
    ultraMatches,
    filteredCandidates,
    compatibleCount,
    
    // AI Features
    getCompatibility,
    getIcebreakers,
  };
};

export default useCompatibility;