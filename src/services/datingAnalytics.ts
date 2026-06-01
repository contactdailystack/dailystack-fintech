/**
 * DailyStack — Dating Analytics Service
 * Build-Measure-Pivot: Phase 2-4 - Analytics, Supabase Persistence & A/B Testing
 * 
 * Event-driven analytics structure for:
 * - Swipe behavior tracking
 * - Match rate analysis
 * - Conversation metrics
 * - User engagement patterns
 * - A/B testing ready
 * - Privacy-conscious implementation
 * - Supabase persistence layer
 */

import { supabase } from '../app/services/supabaseClient';

// =====================================================
// ANALYTICS TYPES
// =====================================================

export type EventCategory = 'swipe' | 'match' | 'conversation' | 'profile' | 'session' | 'experiment' | 'conversion' | 'feature' | 'error';
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

export interface AnalyticsEvent {
  id?: string;
  user_id: string | null;
  session_id: string;
  event_category: EventCategory;
  event_name: string;
  event_value: number;
  metadata: Record<string, any>;
  experiment_id?: string;
  variant_id?: string;
  screen_name?: string;
  component_name?: string;
  device_type: DeviceType;
  connection_type?: string;
  country_code?: string;
  created_at?: Date;
}

export interface SwipeEvent {
  target_user_id: string;
  action: 'like' | 'pass' | 'superlike';
  swipe_duration_ms: number;
  card_position: number;
  compatibility_score: number;
  source: 'curated' | 'explore';
}

export interface MatchEvent {
  partner_id: string;
  match_type: 'standard' | 'ultra';
  compatibility_score: number;
  response_time_ms: number;
  initiator: 'user' | 'partner';
}

export interface ConversationEvent {
  match_id: string;
  message_type: 'icebreaker' | 'text' | 'image' | 'gif';
  response_time_ms: number;
  conversation_started: boolean;
}

export interface ProfileViewEvent {
  target_user_id: string;
  view_duration_ms: number;
  swipe_after_view: boolean;
  swipe_action?: 'like' | 'pass' | 'superlike';
}

// =====================================================
// A/B TESTING TYPES
// =====================================================

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  variants: string[];
  active: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  assignedAt: Date;
}

// =====================================================
// ANALYTICS SERVICE
// =====================================================

