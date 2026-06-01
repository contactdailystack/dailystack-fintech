/**
 * DailyStack — Google Calendar Service
 * Connects to Google Calendar API via Supabase Auth Google OAuth token.
 *
 * Setup requirements:
 * 1. Supabase Dashboard → Authentication → Providers → Google → Enable
 *    - Add Google OAuth Client ID & Client Secret from Google Cloud Console
 *    - Add Authorized redirect: https://[your-project].supabase.co/auth/v1/callback
 *
 * 2. Google Cloud Console → APIs & Services → Library → Enable "Google Calendar API"
 *    - Create OAuth 2.0 Client ID (Web application)
 *    - Add Authorized redirect: https://[your-project].supabase.co/auth/v1/callback
 *
 * 3. Add scopes in Supabase → Authentication → Providers → Google:
 *    - https://www.googleapis.com/auth/calendar.readonly
 *    - https://www.googleapis.com/auth/calendar.events
 */

import { supabase } from '../app/services/supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: string; // ISO date
  end: string;
  allDay: boolean;
  location?: string;
  attendees?: number;
  colorId?: string;
  htmlLink?: string;
  source?: 'google' | 'dailystack';
  status: 'confirmed' | 'tentative' | 'cancelled';
}

export interface CalendarList {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  accessRole: string;
}

export interface SyncResult {
  success: boolean;
  eventsImported: number;
  errors?: string[];
}

// ─── OAuth ────────────────────────────────────────────────────────────────────

/**
 * Get the stored Google OAuth access token from Supabase session.
 * Returns null if user hasn't connected Google Calendar.
 */
export const getGoogleAccessToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.provider_token ?? null;
  return token;
};

/**
 * Initiate Google OAuth connection via Supabase.
 * Redirects to Supabase's Google OAuth flow.
 */
export const connectGoogleCalendar = async (): Promise<void> => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ].join(' '),
      redirectTo: `${window.location.origin}/settings?calendar=connected`,
    },
  });

  if (error) throw error;
  if (data?.url) {
    // Open Google OAuth in top-level browser — fixes disallowed_useragent on mobile WebView
    window.location.href = data.url;
  }
  if (error) throw error;
};

/**
 * Sign out of Google (revoke token).
 */
export const disconnectGoogleCalendar = async (): Promise<void> => {
  // Clear provider token by signing out of the provider
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Check if user has an active Google connection.
 */
export const isGoogleConnected = async (): Promise<boolean> => {
  const token = await getGoogleAccessToken();
  return !!token;
};

// ─── Calendar API Helpers ──────────────────────────────────────────────────────

const GOOGLE_CAL_API = 'https://www.googleapis.com/calendar/v3';

const gcalFetch = async (
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<Response> => {
  return fetch(`${GOOGLE_CAL_API}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

// ─── Calendar List ─────────────────────────────────────────────────────────────

/**
 * Get user's calendar list.
 */
export const getCalendarList = async (): Promise<CalendarList[]> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Google Calendar not connected');

  const res = await gcalFetch('/users/me/calendarList', token);
  if (!res.ok) throw new Error('Failed to fetch calendar list');

  const data = await res.json();
  return (data.items ?? []) as CalendarList[];
};

// ─── Events ───────────────────────────────────────────────────────────────────

/**
 * Fetch events from a specific calendar (defaults to primary).
 */
export const getEvents = async (
  options: {
    calendarId?: string;
    timeMin?: string; // ISO date
    timeMax?: string;
    maxResults?: number;
    singleEvents?: boolean;
    orderBy?: 'startTime' | 'updated';
    q?: string; // search query
  } = {}
): Promise<CalendarEvent[]> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Google Calendar not connected');

  const {
    calendarId = 'primary',
    timeMin,
    timeMax,
    maxResults = 50,
    singleEvents = true,
    orderBy = 'startTime',
    q,
  } = options;

  const params = new URLSearchParams({
    maxResults: String(maxResults),
    singleEvents: String(singleEvents),
    orderBy,
  });
  if (timeMin) params.set('timeMin', timeMin);
  if (timeMax) params.set('timeMax', timeMax);
  if (q) params.set('q', q);

  const res = await gcalFetch(
    `/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    token
  );

  if (!res.ok) throw new Error('Failed to fetch events');

  const data = await res.json();
  return (data.items ?? []).map(normalizeEvent).filter(Boolean) as CalendarEvent[];
};

/**
 * Get today's events.
 */
export const getTodayEvents = async (): Promise<CalendarEvent[]> => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

  return getEvents({ timeMin: startOfDay, timeMax: endOfDay });
};

/**
 * Get events for the current week.
 */
export const getWeekEvents = async (): Promise<CalendarEvent[]> => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return getEvents({
    timeMin: startOfWeek.toISOString(),
    timeMax: endOfWeek.toISOString(),
    maxResults: 100,
  });
};

// ─── Create / Update Events ───────────────────────────────────────────────────

export interface CreateEventInput {
  summary: string;
  description?: string;
  start: string; // ISO datetime
  end: string;
  location?: string;
  attendees?: string[]; // email addresses
  calendarId?: string;
}

export const createEvent = async (input: CreateEventInput): Promise<CalendarEvent> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Google Calendar not connected');

  const body = {
    summary: input.summary,
    description: input.description,
    location: input.location,
    start: {
      dateTime: input.start,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: input.end,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    attendees: input.attendees?.map(email => ({ email })),
  };

  const res = await gcalFetch(
    `/calendars/${encodeURIComponent(input.calendarId ?? 'primary')}/events`,
    token,
    { method: 'POST', body: JSON.stringify(body) }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message ?? 'Failed to create event');
  }

  const data = await res.json();
  return normalizeEvent(data) as CalendarEvent;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const normalizeEvent = (item: Record<string, unknown>): CalendarEvent | null => {
  if (!item || typeof item !== 'object') return null;
  const obj = item as Record<string, unknown>;

  const startRaw = (obj.start as Record<string, unknown>) ?? {};
  const endRaw = (obj.end as Record<string, unknown>) ?? {};

  const dateTime = (startRaw.dateTime as string) ?? (startRaw.date as string) ?? '';
  const endTime = (endRaw.dateTime as string) ?? (endRaw.date as string) ?? '';

  if (!dateTime) return null;

  return {
    id: String(obj.id ?? ''),
    summary: String(obj.summary ?? 'Untitled'),
    description: obj.description ? String(obj.description) : undefined,
    start: dateTime,
    end: endTime,
    allDay: !startRaw.dateTime,
    location: obj.location ? String(obj.location) : undefined,
    attendees: Array.isArray(obj.attendees) ? obj.attendees.length : undefined,
    colorId: obj.colorId ? String(obj.colorId) : undefined,
    htmlLink: obj.htmlLink ? String(obj.htmlLink) : undefined,
    source: 'google',
    status: (obj.status as CalendarEvent['status']) ?? 'confirmed',
  };
};

// ─── Default Export ─────────────────────────────────────────────────────────────

export const GoogleCalendarService = {
  // Connection
  connect: connectGoogleCalendar,
  disconnect: disconnectGoogleCalendar,
  isConnected: isGoogleConnected,
  getAccessToken: getGoogleAccessToken,

  // Read
  getCalendarList,
  getEvents,
  getTodayEvents,
  getWeekEvents,

  // Write
  createEvent,
};

export default GoogleCalendarService;
