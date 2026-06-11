import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { trackEvent } from '../../utils/analytics';
import { User, Save, ChevronLeft, HelpCircle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifThreshold, setNotifThreshold] = useState<number>(() => {
    const v = localStorage.getItem('notif_threshold_v1');
    return v ? parseInt(v, 10) : 3;
  });
  const [urgentBadgeDays, setUrgentBadgeDays] = useState<number>(() => {
    const v = localStorage.getItem('urgent_badge_days_v1');
    return v ? parseInt(v, 10) : 7;
  });

  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  const [pushStatus, setPushStatus] = useState<string>('not-registered');

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const registerForPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushStatus('unsupported');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.register('/push-sw.js');
      const vapid = import.meta.env.VITE_VAPID_PUBLIC_KEY as string || '';
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_settings').upsert({ user_id: user.id, push_subscription: sub }, { onConflict: 'user_id' });
      }

      setPushEnabled(true);
      setPushStatus('subscribed');
    } catch (err) {
      console.error('Push registration failed:', err);
      setPushStatus('error');
    }
  };

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_settings')
          .select('notif_threshold, urgent_badge_days, push_subscription')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          if (data.notif_threshold !== undefined && data.notif_threshold !== null) {
            setNotifThreshold(Number(data.notif_threshold));
          } else {
            const v = localStorage.getItem('notif_threshold_v1');
            if (v) setNotifThreshold(parseInt(v, 10));
          }
          if (data.urgent_badge_days !== undefined && data.urgent_badge_days !== null) {
            setUrgentBadgeDays(Number(data.urgent_badge_days));
          } else {
            const v2 = localStorage.getItem('urgent_badge_days_v1');
            if (v2) setUrgentBadgeDays(parseInt(v2, 10));
          }
        } else {
          // fallback to localStorage if server read fails
          const v = localStorage.getItem('notif_threshold_v1');
          if (v) setNotifThreshold(parseInt(v, 10));
          const v2 = localStorage.getItem('urgent_badge_days_v1');
          if (v2) setUrgentBadgeDays(parseInt(v2, 10));
        }
      }
    };
    fetchCurrentProfile();
  }, [navigate]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // upsert profile including notification preferences
        const payload: any = {
          user_id: user.id,
          notif_threshold: notifThreshold,
          urgent_badge_days: urgentBadgeDays,
        };

        const { error: upsertError } = await supabase
          .from('user_settings')
          .upsert(payload, { onConflict: 'user_id' });

        if (upsertError) {
          console.error('Server save failed, falling back to localStorage:', upsertError);
          // still persist locally so UI remains consistent
          localStorage.setItem('notif_threshold_v1', String(notifThreshold));
          localStorage.setItem('urgent_badge_days_v1', String(urgentBadgeDays));
        } else {
          // server save successful — keep local copy in sync
          localStorage.setItem('notif_threshold_v1', String(notifThreshold));
          localStorage.setItem('urgent_badge_days_v1', String(urgentBadgeDays));
        }

        await trackEvent('profile_updated', { nickname });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Error updating settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-dark-bg text-[#000000] font-sans
      flex flex-col overflow-x-hidden">

      {/* ── Sticky header with back navigation ───────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl
        border-b border-black/5 px-4 md:px-10 py-3.5 md:py-4
        flex items-center gap-2 min-h-[56px]
        pt-[calc(0.875rem+env(safe-area-inset-top))]">

        {/* Back button — 44px tap target */}
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2.5 -ml-2 hover:bg-gray-100 active:bg-gray-200 text-[#000000]
            rounded-full transition-all min-w-[44px] min-h-[44px]
            flex items-center justify-center"
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>

        <h1 className="text-base md:text-xl font-black text-[#000000] flex items-center gap-2">
          <User size={20} className="text-[#5B7A00]" /> Settings
        </h1>
      </header>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 md:px-10 py-6 md:py-10
        pb-[calc(2rem+env(safe-area-inset-bottom))]">

        <div className="bg-white border-0 shadow-lg rounded-2xl p-5 md:p-6 max-w-lg text-[#000000]">

          <label className="block text-xs font-black text-gray-500
            uppercase tracking-widest mb-2 font-kanit">
            Nickname / ชื่อเล่น
          </label>

          {/* font-size 16px prevents iOS auto-zoom on focus */}
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            autoComplete="nickname"
            className="w-full bg-gray-50 px-4 py-4 min-h-[52px] rounded-xl
              border border-black/5 mb-5 text-[#000000] text-base font-kanit font-semibold
              focus:outline-none focus:border-black/30 transition-all"
          />

          <div className="mt-4 bg-white/0 pb-4">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 font-kanit">Notifications</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-600 block mb-1">Notify when ≤ days</label>
                <input type="number" min={0} value={notifThreshold} onChange={(e) => setNotifThreshold(parseInt(e.target.value||'0',10))}
                  className="w-full bg-gray-50 px-3 py-2 rounded-xl border border-black/5 text-sm" />
              </div>
              <div>
                <label className="text-[11px] text-gray-600 block mb-1">Urgent badge when ≤ days</label>
                <input type="number" min={0} value={urgentBadgeDays} onChange={(e) => setUrgentBadgeDays(parseInt(e.target.value||'0',10))}
                  className="w-full bg-gray-50 px-3 py-2 rounded-xl border border-black/5 text-sm" />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Browser notifications require permission. Settings are saved locally.</p>
            <div className="mt-3">
              {pushEnabled ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-800">Push enabled</span>
              ) : (
                <button onClick={registerForPush} className="px-3 py-2 bg-black text-white rounded-xl text-sm">Enable Push Notifications</button>
              )}
              <span className="ml-3 text-xs text-gray-500">{pushStatus}</span>
            </div>
          </div>

          {/* Help & Support */}
          <div className="mt-6 pt-5 border-t border-black/5">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 font-kanit">Help & Support</label>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <HelpCircle size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-black text-black">ต้องการความช่วยเหลือ?</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">ติดต่อทีมสนับสนุนของเราได้ตลอดเวลา</p>
                </div>
              </div>
              <div className="space-y-2">
                <a
                  href="mailto:support@dailystack.app"
                  className="flex items-center gap-2 px-3 py-2.5 bg-white border border-black/5 rounded-lg text-xs font-semibold text-black hover:bg-gray-100 transition-all"
                >
                  <Mail size={14} className="text-gray-500" />
                  support@dailystack.app
                </a>
                <p className="text-[10px] text-gray-400 text-center">
                  เราตอบกลับภายใน 24 ชั่วโมง
                </p>
              </div>
            </div>
          </div>

          {/* Save button — 52px height, clear affordance */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto bg-primary text-[#000000]
              px-6 py-3.5 min-h-[52px] rounded-xl font-black text-base
              flex items-center justify-center gap-2
              hover:bg-primary/95 active:scale-[0.98]
              transition-all disabled:opacity-40 shadow-[0_8px_32px_rgba(199,255,46,0.35)]"
          >
            <Save size={17} strokeWidth={3} />
            {loading ? 'Saving…' : saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </main>

    </div>
  );
};

export default Settings;