class DatingAnalytics {
  private sessionId: string;
  private deviceType: DeviceType;
  private userId: string | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private experimentAssignments: Map<string, ExperimentAssignment> = new Map();
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.deviceType = this.detectDeviceType();
    this.initUserId();
    this.startFlushInterval();
    this.loadExperimentAssignments();
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private detectDeviceType(): DeviceType {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
  
  private async initUserId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      this.userId = user?.id || null;
    } catch {
      this.userId = null;
    }
  }
  
  private async loadExperimentAssignments() {
    // Load from localStorage for persistence
    try {
      const stored = localStorage.getItem('experiment_assignments');
      if (stored) {
        const assignments = JSON.parse(stored) as ExperimentAssignment[];
        assignments.forEach(a => {
          this.experimentAssignments.set(a.experimentId, a);
        });
      }
    } catch {
      // Ignore errors
    }
  }
  
  private saveExperimentAssignments() {
    try {
      const assignments = Array.from(this.experimentAssignments.values());
      localStorage.setItem('experiment_assignments', JSON.stringify(assignments));
    } catch {
      // Ignore errors
    }
  }
  
  private startFlushInterval() {
    // Flush events every 5 seconds
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 5000);
  }
  
  // ── Event Tracking Methods ─────────────────────────────────────────────────
  
  /**
   * Track swipe event
   */
  trackSwipe(event: SwipeEvent): void {
    const analyticsEvent: AnalyticsEvent = {
      user_id: this.userId,
      session_id: this.sessionId,
      event_category: 'swipe',
      event_name: `swipe_${event.action}`,
      event_value: 0,
      metadata: {
        target_user_id: event.target_user_id,
        action: event.action,
        swipe_duration_ms: event.swipe_duration_ms,
        card_position: event.card_position,
        compatibility_score: event.compatibility_score,
        source: event.source,
      },
      device_type: this.deviceType,
    };
    
    this.eventQueue.push(analyticsEvent);
    this.trackSwipeMetrics(event);
  }
  
  /**
   * Track match event
   */
  trackMatch(event: MatchEvent): void {
    const analyticsEvent: AnalyticsEvent = {
      user_id: this.userId,
      session_id: this.sessionId,
      event_category: 'match',
      event_name: 'match_created',
      event_value: 0,
      metadata: {
        partner_id: event.partner_id,
        match_type: event.match_type,
        compatibility_score: event.compatibility_score,
        response_time_ms: event.response_time_ms,
        initiator: event.initiator,
      },
      device_type: this.deviceType,
    };
    
    this.eventQueue.push(analyticsEvent);
  }
  
  /**
   * Track conversation event
   */
  trackConversation(event: ConversationEvent): void {
    const analyticsEvent: AnalyticsEvent = {
      user_id: this.userId,
      session_id: this.sessionId,
      event_category: 'conversation',
      event_name: event.conversation_started ? 'conversation_start' : 'message_sent',
      event_value: 0,
      metadata: {
        match_id: event.match_id,
        message_type: event.message_type,
        response_time_ms: event.response_time_ms,
        conversation_started: event.conversation_started,
      },
      device_type: this.deviceType,
    };
    
    this.eventQueue.push(analyticsEvent);
  }
  
  /**
   * Track profile view
   */
  trackProfileView(event: ProfileViewEvent): void {
    const analyticsEvent: AnalyticsEvent = {
      user_id: this.userId,
      session_id: this.sessionId,
      event_category: 'profile',
      event_name: 'profile_view',
      event_value: 0,
      metadata: {
        target_user_id: event.target_user_id,
        view_duration_ms: event.view_duration_ms,
        swipe_after_view: event.swipe_after_view,
        swipe_action: event.swipe_action,
      },
      device_type: this.deviceType,
    };
    
    this.eventQueue.push(analyticsEvent);
  }
  
  /**
   * Track onboarding funnel
   */
  trackOnboardingStep(step: string, completed: boolean): void {
    const analyticsEvent: AnalyticsEvent = {
      user_id: this.userId,
      session_id: this.sessionId,
      event_category: 'conversion',
      event_name: 'onboarding_step',
      event_value: 0,
      metadata: {
        step,
        completed,
        funnel: 'dating_onboarding',
      },
      device_type: this.deviceType,
    };
    
    this.eventQueue.push(analyticsEvent);
  }
  
  /**
   * Track retention signal
   */
  trackRetention(action: 'daily_open' | 'session_start' | 'session_end', metadata?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      user_id: this.userId,
      session_id: this.sessionId,
      event_category: 'session',
      event_name: action,
      event_value: 0,
      metadata: metadata || {},
      device_type: this.deviceType,
    };
    
    this.eventQueue.push(analyticsEvent);
  }

  /**
   * Track custom feature usage
   */
  trackFeatureUsage(featureName: string, action: string, value?: number, metadata?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      user_id: this.userId,
      session_id: this.sessionId,
      event_category: 'feature',
      event_name: `${featureName}_${action}`,
      event_value: value || 0,
      metadata: metadata || {},
      device_type: this.deviceType,
    };
    
    this.eventQueue.push(analyticsEvent);
  }

  
  // ── Real-time Metrics (for Dashboard) ──────────────────────────────────────
  
  private swipeMetrics = {
    totalSwipes: 0,
    likes: 0,
    passes: 0,
    superlikes: 0,
    avgSwipeDuration: 0,
    likeRate: 0,
  };
  
  private trackSwipeMetrics(event: SwipeEvent) {
    this.swipeMetrics.totalSwipes++;
    
    if (event.action === 'like') this.swipeMetrics.likes++;
    if (event.action === 'pass') this.swipeMetrics.passes++;
    if (event.action === 'superlike') this.swipeMetrics.superlikes++;
    
    // Update like rate
    if (this.swipeMetrics.totalSwipes > 0) {
      this.swipeMetrics.likeRate = (this.swipeMetrics.likes / this.swipeMetrics.totalSwipes) * 100;
    }
    
    // Update average swipe duration
    const totalDuration = this.swipeMetrics.avgSwipeDuration * (this.swipeMetrics.totalSwipes - 1) + event.swipe_duration_ms;
    this.swipeMetrics.avgSwipeDuration = totalDuration / this.swipeMetrics.totalSwipes;
  }
  
  /**
   * Get real-time swipe metrics
   */
  getSwipeMetrics() {
    return { ...this.swipeMetrics };
  }
  
  // ── Dashboard Analytics ────────────────────────────────────────────────────
  
  /**
   * Get user's dating performance metrics
   */
  async getPerformanceMetrics(userId?: string): Promise<{
    totalSwipes: number;
    totalMatches: number;
    matchRate: number;
    avgCompatibility: number;
    conversationRate: number;
    responseRate: number;
  }> {
    const targetUserId = userId || this.userId;
    if (!targetUserId) {
      return {
        totalSwipes: 0,
        totalMatches: 0,
        matchRate: 0,
        avgCompatibility: 0,
        conversationRate: 0,
        responseRate: 0,
      };
    }
    
    // Query analytics events for this user
    const { data: events, error } = await supabase
      .from('dating_analytics')
      .select('*')
      .eq('user_id', targetUserId)
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days
    
    if (error || !events) {
      return {
        totalSwipes: 0,
        totalMatches: 0,
        matchRate: 0,
        avgCompatibility: 0,
        conversationRate: 0,
        responseRate: 0,
      };
    }
    
    const swipes = events.filter(e => e.event_type === 'swipe');
    const matches = events.filter(e => e.event_type === 'match');
    const conversations = events.filter(e => e.event_type === 'conversation');
    
    const totalSwipes = swipes.length;
    const totalMatches = matches.length;
    const matchRate = totalSwipes > 0 ? (totalMatches / totalSwipes) * 100 : 0;
    
    // Calculate average compatibility from swipe data
    const compatibilities = swipes.map(s => s.event_data.compatibility_score).filter(Boolean);
    const avgCompatibility = compatibilities.length > 0 
      ? compatibilities.reduce((a, b) => a + b, 0) / compatibilities.length 
      : 0;
    
    // Conversation rate (matches that started conversation)
    const conversationStarted = conversations.filter(c => c.event_data.conversation_started).length;
    const conversationRate = totalMatches > 0 ? (conversationStarted / totalMatches) * 100 : 0;
    
    return {
      totalSwipes,
      totalMatches,
      matchRate,
      avgCompatibility,
      conversationRate,
      responseRate: 0, // Would need partner response data
    };
  }
  
  /**
   * Get profile performance (which profiles perform best)
   */
  async getProfilePerformance(): Promise<{
    topInterests: string[];
    bestPerformingPhotos: string[];
    optimalBioLength: number;
  }> {
    // In production, this would query aggregated analytics
    // For now, return placeholder
    return {
      topInterests: ['Travel', 'Coffee', 'Reading', 'Music', 'Fitness'],
      bestPerformingPhotos: [],
      optimalBioLength: 150,
    };
  }
  
