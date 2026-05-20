import { supabase } from "../app/services/supabaseClient";

export const trackEvent = async (eventName: string, eventData: Record<string, any>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('user_events').insert({
      user_id: user.id,
      event_name: eventName,
      event_data: eventData,
      platform: window.navigator.userAgent
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};


