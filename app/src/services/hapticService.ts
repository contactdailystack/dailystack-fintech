/**
 * ============================================================
 * DailyStack — Kinetic Haptics Engine v1.0
 * ============================================================
 * Sentient Physics Integration for Tesla-of-Personal-Finance UX
 * Maps behavioral intent → haptic mass → Taptic Engine feedback
 *
 * Design Reference: Tesla vehicle controls + Apple ProMotion
 * Physics Model: Spring-damper system with behavioral weight scaling
 */

// ─── Haptic Mass Constants ────────────────────────────────────────
export const HAPTIC_MASS = {
  /** Light tap — confirm minor selection */
  SELECT: { intensity: 0.08, sharpness: 0.9, time: 12 },
  /** Crisp click — keypad input, toggle switch */
  CRISP_CLICK: { intensity: 0.28, sharpness: 0.98, time: 14 },
  /** Medium thud — card expansion, accordion open */
  THUD: { intensity: 0.45, sharpness: 0.6, time: 20 },
  /** Deep resonance — transaction recorded, goal achieved */
  DEEP_RESONANCE: { intensity: 0.68, sharpness: 0.28, time: 30 },
  /** Heavy thud — high-value transaction confirmed */
  HEAVY_THUD: { intensity: 0.88, sharpness: 0.22, time: 38 },
  /** Warning buzz — approaching budget limit (amber pulse) */
  AMBER_PULSE: { intensity: 0.48, sharpness: 0.58, time: 20 },
  /** Error rejection — insufficient funds / validation fail */
  ERROR_REJECT: { intensity: 0.62, sharpness: 0.85, time: 18 },
  /** Lock confirmation — Cooling Lock engaged */
  LOCK_CONFIRM: { intensity: 0.5, sharpness: 0.42, time: 22 },
} as const;

// ─── Type Definitions ────────────────────────────────────────────
export type HapticPreset = keyof typeof HAPTIC_MASS;

export interface HapticParams {
  /** 0.0 – 1.0 : perceived impact mass */
  intensity: number;
  /** 0.0 – 1.0 : attack sharpness (1 = instant crisp) */
  sharpness: number;
  /** ms : total haptic event duration */
  time: number;
}

export interface HapticContext {
  /** Triggered when user presses a numeric keypad key */
  onKeypadPress: (keyValue: string) => void;
  /** Triggered when a transaction is successfully recorded */
  onTransactionSuccess: (amount: number) => void;
  /** Triggered when a high-value transaction (>5000 THB) is confirmed */
  onHighValueConfirm: (amount: number) => void;
  /** Triggered when budget warning threshold is approached */
  onBudgetWarning: (percentUsed: number) => void;
  /** Triggered when Cooling Lock is toggled */
  onCoolingLockToggle: (isEngaged: boolean) => void;
  /** Triggered when an action is rejected (validation fail) */
  onRejection: (reason: string) => void;
  /** Triggered when a goal is achieved */
  onGoalAchieved: (goalId: string) => void;
  /** Triggered on gesture recognition (swipe, pinch) */
  onGestureRecognized: (gesture: 'swipe' | 'pinch' | 'longpress') => void;
}

// ─── Singleton Haptic Manager ──────────────────────────────────────
class KineticHaptics {
  private static instance: KineticHaptics;
  private isSupported = false;
  private vibrator: { vibrate: (n: number | number[]) => void } | null = null;

  private constructor() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      this.isSupported = true;
      this.vibrator = navigator;
    }
  }

  static getInstance(): KineticHaptics {
    if (!KineticHaptics.instance) {
      KineticHaptics.instance = new KineticHaptics();
    }
    return KineticHaptics.instance;
  }

  /** Fire a preset haptic pattern */
  fire(preset: HapticPreset): void {
    if (!this.isSupported) return;

    const params = HAPTIC_MASS[preset];
    this.fireCustom(params);
  }

  /** Fire a custom haptic with behavioral weight scaling */
  fireCustom(params: HapticParams): void {
    if (!this.isSupported || !this.vibrator) return;

    // Map intensity (0-1) → vibration amplitude pattern
    // sharpness modulates the attack/decay envelope
    const { intensity, sharpness, time } = params;

    // Create a two-phase vibration: sharp attack + soft decay
    // Phase 1: Initial impulse (sharp attack)
    const phase1Duration = Math.round(time * sharpness * 0.3);
    const phase1Amplitude = Math.round(intensity * 255);

    // Phase 2: Sustain + decay (soft body)
    const phase2Duration = Math.round(time * (1 - sharpness * 0.3));
    const phase2Amplitude = Math.round(intensity * 255 * (1 - sharpness * 0.5));

    // Phase 3: Final settle
    const phase3Duration = Math.round(time * 0.1);
    const phase3Amplitude = Math.round(intensity * 255 * 0.2);

    const pattern: number[] = [];

    if (phase1Duration > 0) {
      pattern.push(phase1Duration, phase1Amplitude);
    }
    if (phase2Duration > 0) {
      pattern.push(phase2Duration, phase2Amplitude);
    }
    if (phase3Duration > 0) {
      pattern.push(phase3Duration, phase3Amplitude);
    }

    // Clamp amplitude to valid range
    const clampedPattern = pattern.map((v, i) =>
      i % 2 === 1 ? Math.min(255, Math.max(0, v)) : v
    );

    try {
      this.vibrator.vibrate(clampedPattern);
    } catch {
      // Silently handle vibration API errors
    }
  }

  /** High-value transaction haptic with viscous drag weight */
  fireHighValueTransaction(amountTHB: number): void {
    if (amountTHB >= 5000) {
      // Progressive intensity based on amount
      // Max at 50,000 THB — beyond that, capped
      const scale = Math.min(amountTHB / 50000, 1.0);
      const heavyThud: HapticParams = { ...HAPTIC_MASS.HEAVY_THUD };
      heavyThud.intensity = 0.70 + scale * 0.30;
      heavyThud.time = Math.round(35 + scale * 15);
      this.fireCustom(heavyThud);
    } else {
      this.fire('DEEP_RESONANCE');
    }
  }

  /** Budget warning with amber pulse rate modulation */
  fireBudgetWarning(percentUsed: number): void {
    if (percentUsed >= 90) {
      // Urgent: rapid amber pulse
      this.fireCustom({ intensity: 0.60, sharpness: 0.70, time: 18 });
      setTimeout(() => this.fireCustom({ intensity: 0.40, sharpness: 0.60, time: 14 }), 80);
    } else if (percentUsed >= 75) {
      // Warning: medium amber pulse
      this.fireCustom({ intensity: 0.45, sharpness: 0.55, time: 22 });
    } else {
      // Soft notice: single light tap
      this.fire('SELECT');
    }
  }

  /** Stop any active vibration */
  stop(): void {
    if (this.isSupported && this.vibrator) {
      this.vibrator.vibrate(0);
    }
  }
}

// ─── React Hook ──────────────────────────────────────────────────
export const useHaptics = () => {
  const haptics = KineticHaptics.getInstance();

  return {
    fire: haptics.fire.bind(haptics),
    fireCustom: haptics.fireCustom.bind(haptics),
    fireHighValueTransaction: haptics.fireHighValueTransaction.bind(haptics),
    fireBudgetWarning: haptics.fireBudgetWarning.bind(haptics),
    stop: haptics.stop.bind(haptics),
    isSupported: (haptics as unknown as { isSupported: boolean }).isSupported,
  };
};

// ─── Singleton Export ─────────────────────────────────────────────
export const haptics = KineticHaptics.getInstance();
