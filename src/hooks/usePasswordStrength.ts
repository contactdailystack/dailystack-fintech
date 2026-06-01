/**
 * Hook: Password Strength Meter
 * Returns strength level (weak, fair, good, strong) + feedback message
 */

export interface PasswordStrengthResult {
  score: number; // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  isValid: boolean; // min 8 chars + meets criteria
}

export const usePasswordStrength = (password: string): PasswordStrengthResult => {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return { score: 0, level: 'weak', feedback: ['Password is required'], isValid: false };
  }

  // Minimum length requirement (8 chars)
  if (password.length < 8) {
    feedback.push(`At least 8 characters (${password.length}/8)`);
    score += Math.min(password.length / 8 * 20, 20);
  } else {
    score += 20;
    if (password.length >= 12) score += 5;
    if (password.length >= 16) score += 5;
  }

  // Lowercase letters
  if (/[a-z]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add lowercase letters (a-z)');
  }

  // Uppercase letters
  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add uppercase letters (A-Z)');
  }

  // Numbers
  if (/[0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add numbers (0-9)');
  }

  // Special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add special characters (!@#$%^&* etc.)');
  }

  // Common patterns (reduce score)
  if (/(.)\1{2,}/.test(password)) {
    // Repeated characters
    feedback.push('Avoid repeated characters');
    score -= 10;
  }

  if (/123|234|345|456|567|678|789|890|abc|bcd|cde/.test(password.toLowerCase())) {
    // Sequential characters
    feedback.push('Avoid sequential characters');
    score -= 10;
  }

  score = Math.max(0, Math.min(score, 100));

  const isValid = password.length >= 8 && !/(.)\1{2,}/.test(password);
  let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak';

  if (score >= 75) level = 'strong';
  else if (score >= 55) level = 'good';
  else if (score >= 35) level = 'fair';

  return { score, level, feedback, isValid };
};
