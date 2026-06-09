/**
 * alertNotifications.ts — Behavioral Alerts Notification System
 * DailyStack FinTech — Multi-channel Notifications
 */

import { 
  BehavioralAlert, 
  AlertPreferences, 
  NotificationChannel,
  AlertRule
} from './alertTypes';
import { supabase } from '../../supabaseClient';
import { isQuietHours } from './alertEngine';

// ─── Notification Queue ───────────────────────────────────────────────────

interface QueuedNotification {
  alert: BehavioralAlert;
  channel: NotificationChannel;
  scheduledFor?: Date;
  retryCount: number;
}

// In-memory notification queue (in production, use Redis or similar)
const notificationQueue: QueuedNotification[] = [];
const MAX_RETRIES = 3;

// ─── Notification Templates ───────────────────────────────────────────────

const NOTIFICATION_TEMPLATES = {
  in_app: {
    title: (alert: BehavioralAlert) => alert.title,
    body: (alert: BehavioralAlert) => alert.message.substring(0, 100) + (alert.message.length > 100 ? '...' : ''),
    icon: 'notification',
    badge: 'notification',
  },
  push: {
    title: (alert: BehavioralAlert) => `[DailyStack] ${alert.title}`,
    body: (alert: BehavioralAlert) => alert.message,
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
  },
  email: {
    subject: (alert: BehavioralAlert) => `DailyStack Alert: ${alert.title}`,
    body: (alert: BehavioralAlert) => `
      <h2>${alert.title}</h2>
      <p>${alert.message}</p>
      ${alert.metricValues ? `
        <h3>Current Metrics</h3>
        <ul>
          ${Object.entries(alert.metricValues).map(([key, value]) => 
            `<li><strong>${formatMetricName(key)}:</strong> ${value}</li>`
          ).join('')}
        </ul>
      ` : ''}
      <p>
        <a href="https://dailystack.app/alerts/${alert.id}">
          View Details in DailyStack
        </a>
      </p>
    `,
  },
  sms: {
    body: (alert: BehavioralAlert) => 
      `[DailyStack] ${alert.title}: ${alert.message.substring(0, 80)}...`,
  },
};

// ─── Notification Sender Interface ────────────────────────────────────────

interface NotificationSender {
  send(notification: NotificationPayload): Promise<boolean>;
}

interface NotificationPayload {
  channel: NotificationChannel;
  title?: string;
  body: string;
  data?: Record<string, unknown>;
  badge?: number;
}

// ─── In-App Notification Sender ───────────────────────────────────────────

class InAppNotificationSender implements NotificationSender {
  async send(notification: NotificationPayload): Promise<boolean> {
    try {
      // Dispatch to browser notifications API if available
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(notification.title || 'DailyStack', {
            body: notification.body,
            icon: '/icons/logo.png',
            tag: 'dailystack-alert',
          });
        }
      }

      // Also dispatch custom event for in-app toast system
      window.dispatchEvent(new CustomEvent('dailystack:alert', {
        detail: {
          id: Date.now().toString(),
          title: notification.title,
          message: notification.body,
          type: notification.data?.severity as string || 'info',
          timestamp: new Date().toISOString(),
        },
      }));

      return true;
    } catch {
      return false;
    }
  }
}

// ─── Push Notification Sender ─────────────────────────────────────────────

class PushNotificationSender implements NotificationSender {
  async send(notification: NotificationPayload): Promise<boolean> {
    try {
      // Check if service worker is available
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // In production, you would subscribe to push service here
      // For now, we'll just log
      console.log('Push notification would be sent:', notification);
      
      return true;
    } catch {
      return false;
    }
  }
}

// ─── Email Notification Sender ─────────────────────────────────────────────

class EmailNotificationSender implements NotificationSender {
  async send(notification: NotificationPayload): Promise<boolean> {
    try {
      // In production, this would call an Edge Function or external email service
      // For now, we'll use Supabase Edge Function
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return false;

      // Call edge function to send email
      const { error } = await supabase.functions.invoke('send-alert-email', {
        body: {
          to: user.email,
          subject: notification.title,
          html: notification.body,
          alertId: notification.data?.alertId,
        },
      });

      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  }
}

// ─── SMS Notification Sender ──────────────────────────────────────────────

class SMSNotificationSender implements NotificationSender {
  async send(notification: NotificationPayload): Promise<boolean> {
    try {
      // In production, integrate with Twilio, Vonage, or similar
      console.log('SMS would be sent:', notification.body);
      return true;
    } catch {
      return false;
    }
  }
}

// ─── Sender Registry ──────────────────────────────────────────────────────

const senders: Record<NotificationChannel, NotificationSender> = {
  in_app: new InAppNotificationSender(),
  push: new PushNotificationSender(),
  email: new EmailNotificationSender(),
  sms: new SMSNotificationSender(),
};

// ─── Main Notification Service ─────────────────────────────────────────────

export class AlertNotificationService {
  private static instance: AlertNotificationService;
  