// ── A/B Testing Support ───────────────────────────────────────────────────
  
  /**
   * Get experiment variant for user (with persistence)
   */
  getExperimentVariant(experimentId: string): string {
    // Check if already assigned
    const existingAssignment = this.experimentAssignments.get(experimentId);
    if (existingAssignment) {
      return existingAssignment.variantId;
    }
    
    // Generate new assignment based on user ID
    if (!this.userId) return 'control';
    
    // Deterministic hash-based assignment
    const hash = this.userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variants = ['control', 'variant_a', 'variant_b'];
    const variantIndex = hash % variants.length;
    const variant = variants[variantIndex];
    
    // Store assignment
    const assignment: ExperimentAssignment = {
      experimentId,
      variantId: variant,
      assignedAt: new Date(),
    };
    this.experimentAssignments.set(experimentId, assignment);
    this.saveExperimentAssignments();
    
    return variant;
  }
  
  /**
   * Get all experiment assignments
   */
  getAllExperimentAssignments(): ExperimentAssignment[] {
    return Array.from(this.experimentAssignments.values());
  }
  
  /**
   * Track experiment exposure
   */
  trackExperimentExposure(experimentId: string, variant: string): void {
    const analyticsEvent: AnalyticsEvent = {
      user_id: this.userId,
      session_id: this.sessionId,
      event_category: 'experiment',
      event_name: 'experiment_exposure',
      event_value: 0,
      metadata: {
        experiment_id: experimentId,
        variant,
      },
      experiment_id: experimentId,
      variant_id: variant,
      device_type: this.deviceType,
    };
    
    this.eventQueue.push(analyticsEvent);
  }
  
  /**
   * Track experiment conversion
   */
  trackExperimentConversion(experimentId: string, conversionEvent: string, value?: number): void {
    const analyticsEvent: AnalyticsEvent = {
      user_id: this.userId,
      session_id: this.sessionId,
      event_category: 'experiment',
      event_name: `experiment_${conversionEvent}`,
      event_value: value || 0,
      metadata: {
        experiment_id: experimentId,
        conversion_event: conversionEvent,
      },
      experiment_id: experimentId,
      variant_id: this.getExperimentVariant(experimentId),
      device_type: this.deviceType,
    };
    
    this.eventQueue.push(analyticsEvent);
  }

  // ── Utility Methods ────────────────────────────────────────────────────────

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async flushEvents() {
    if (this.eventQueue.length === 0) return;
    
    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];
    
    try {
      // Insert events into Supabase analytics table
      const eventsForSupabase = eventsToFlush.map(e => ({
        id: e.id || this.generateEventId(),
        user_id: e.user_id,
        session_id: e.session_id,
        event_category: e.event_category,
        event_name: e.event_name,
        event_value: e.event_value,
        metadata: e.metadata,
        experiment_id: e.experiment_id,
        variant_id: e.variant_id,
        screen_name: e.screen_name,
        component_name: e.component_name,
        device_type: e.device_type,
        created_at: (e.created_at || new Date()).toISOString(),
      }));
      
      const { error } = await supabase
        .from('dating_analytics')
        .insert(eventsForSupabase);
      
      if (error) {
        console.error('Failed to flush analytics events:', error);
        // Re-queue events on failure
        this.eventQueue = [...eventsToFlush, ...this.eventQueue];
      }
    } catch (err) {
      console.error('Analytics flush error:', err);
      this.eventQueue = [...eventsToFlush, ...this.eventQueue];
    }
  }
  
  /**
   * End session and flush remaining events
   */
  async endSession() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flushEvents();
  }
  
  /**
   * Track session start
   */
  async trackSessionStart() {
    await this.trackRetention('session_start', {
      session_id: this.sessionId,
    });
  }
  
  /**
   * Track session end with duration
   */
  async trackSessionEnd(durationMs: number) {
    await this.trackRetention('session_end', {
      session_id: this.sessionId,
      duration_ms: durationMs,
    });
  }
}

