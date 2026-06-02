import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Safely triggers physical/tactile haptic feedback on mobile devices and browser PWAs.
 * Falls back gracefully to standard web API, or fails silently on unsupported platforms.
 */
export const triggerHaptic = async (
  style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
) => {
  // 1. Try Native Capacitor Haptics Plugin
  try {
    if (Haptics) {
      if (style === 'success') {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (style === 'warning') {
        await Haptics.notification({ type: NotificationType.Warning });
      } else if (style === 'error') {
        await Haptics.notification({ type: NotificationType.Error });
      } else {
        const impactStyle =
          style === 'heavy'
            ? ImpactStyle.Heavy
            : style === 'medium'
            ? ImpactStyle.Medium
            : ImpactStyle.Light;
        await Haptics.impact({ style: impactStyle });
      }
      return;
    }
  } catch {
    // Silent catch if Capacitor Haptics is unavailable
  }

  // 2. Try HTML5 Web Vibrate API Fallback
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (style === 'success') {
        navigator.vibrate([80, 40, 80]);
      } else if (style === 'error') {
        navigator.vibrate([150, 70, 150]);
      } else if (style === 'heavy') {
        navigator.vibrate(60);
      } else if (style === 'medium') {
        navigator.vibrate(30);
      } else {
        navigator.vibrate(15);
      }
    }
  } catch {
    // Silent catch if Vibrate API fails or is disabled
  }
};