  private constructor() {
    // Start processing queue periodically
    if (typeof window !== 'undefined') {
      this.startQueueProcessor();
    }
  }

  static getInstance(): AlertNotificationService {
    if (!AlertNotificationService.instance) {
      AlertNotificationService.instance = new AlertNotificationService();
    }
    return AlertNotificationService.instance;
  }

  /**
   * Send notification for an alert through configured channels
   */
  async sendAlertNotification(
    alert: BehavioralAlert,
    preferences: AlertPreferences
  ): Promise<Record<NotificationChannel, boolean>> {
    const results: Record<NotificationChannel, boolean> = {
      in_app: false,
      push: false,
      email: false,
      sms: false,
    };

    // Check if alerts are enabled
    if (!preferences.alertsEnabled) {
      return results;
    }

    // Check quiet hours
    if (isQuietHours(preferences.quietHours)) {
      // Queue for later delivery
      if (preferences.quietMode) {
        // Respect quiet mode - don't queue
        return results;
      }
      // Otherwise, queue for when quiet hours end
      this.queueNotification(alert, 'in_app');
      return results;
    }

    // Get channels for this alert's category
    const categoryPrefs = preferences.categories[alert.category];
    if (!categoryPrefs?.enabled) {
      return results;
    }

    // Check severity threshold
    if (!this.meetsSeverityThreshold(alert.severity, categoryPrefs.minSeverity)) {
      return results;
    }

    // Send to each enabled channel
    for (const channel of alert.deliveredTo) {
      const channelPrefs = preferences.channels[channel];
      if (!channelPrefs?.enabled) continue;

      try {
        const success = await this.sendToChannel(alert, channel);
        results[channel] = success;

        if (!success) {
          // Queue for retry
          this.queueNotification(alert, channel);
        }
      } catch {
        results[channel] = false;
        this.queueNotification(alert, channel);
      }
    }

    return results;
  }

  /**
   * Send notification to a specific channel
   */
  private async sendToChannel(
    alert: BehavioralAlert,
    channel: NotificationChannel
  ): Promise<boolean> {
    const sender = senders[channel];
    if (!sender) return false;

    const templates = NOTIFICATION_TEMPLATES[channel];
    
    const payload: NotificationPayload = {
      channel,
      title: 'title' in templates ? templates.title(alert) : undefined,
      body: templates.body(alert),
      data: {
        alertId: alert.id,
        category: alert.category,
        severity: alert.severity,
      },
    };

    return sender.send(payload);
  }

  /**
   * Check if alert severity meets category threshold
   */
  private meetsSeverityThreshold(
    alertSeverity: string,
    minSeverity: string
  ): boolean {
    const severityOrder = ['info', 'warning', 'alert', 'critical'];
    const alertIndex = severityOrder.indexOf(alertSeverity);
    const minIndex = severityOrder.indexOf(minSeverity);
    return alertIndex >= minIndex;
  }

  /**
   * Queue notification for later delivery
   */
  private queueNotification(
    alert: BehavioralAlert,
    channel: NotificationChannel
  ): void {
    // Remove any existing queued notification for the same alert/channel
    const existingIndex = notificationQueue.findIndex(
      n => n.alert.id === alert.id && n.channel === channel
    );
    if (existingIndex >= 0) {
      notificationQueue.splice(existingIndex, 1);
    }

    // Calculate retry delay
    const retryCount = 0;
    const delayMs = Math.min(1000 * Math.pow(2, retryCount), 300000); // Max 5 minutes

    notificationQueue.push({
      alert,
      channel,
      scheduledFor: new Date(Date.now() + delayMs),
      retryCount,
    });
  }