// =====================================================
// ANALYTICS HOOKS (React)
// =====================================================

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';

export function useDatingAnalytics() {
  const analyticsRef = useRef<DatingAnalytics | null>(null);
  const sessionStartRef = useRef<number>(Date.now());
  
  useEffect(() => {
    analyticsRef.current = new DatingAnalytics();
    analyticsRef.current.trackSessionStart();
    
    return () => {
      const sessionDuration = Date.now() - sessionStartRef.current;
      analyticsRef.current?.trackSessionEnd(sessionDuration);
      analyticsRef.current?.endSession();
    };
  }, []);
  
  const trackSwipe = useCallback((event: SwipeEvent) => {
    analyticsRef.current?.trackSwipe(event);
  }, []);
  
  const trackMatch = useCallback((event: MatchEvent) => {
    analyticsRef.current?.trackMatch(event);
  }, []);
  
  const trackConversation = useCallback((event: ConversationEvent) => {
    analyticsRef.current?.trackConversation(event);
  }, []);
  
  const trackProfileView = useCallback((event: ProfileViewEvent) => {
    analyticsRef.current?.trackProfileView(event);
  }, []);
  
  // A/B Testing methods
  const getVariant = useCallback((experimentId: string) => {
    return analyticsRef.current?.getExperimentVariant(experimentId) || 'control';
  }, []);
  
  const trackExposure = useCallback((experimentId: string) => {
    const variant = analyticsRef.current?.getExperimentVariant(experimentId) || 'control';
    analyticsRef.current?.trackExperimentExposure(experimentId, variant);
  }, []);
  
  const trackConversion = useCallback((experimentId: string, event: string, value?: number) => {
    analyticsRef.current?.trackExperimentConversion(experimentId, event, value);
  }, []);

  const trackFeatureUsage = useCallback((featureName: string, action: string, value?: number, metadata?: Record<string, any>) => {
    analyticsRef.current?.trackFeatureUsage(featureName, action, value, metadata);
  }, []);
  
  return {
    trackSwipe,
    trackMatch,
    trackConversation,
    trackProfileView,
    trackFeatureUsage,
    getSwipeMetrics: () => analyticsRef.current?.getSwipeMetrics() || null,
    getPerformanceMetrics: () => analyticsRef.current?.getPerformanceMetrics(),
    // A/B Testing
    getVariant,
    trackExposure,
    trackConversion,
  };
}

