/**
 * DailyStack — Dating AI Service
 * AI Compatibility Engine for match scoring and recommendations
 */

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  interests: string[];
  lifestyle: {
    wakeUpTime: string;
    sleepTime: string;
    exerciseTime: string;
    workStyle: 'early' | 'late' | 'flexible';
    socialEnergy: 'high' | 'medium' | 'low';
  };
  personality: {
    type: string;
    communicationStyle: string;
    loveLanguage: string;
    conflictStyle: string;
  };
  relationshipGoal: string;
  bio: string;
  photos: string[];
}

export interface CompatibilityScore {
  overall: number;
  lifestyleScore: number;
  personalityScore: number;
  emotionalScore: number;
  communicationScore: number;
  insights: string[];
  riskFactors: string[];
  matchReasons: string[];
}

export interface MatchCandidate {
  profile: UserProfile;
  compatibility: CompatibilityScore;
  isUltraMatch: boolean;
  compatibilityLevel: 'excellent' | 'good' | 'potential';
}

// ─── Compatibility Weights ─────────────────────────────────────────────────────
const WEIGHTS = {
  lifestyle: 0.30,
  personality: 0.25,
  emotional: 0.20,
  communication: 0.15,
  goals: 0.10,
};

// ─── AI Compatibility Engine ──────────────────────────────────────────────────

/**
 * Calculate lifestyle compatibility score
 */
export const calculateLifestyleScore = (
  user: UserProfile,
  candidate: UserProfile
): { score: number; insights: string[] } => {
  let score = 50; // Base score
  const insights: string[] = [];

  // Wake up time similarity
  const userWakeHour = parseTimeToHour(user.lifestyle.wakeUpTime);
  const candidateWakeHour = parseTimeToHour(candidate.lifestyle.wakeUpTime);
  const wakeDiff = Math.abs(userWakeHour - candidateWakeHour);
  
  if (wakeDiff <= 1) {
    score += 15;
    insights.push(`Both of you are early birds 🌅`);
  } else if (wakeDiff <= 2) {
    score += 8;
    insights.push(`Similar morning energy levels`);
  } else if (wakeDiff >= 4) {
    insights.push(`Different sleep schedules - morning vs night owl`);
  }

  // Sleep time similarity
  const userSleepHour = parseTimeToHour(user.lifestyle.sleepTime);
  const candidateSleepHour = parseTimeToHour(candidate.lifestyle.sleepTime);
  const sleepDiff = Math.abs(userSleepHour - candidateSleepHour);
  
  if (sleepDiff <= 1) {
    score += 10;
    insights.push(`Compatible bedtime routines`);
  }

  // Exercise time
  if (user.lifestyle.exerciseTime === candidate.lifestyle.exerciseTime) {
    score += 10;
    insights.push(`Same fitness routine timing`);
  }

  // Work style
  if (user.lifestyle.workStyle === candidate.lifestyle.workStyle) {
    score += 8;
  }

  // Social energy
  const energyDiff = Math.abs(
    ['high', 'medium', 'low'].indexOf(user.lifestyle.socialEnergy) -
    ['high', 'medium', 'low'].indexOf(candidate.lifestyle.socialEnergy)
  );
  if (energyDiff <= 1) score += 7;

  return { score: Math.min(100, Math.max(0, score)), insights };
};

/**
 * Calculate personality compatibility score
 */
