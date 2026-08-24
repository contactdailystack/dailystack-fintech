/**
 * pushService.ts — Web Push subscription + local SW notifications
 * Registers /sw.js, subscribes the browser via VAPID, and persists
 * the PushSubscription to public.push_subscriptions.
 */

import { supabase } from '../supabaseClient';

const SW_PATH = '/sw.js';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

function getVapidPublicKey(): string {
  const key = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
  return key || '';
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/** Register the service worker. Safe to call repeatedly. */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register(SW_PATH);
    await navigator.serviceWorker.ready;
    return registration;
  } catch (e) {
    console.error('[pushService] SW registration failed:', e);
    return null;
  }
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return (await navigator.serviceWorker.getRegistration(SW_PATH))
      || (await registerServiceWorker());
  } catch {
    return null;
  }
}

/**
 * Ask for notification permission, subscribe to web push, and
 * store the subscription row. Returns true on success.
 */
export async function subscribeToPush(): Promise<boolean> {
  if (!isPushSupported()) {
    console.warn('[pushService] Push not supported in this browser');
    return false;
  }

  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    console.warn('[pushService] Missing VITE_VAPID_PUBLIC_KEY');
    return false;
  }

  try {
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') return false;

    const registration = await getRegistration();
    if (!registration) return false;

    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      }));

    const json = subscription.toJSON();
    const keys = (json.keys || {}) as { p256dh?: string; auth?: string };
    if (!keys.p256dh || !keys.auth) {
      console.error('[pushService] Subscription missing keys');
      return false;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: user.id,
        endpoint: json.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: navigator.userAgent,
      },
      { onConflict: 'endpoint' }
    );

    if (error) {
      console.error('[pushService] Save subscription error:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[pushService] Subscribe exception:', e);
    return false;
  }
}

/** Remove server-side subscription rows and unsubscribe the browser. */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await getRegistration();
    const subscription = registration
      ? await registration.pushManager.getSubscription()
      : null;

    if (subscription?.endpoint) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);
    }
    await subscription?.unsubscribe();
    return true;
  } catch (e) {
    console.error('[pushService] Unsubscribe exception:', e);
    return false;
  }
}

/**
 * Show a local notification through the service worker.
 * Works after permission is granted — no push server needed.
 */
export async function showLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<boolean> {
  try {
    if ('Notification' in window && Notification.permission !== 'granted') {
      return false;
    }
    const registration = await getRegistration();
    if (registration) {
      await registration.showNotification(title, {
        body,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: (data?.tag as string) || 'pickswise-alert',
        data,
      });
      return true;
    }

    // Fallback: page-scoped Notification (no SW)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icons/logo.png', tag: 'pickswise-alert' });
      return true;
    }
    return false;
  } catch (e) {
    console.error('[pushService] Local notification failed:', e);
    return false;
  }
}