// =====================================================
// A/B TESTING HOOK
// =====================================================

export interface ExperimentConfig {
  id: string;
  variants: string[];
  defaultVariant?: string;
}

export function useExperiment(experimentId: string, config: ExperimentConfig) {
  const analyticsRef = useRef<DatingAnalytics | null>(null);
  const [variant, setVariant] = useState<string>(config.defaultVariant || 'control');
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Initialize analytics
    if (!analyticsRef.current) {
      analyticsRef.current = new DatingAnalytics();
    }
    
    // Get variant assignment
    const assignedVariant = analyticsRef.current.getExperimentVariant(experimentId);
    setVariant(assignedVariant);
    
    // Track exposure
    analyticsRef.current.trackExperimentExposure(experimentId, assignedVariant);
    
    setIsLoaded(true);
  }, [experimentId]);
  
  const trackConversion = useCallback((conversionEvent: string, value?: number) => {
    analyticsRef.current?.trackExperimentConversion(experimentId, conversionEvent, value);
  }, [experimentId]);
  
  // Check if variant matches
  const isVariant = useCallback((variantToCheck: string) => {
    return variant === variantToCheck;
  }, [variant]);
  
  // Control group check
  const isControl = useMemo(() => variant === 'control', [variant]);
  
  return {
    variant,
    isControl,
    isLoaded,
    isVariant,
    trackConversion,
  };
}

// =====================================================
// FEATURE FLAG HOOK
// =====================================================

export function useFeatureFlag(flagId: string, defaultValue: boolean = false) {
  const [isEnabled, setIsEnabled] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Get feature flag from analytics (could be extended to use other sources)
    const analytics = new DatingAnalytics();
    const variant = analytics.getExperimentVariant(`feature_${flagId}`);
    
    // Enable flag for 'variant_a' and 'variant_b', disable for 'control'
    const enabled = variant !== 'control';
    setIsEnabled(enabled);
    setIsLoaded(true);
  }, [flagId]);
  
  return { isEnabled, isLoaded };
}

// =====================================================
// ANALYTICS EVENT TYPES (for type-safe tracking)
// =====================================================

export const ANALYTICS_EVENTS = {
  // Swipe events
  SWIPE_LIKE: 'swipe_like',
  SWIPE_PASS: 'swipe_pass',
  SWIPE_SUPERLIKE: 'swipe_superlike',
  
  // Match events
  MATCH_CREATED: 'match_created',
  MATCH_ULTRA: 'match_ultra',
  
  // Conversation events
  CONVERSATION_START: 'conversation_start',
  MESSAGE_SENT: 'message_sent',
  MESSAGE_RECEIVED: 'message_received',
  REPLY_TIME: 'reply_time',
  
  // Engagement events
  PROFILE_VIEW: 'profile_view',
  PHOTO_UPLOAD: 'photo_upload',
  BIO_UPDATE: 'bio_update',
  INTERESTS_UPDATE: 'interests_update',
  
  // Retention events
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  DAILY_OPEN: 'daily_open',
  
  // Onboarding events
  ONBOARDING_START: 'onboarding_start',
  ONBOARDING_STEP: 'onboarding_step',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  
  // Feature usage
  SUPER_LIKE_USED: 'super_like_used',
  UNMATCH: 'unmatch',
  BLOCK: 'block',
  REPORT: 'report',
} as const;

export type AnalyticsEventType = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

// =====================================================
// EXPORT DEFAULT INSTANCE
// =====================================================

export const datingAnalytics = new DatingAnalytics();
export default DatingAnalytics;