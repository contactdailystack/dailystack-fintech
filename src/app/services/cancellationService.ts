import { supabase } from './supabaseClient';

export interface CancellationProgress {
  subscriptionId: string;
  currentStep: number;
  completed: boolean;
}

export interface CancellationDocument {
  id: string;
  subscriptionId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export const fetchCancellationProgress = async (
  userId: string,
  subscriptionId: string
): Promise<CancellationProgress | null> => {
  const { data, error } = await supabase
    .from('cancellation_progress')
    .select('current_step, completed')
    .eq('user_id', userId)
    .eq('subscription_id', subscriptionId)
    .maybeSingle();

  if (error) {
    console.error('[cancellationService] fetchCancellationProgress failed:', error);
    return null;
  }

  if (!data) return null;

  return {
    subscriptionId,
    currentStep: data.current_step,
    completed: data.completed,
  };
};

export const upsertCancellationProgress = async (
  userId: string,
  subscriptionId: string,
  currentStep: number,
  completed: boolean
): Promise<void> => {
  const { error } = await supabase
    .from('cancellation_progress')
    .upsert(
      {
        user_id: userId,
        subscription_id: subscriptionId,
        current_step: currentStep,
        completed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,subscription_id' }
    );

  if (error) {
    console.error('[cancellationService] upsertCancellationProgress failed:', error);
  }
};

export interface CompletedCancellation {
  subscriptionId: string;
  completed: boolean;
  updatedAt: string;
}

export const fetchCancellationDocuments = async (
  userId: string,
  subscriptionId: string
): Promise<CancellationDocument[]> => {
  const { data, error } = await supabase
    .from('cancellation_documents')
    .select('id, file_url, uploaded_at')
    .eq('user_id', userId)
    .eq('subscription_id', subscriptionId);

  if (error) {
    console.error('[cancellationService] fetchCancellationDocuments failed:', error);
    return [];
  }

  if (!data) return [];

  return data.map((item: any) => ({
    id: item.id,
    subscriptionId,
    fileName: item.file_url.split('/').pop() || 'document.png',
    fileUrl: item.file_url,
    uploadedAt: new Date(item.uploaded_at).toLocaleDateString('th-TH') + ' ' + new Date(item.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));
};

export const fetchCompletedCancellationHistory = async (userId: string): Promise<CompletedCancellation[]> => {
  const { data, error } = await supabase
    .from('cancellation_progress')
    .select('subscription_id, completed, updated_at')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[cancellationService] fetchCompletedCancellationHistory failed:', error);
    return [];
  }

  if (!data) return [];

  return data.map((item: any) => ({
    subscriptionId: item.subscription_id,
    completed: item.completed,
    updatedAt: new Date(item.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));
};

export interface TimelineItem {
  id: string;
  type: 'event' | 'document' | 'progress';
  title: string;
  details?: string;
  timestamp: string; // ISO
}

export const fetchCancellationTimeline = async (userId: string, subscriptionId?: string): Promise<TimelineItem[]> => {
  try {
    // Fetch documents
    const docsP = supabase
      .from('cancellation_documents')
      .select('id, subscription_id, file_url, uploaded_at')
      .eq('user_id', userId)
      .then(res => res);

    // Fetch current progress snapshot(s)
    const progressP = supabase
      .from('cancellation_progress')
      .select('subscription_id, current_step, completed, updated_at')
      .eq('user_id', userId)
      .then(res => res);

    // Fetch recent user events and filter client-side (safe and flexible)
    const eventsP = supabase
      .from('user_events')
      .select('id, event_name, event_data, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200)
      .then(res => res);

    const [docsRes, progRes, eventsRes] = await Promise.all([docsP, progressP, eventsP]);

    const items: TimelineItem[] = [];

    if (docsRes.error) console.error('[cancellationService] fetch cancellation docs error:', docsRes.error);
    if (progRes.error) console.error('[cancellationService] fetch cancellation progress error:', progRes.error);
    if (eventsRes.error) console.error('[cancellationService] fetch user events error:', eventsRes.error);

    const docs = docsRes.data || [];
    for (const d of docs) {
      if (subscriptionId && d.subscription_id !== subscriptionId) continue;
      items.push({
        id: `doc-${d.id}`,
        type: 'document',
        title: 'Uploaded proof',
        details: d.file_url,
        timestamp: d.uploaded_at,
      });
    }

    const progs = progRes.data || [];
    for (const p of progs) {
      if (subscriptionId && p.subscription_id !== subscriptionId) continue;
      items.push({
        id: `prog-${p.subscription_id}`,
        type: 'progress',
        title: `Progress updated: step ${p.current_step}${p.completed ? ' (completed)' : ''}`,
        details: JSON.stringify({ current_step: p.current_step, completed: p.completed }),
        timestamp: p.updated_at,
      });
    }

    const evts = eventsRes.data || [];
    for (const e of evts) {
      try {
        const data = e.event_data || {};
        const subMatch = data.subscriptionId || data.subscription_id || (data as any).subscription || null;
        if (subscriptionId && String(subMatch) !== String(subscriptionId)) continue;

        // Only include events that look related to cancellations or that reference a subscription
        const lower = (e.event_name || '').toLowerCase();
        if (!subscriptionId && !lower.includes('cancel') && !subMatch) continue;

        items.push({
          id: `evt-${e.id}`,
          type: 'event',
          title: e.event_name || 'event',
          details: JSON.stringify(data),
          timestamp: e.created_at,
        });
      } catch (err) {
        // ignore parse errors
      }
    }

    // Normalize timestamps and sort descending
    const normalized = items.map(i => ({ ...i, timestamp: new Date(i.timestamp).toISOString() }));
    normalized.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
    return normalized;
  } catch (error) {
    console.error('[cancellationService] fetchCancellationTimeline failed:', error);
    return [];
  }
};
