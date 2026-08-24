/**
 * ============================================================
 * DailyStack Design System — Haptic Tokens v1.0
 * ============================================================
 * The Tesla of Personal Finance — Kinetic Haptics Engine
 * 
 * Haptic Philosophy:
 * - Maps behavioral intent → haptic mass → Taptic Engine feedback
 * - Premium moments get deep resonance
 * - Micro-interactions get crisp clicks
 * - Never use vibration for errors — use visual + amber instead
 */

// ─── Haptic Preset Definitions ──────────────────────────────────────
export const hapticPresets = {
  /** Light tap — confirm minor selection, navigation */
  SELECT: {
    intensity: 0.15,
    sharpness: 0.95,
    time: 8,
    description: 'Light tap — confirm minor selection',
  },

  /** Crisp click — keypad input, toggle switch, primary CTA press */
  CRISP_CLICK: {
    intensity: 0.35,
    sharpness: 1.0,
    time: 12,
    description: 'Crisp click — keypad input, toggle switch',
  },

  /** Medium thud — card expansion, accordion open */
  THUD: {
    intensity: 0.50,
    sharpness: 0.65,
    time: 18,
    description: 'Medium thud — card expansion, accordion open',
  },

  /** Deep resonance — transaction recorded, goal achieved */
  DEEP_RESONANCE: {
    intensity: 0.70,
    sharpness: 0.30,
    time: 28,
    description: 'Deep resonance — transaction recorded, goal achieved',
  },

  /** Heavy thud — high-value transaction confirmed (5000+ THB) */
  HEAVY_THUD: {
    intensity: 0.88,
    sharpness: 0.20,
    time: 35,
    description: 'Heavy thud — high-value transaction confirmed',
  },

  /** Success cascade — streak milestone, achievement unlocked */
  SUCCESS_CASCADE: {
    intensity: 0.60,
    sharpness: 0.40,
    time: 24,
    pattern: 'cascade', // Three-phase: light → medium → deep
    description: 'Success cascade — streak milestone, achievement',
  },

  /** Amber pulse — approaching budget limit (NOT red!) */
  AMBER_PULSE: {
    intensity: 0.45,
    sharpness: 0.55,
    time: 22,
    description: 'Amber pulse — approaching budget limit',
  },

  /** Lock confirmation — Cooling Lock engaged */
  LOCK_CONFIRM: {
    intensity: 0.55,
    sharpness: 0.40,
    time: 24,
    description: 'Lock confirmation — Cooling Lock engaged',
  },

  /** Long press — gesture recognition initiated */
  LONG_PRESS: {
    intensity: 0.25,
    sharpness: 0.60,
    time: 15,
    description: 'Long press — gesture recognition initiated',
  },
} as const;

// ─── Haptic Usage Map ───────────────────────────────────────────────
export const hapticUsageMap = {
  // Navigation
  'nav.tab': hapticPresets.SELECT,
  'nav.back': hapticPresets.CRISP_CLICK,
  'nav.forward': hapticPresets.CRISP_CLICK,

  // Actions
  'action.button.primary': hapticPresets.CRISP_CLICK,
  'action.button.secondary': hapticPresets.THUD,
  'action.fab.press': hapticPresets.CRISP_CLICK,
  'action.toggle.on': hapticPresets.CRISP_CLICK,
  'action.toggle.off': hapticPresets.THUD,

  // Input
  'input.keypad': hapticPresets.SELECT,
  'input.text.submit': hapticPresets.CRISP_CLICK,
  'input.swipe.confirm': hapticPresets.THUD,

  // Transactions
  'transaction.record': hapticPresets.DEEP_RESONANCE,
  'transaction.high_value': hapticPresets.HEAVY_THUD,
  'transaction.transfer': hapticPresets.THUD,

  // Cards & Lists
  'card.expand': hapticPresets.THUD,
  'card.collapse': hapticPresets.SELECT,
  'list.item.select': hapticPresets.SELECT,
  'list.item.delete': hapticPresets.THUD,

  // Modal & Sheets
  'modal.open': hapticPresets.THUD,
  'modal.close': hapticPresets.SELECT,
  'sheet.open': hapticPresets.THUD,
  'sheet.close': hapticPresets.SELECT,

  // Goals & Achievements
  'goal.achieved': hapticPresets.SUCCESS_CASCADE,
  'streak.milestone': hapticPresets.SUCCESS_CASCADE,
  'badge.unlock': hapticPresets.SUCCESS_CASCADE,

  // Budget & Warnings
  'budget.approaching': hapticPresets.AMBER_PULSE,
  'budget.exceeded': hapticPresets.AMBER_PULSE,
  'lock.engage': hapticPresets.LOCK_CONFIRM,

  // Gestures
  'gesture.swipe': hapticPresets.SELECT,
  'gesture.long_press': hapticPresets.LONG_PRESS,
  'gesture.pinch': hapticPresets.THUD,
} as const;