export const calculatePersonalityScore = (
  user: UserProfile,
  candidate: UserProfile
): { score: number; insights: string[] } => {
  let score = 50;
  const insights: string[] = [];

  // Communication style compatibility
  const compatibleStyles: Record<string, string[]> = {
    'direct': ['direct', 'balanced'],
    'emotional': ['emotional', 'balanced'],
    'analytical': ['analytical', 'balanced'],
    'balanced': ['direct', 'emotional', 'analytical', 'balanced'],
  };

  const userStyle = user.personality.communicationStyle.toLowerCase();
  const candidateStyle = candidate.personality.communicationStyle.toLowerCase();
  
  if (compatibleStyles[userStyle]?.includes(candidateStyle)) {
    score += 20;
    insights.push(`Compatible communication styles - ${userStyle} meets ${candidateStyle}`);
  }

  // Love language
  if (user.personality.loveLanguage === candidate.personality.loveLanguage) {
    score += 15;
    insights.push(`Same love language: ${user.personality.loveLanguage}`);
  }

  // Conflict style
  const healthyConflicts = ['assertive', 'calm', 'compromising'];
  const userConflict = user.personality.conflictStyle.toLowerCase();
  const candidateConflict = candidate.personality.conflictStyle.toLowerCase();
  
  if (
    healthyConflicts.includes(userConflict) && 
    healthyConflicts.includes(candidateConflict)
  ) {
    score += 15;
    insights.push(`Healthy conflict resolution approaches`);
  }

  return { score: Math.min(100, Math.max(0, score)), insights };
};

/**
 * Calculate emotional compatibility score
 */
export const calculateEmotionalScore = (
  user: UserProfile,
  candidate: UserProfile
): { score: number; insights: string[] } => {
  let score = 50;
  const insights: string[] = [];

  // Relationship goal alignment
  const seriousGoals = ['long-term relationship', 'marriage', 'serious'];
  const userGoal = user.relationshipGoal.toLowerCase();
  const candidateGoal = candidate.relationshipGoal.toLowerCase();

  const userIsSerious = seriousGoals.some(g => userGoal.includes(g));
  const candidateIsSerious = seriousGoals.some(g => candidateGoal.includes(g));

  if (userIsSerious && candidateIsSerious) {
    score += 30;
    insights.push(`Both seeking serious relationship 💕`);
  } else if (!userIsSerious && !candidateIsSerious) {
    score += 20;
    insights.push(`Both open to exploring without pressure`);
  } else {
    score -= 10;
    insights.push(`Different relationship expectations`);
  }

  return { score: Math.min(100, Math.max(0, score)), insights };
};

/**
 * Calculate communication score
 */
export const calculateCommunicationScore = (
  user: UserProfile,
  candidate: UserProfile
): { score: number; insights: string[] } => {
  let score = 60;
  const insights: string[] = [];

  // Shared interests as conversation starters
  const sharedInterests = user.interests.filter(i => 
    candidate.interests.some(c => c.toLowerCase() === i.toLowerCase())
  );

  if (sharedInterests.length >= 3) {
    score += 25;
    insights.push(`Rich shared interests: ${sharedInterests.slice(0, 3).join(', ')}`);
  } else if (sharedInterests.length >= 1) {
    score += 15;
    insights.push(`Common ground: ${sharedInterests[0]}`);
  }

  return { score: Math.min(100, Math.max(0, score)), insights };
};

/**
 * Main compatibility calculation
 */
export const calculateCompatibility = (
  user: UserProfile,
  candidate: UserProfile
): CompatibilityScore => {
  const lifestyle = calculateLifestyleScore(user, candidate);
  const personality = calculatePersonalityScore(user, candidate);
  const emotional = calculateEmotionalScore(user, candidate);
  const communication = calculateCommunicationScore(user, candidate);

  // Weighted overall score
  const overall = Math.round(
    lifestyle.score * WEIGHTS.lifestyle +
    personality.score * WEIGHTS.personality +
    emotional.score * WEIGHTS.emotional +
    communication.score * WEIGHTS.communication
  );

  // Combine insights
  const insights = [
    ...lifestyle.insights,
    ...personality.insights,
    ...emotional.insights,
    ...communication.insights,
  ];

  // Identify risk factors
  const riskFactors: string[] = [];
  if (overall < 70) riskFactors.push('Overall compatibility below average');
  if (lifestyle.score < 60) riskFactors.push('Significant lifestyle differences');
  if (emotional.score < 60) riskFactors.push('Different relationship expectations');

  return {
    overall,
    lifestyleScore: lifestyle.score,
    personalityScore: personality.score,
    emotionalScore: emotional.score,
    communicationScore: communication.score,
    insights: insights.slice(0, 5),
    riskFactors,
    matchReasons: insights,
  };
};