  /**
   * Start processing the notification queue
   */
  private startQueueProcessor(): void {
    setInterval(async () => {
      const now = new Date();
      
      for (let i = notificationQueue.length - 1; i >= 0; i--) {
        const queued = notificationQueue[i];
        
        if (queued.scheduledFor && queued.scheduledFor > now) {
          continue;
        }

        if (queued.retryCount >= MAX_RETRIES) {
          // Max retries reached, remove from queue
          notificationQueue.splice(i, 1);
          continue;
        }

        try {
          const success = await this.sendToChannel(queued.alert, queued.channel);
          
          if (success) {
            // Success, remove from queue
            notificationQueue.splice(i, 1);
          } else {
            // Retry with backoff
            queued.retryCount++;
            queued.scheduledFor = new Date(
              Date.now() + Math.min(1000 * Math.pow(2, queued.retryCount), 300000)
            );
          }
        } catch {
          queued.retryCount++;
          queued.scheduledFor = new Date(
            Date.now() + Math.min(1000 * Math.pow(2, queued.retryCount), 300000)
          );
        }
      }
    }, 30000); // Process every 30 seconds
  }

  /**
   * Send digest notification (batched alerts)
   */
  async sendDigestNotification(
    alerts: BehavioralAlert[],
    preferences: AlertPreferences,
    type: 'hourly' | 'daily'
  ): Promise<boolean> {
    if (alerts.length === 0) return true;

    const templates = NOTIFICATION_TEMPLATES.email;
    
    const subject = type === 'daily' 
      ? 'Your DailyStack Daily Summary'
      : 'Your Hourly Alert Summary';

    const alertList = alerts.map(alert => `
      <li style="margin-bottom: 12px;">
        <strong>${getSeverityIcon(alert.severity)} ${alert.title}</strong>
        <p style="margin: 4px 0 0 20px; color: #666;">${alert.message}</p>
      </li>
    `).join('');

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #CCFF00 0%, #C7FF2E 100%); padding: 24px; text-align: center;">
          <h1 style="margin: 0; color: #000; font-size: 24px;">DailyStack</h1>
          <p style="margin: 8px 0 0; color: #333; font-size: 14px;">
            ${type === 'daily' ? 'Your' : 'Recent'} Alert ${type === 'daily' ? 'Summary' : 'Digest'}
          </p>
        </div>
        
        <div style="padding: 24px; background: #fff;">
          <p style="color: #666; margin-top: 0;">
            You have <strong>${alerts.length}</strong> behavioral ${alerts.length === 1 ? 'alert' : 'alerts'}
            ${type === 'daily' ? 'today' : 'in the past hour'}.
          </p>
          
          <ul style="padding-left: 20px;">
            ${alertList}
          </ul>
          
          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #eee;">
            <a href="https://dailystack.app/alerts" 
               style="display: inline-block; padding: 12px 24px; background: #000; color: #CCFF00; text-decoration: none; border-radius: 8px;">
              View All Alerts
            </a>
          </div>
        </div>
        
        <div style="padding: 16px 24px; background: #f5f5f5; text-align: center; font-size: 12px; color: #999;">
          <p style="margin: 0;">
            You're receiving this because you have ${type} digest enabled in DailyStack.<br/>
            <a href="https://dailystack.app/settings/alerts" style="color: #666;">
              Manage your notification preferences
            </a>
          </p>
        </div>
      </div>
    `;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return false;

      const { error } = await supabase.functions.invoke('send-alert-email', {
        body: {
          to: user.email,
          subject,
          html,
          isDigest: true,
          alertCount: alerts.length,
        },
      });

      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get queued notification count
   */
  getQueueLength(): number {
    return notificationQueue.length;
  }
}

// ─── Helper Functions ─────────────────────────────────────────────────────

function formatMetricName(metric: string): string {
  return metric
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function getSeverityIcon(severity: string): string {
  const icons: Record<string, string> = {
    info: 'ℹ️',
    warning: '⚠️',
    alert: '🔔',
    critical: '🚨',
  };
  return icons[severity] || 'ℹ️';
}

// ─── Convenience Exports ───────────────────────────────────────────────────

export const alertNotificationService = AlertNotificationService.getInstance();

export async function notifyAlert(
  alert: BehavioralAlert,
  preferences: AlertPreferences
): Promise<Record<NotificationChannel, boolean>> {
  return alertNotificationService.sendAlertNotification(alert, preferences);
}

export async function notifyDigest(
  alerts: BehavioralAlert[],
  preferences: AlertPreferences,
  type: 'hourly' | 'daily'
): Promise<boolean> {
  return alertNotificationService.sendDigestNotification(alerts, preferences, type);
}