// ─── Haptic Context Triggers ───────────────────────────────────────
export const hapticTriggers = {
  // When user presses a numeric keypad key
  onKeypadPress: 'action.keypad',

  // When a transaction is successfully recorded
  onTransactionSuccess: 'transaction.record',

  // When a high-value transaction (>5000 THB) is confirmed
  onHighValueConfirm: 'transaction.high_value',

  // When budget warning threshold is approached
  onBudgetWarning: 'budget.approaching',

  // When Cooling Lock is toggled
  onCoolingLockToggle: 'lock.engage',

  // When a goal is achieved
  onGoalAchieved: 'goal.achieved',

  // When a streak milestone is hit
  onStreakMilestone: 'streak.milestone',

  // When an action is rejected (use visual + amber, not haptic)
  onRejection: null, // No haptic for errors — use visual feedback instead

  // When gesture is recognized (swipe, pinch, longpress)
  onGestureRecognized: 'gesture.swipe',
} as const;

// ─── Type Definitions ──────────────────────────────────────────────
export type HapticPresetKey = keyof typeof hapticPresets;
export type HapticUsageKey = keyof typeof hapticUsageMap;
export type HapticTriggerKey = keyof typeof hapticTriggers;

export interface HapticParams {
  /** 0.0 – 1.0 : perceived impact mass */
  intensity: number;
  /** 0.0 – 1.0 : attack sharpness (1 = instant crisp) */
  sharpness: number;
  /** ms : total haptic event duration */
  time: number;
}

export interface HapticPresetDefinition extends HapticParams {
  description: string;
  pattern?: 'single' | 'cascade' | 'pulse';
}

// ─── iOS Taptic Engine Mapping ─────────────────────────────────────
export const tapticMapping = {
  // iOS Impact Feedback Styles
  impact: {
    light: 'UIImpactFeedbackGenerator.FeedbackStyle.light',
    medium: 'UIImpactFeedbackGenerator.FeedbackStyle.medium',
    heavy: 'UIImpactFeedbackGenerator.FeedbackStyle.heavy',
    soft: 'UIImpactFeedbackGenerator.FeedbackStyle.soft',
    rigid: 'UIImpactFeedbackGenerator.FeedbackStyle.rigid',
  },
  // iOS Notification Feedback Types
  notification: {
    success: 'UINotificationFeedbackGenerator.FeedbackType.success',
    warning: 'UINotificationFeedbackGenerator.FeedbackType.warning',
    error: 'UINotificationFeedbackGenerator.FeedbackType.error',
  },
  // iOS Selection Feedback
  selection: 'UISelectionFeedbackGenerator()',
} as const;

// ─── Android Vibration Pattern Mapping ─────────────────────────────
export const vibrationMapping = {
  // Maps HapticParams to Android VibrationEffect
  // intensity (0-1) → amplitude (0-255)
  // time → duration in ms
  toAmplitude: (intensity: number): number => Math.round(intensity * 255),
  toDuration: (time: number): number => time,
} as const;

// ─── Haptic System Export ───────────────────────────────────────────
export const hapticTokens = {
  presets: hapticPresets,
  usageMap: hapticUsageMap,
  triggers: hapticTriggers,
  tapticMapping,
  vibrationMapping,
} as const;

export type HapticTokens = typeof hapticTokens;

// ─── CSS Custom Properties for Haptic States ───────────────────────
export const hapticCSSVariables = {
  '--haptic-intensity-select': hapticPresets.SELECT.intensity,
  '--haptic-sharpness-select': hapticPresets.SELECT.sharpness,
  '--haptic-time-select': hapticPresets.SELECT.time,

  '--haptic-intensity-crisp': hapticPresets.CRISP_CLICK.intensity,
  '--haptic-sharpness-crisp': hapticPresets.CRISP_CLICK.sharpness,
  '--haptic-time-crisp': hapticPresets.CRISP_CLICK.time,

  '--haptic-intensity-thud': hapticPresets.THUD.intensity,
  '--haptic-sharpness-thud': hapticPresets.THUD.sharpness,
  '--haptic-time-thud': hapticPresets.THUD.time,

  '--haptic-intensity-deep': hapticPresets.DEEP_RESONANCE.intensity,
  '--haptic-sharpness-deep': hapticPresets.DEEP_RESONANCE.sharpness,
  '--haptic-time-deep': hapticPresets.DEEP_RESONANCE.time,

  '--haptic-intensity-heavy': hapticPresets.HEAVY_THUD.intensity,
  '--haptic-sharpness-heavy': hapticPresets.HEAVY_THUD.sharpness,
  '--haptic-time-heavy': hapticPresets.HEAVY_THUD.time,

  '--haptic-intensity-success': hapticPresets.SUCCESS_CASCADE.intensity,
  '--haptic-sharpness-success': hapticPresets.SUCCESS_CASCADE.sharpness,
  '--haptic-time-success': hapticPresets.SUCCESS_CASCADE.time,

  '--haptic-intensity-amber': hapticPresets.AMBER_PULSE.intensity,
  '--haptic-sharpness-amber': hapticPresets.AMBER_PULSE.sharpness,
  '--haptic-time-amber': hapticPresets.AMBER_PULSE.time,
} as const;