/**
 * Generate AI icebreaker suggestions
 */
export const generateIcebreakers = (
  user: UserProfile,
  candidate: UserProfile
): string[] => {
  const suggestions: string[] = [];
  
  // Based on shared interests
  const sharedInterests = user.interests.filter(i => 
    candidate.interests.some(c => c.toLowerCase() === i.toLowerCase())
  );
  
  if (sharedInterests.includes('Coffee') || sharedInterests.includes('coffee')) {
    suggestions.push("☕ What's your go-to coffee order? I'm always looking for new recommendations!");
  }
  
  if (sharedInterests.includes('Travel') || sharedInterests.includes('travel')) {
    suggestions.push("✈️ I saw you're into travel! What's the best place you've been to recently?");
  }
  
  if (sharedInterests.includes('Reading') || sharedInterests.includes('reading')) {
    suggestions.push("📚 What are you reading right now? I always need book recommendations!");
  }
  
  if (sharedInterests.includes('Fitness') || sharedInterests.includes('fitness')) {
    suggestions.push("💪 What's your current fitness routine? Looking for new workout ideas!");
  }

  // Based on compatibility insights
  suggestions.push("I noticed we have similar lifestyle preferences! What brought you to DailyStack?");
  
  // Generic but engaging
  suggestions.push("Hey! Your profile caught my attention. What's one thing you're passionate about?");
  
  return suggestions.slice(0, 4);
};

/**
 * Determine if candidate is an Ultra Match (85%+ compatibility)
 */
export const isUltraMatch = (compatibility: CompatibilityScore): boolean => {
  return compatibility.overall >= 85 && 
    compatibility.lifestyleScore >= 80 &&
    compatibility.personalityScore >= 80;
};

/**
 * Sort candidates by compatibility
 */
export const sortByCompatibility = (candidates: MatchCandidate[]): MatchCandidate[] => {
  return [...candidates].sort((a, b) => b.compatibility.overall - a.compatibility.overall);
};

/**
 * Filter candidates by minimum compatibility threshold
 */
export const filterByThreshold = (
  candidates: MatchCandidate[],
  threshold: number = 70
): MatchCandidate[] => {
  return candidates.filter(c => c.compatibility.overall >= threshold);
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Parse time string (e.g., "6:30 AM") to hour number (e.g., 6.5)
 */
const parseTimeToHour = (timeStr: string): number => {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 12;
  
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return hours + minutes / 60;
};

/**
 * Generate AI compatibility report
 */
export const generateCompatibilityReport = (
  user: UserProfile,
  candidate: UserProfile
): string => {
  const compat = calculateCompatibility(user, candidate);
  
  let report = `## Compatibility Report: ${user.name} & ${candidate.name}\n\n`;
  report += `### Overall Score: ${compat.overall}%\n\n`;
  
  report += `### Breakdown\n`;
  report += `- Lifestyle: ${compat.lifestyleScore}%\n`;
  report += `- Personality: ${compat.personalityScore}%\n`;
  report += `- Emotional: ${compat.emotionalScore}%\n`;
  report += `- Communication: ${compat.communicationScore}%\n\n`;
  
  report += `### Why You Match\n`;
  compat.insights.forEach((insight, i) => {
    report += `${i + 1}. ${insight}\n`;
  });
  
  if (compat.riskFactors.length > 0) {
    report += `\n### Points to Discuss\n`;
    compat.riskFactors.forEach((risk, i) => {
      report += `${i + 1}. ${risk}\n`;
    });
  }
  
  return report;
};

// ─── Default Export ───────────────────────────────────────────────────────────
export const DatingAI = {
  calculateCompatibility,
  generateIcebreakers,
  isUltraMatch,
  sortByCompatibility,
  filterByThreshold,
  generateCompatibilityReport,
};

export default DatingAI;