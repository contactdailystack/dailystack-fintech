import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { trackEvent } from '../../utils/analytics';
import { User, Save, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('nickname')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setNickname(data.nickname || '');
        }
      }
    };
    fetchCurrentProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_profiles').update({ nickname }).eq('user_id', user.id);
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
    <div className="min-h-screen min-h-[100dvh] bg-dark-bg text-white font-sans
      flex flex-col overflow-x-hidden">

      {/* ── Sticky header with back navigation ───────────────────────────── */}
      <header className="sticky top-0 z-20 bg-dark-bg/90 backdrop-blur-xl
        border-b border-white/5 px-4 md:px-10 py-3.5 md:py-4
        flex items-center gap-2 min-h-[56px]
        pt-[calc(0.875rem+env(safe-area-inset-top))]">

        {/* Back button — 44px tap target */}
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2.5 -ml-2 hover:bg-white/5 active:bg-white/10
            rounded-full transition-all min-w-[44px] min-h-[44px]
            flex items-center justify-center"
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>

        <h1 className="text-base md:text-xl font-bold flex items-center gap-2">
          <User size={20} className="text-primary" /> Settings
        </h1>
      </header>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 md:px-10 py-6 md:py-10
        pb-[calc(2rem+env(safe-area-inset-bottom))]">

        <div className="bg-dark-card rounded-2xl border border-white/5 p-5 md:p-6 max-w-lg">

          <label className="block text-xs font-semibold text-gray-500
            uppercase tracking-widest mb-2">
            Nickname
          </label>

          {/* font-size 16px prevents iOS auto-zoom on focus */}
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            autoComplete="nickname"
            className="w-full bg-dark-bg px-4 py-4 min-h-[52px] rounded-xl
              border border-white/8 mb-5 text-white text-base
              focus:outline-none focus:border-primary/60 transition-all"
          />

          {/* Save button — 52px height, clear affordance */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto bg-primary text-dark-bg
              px-6 py-3.5 min-h-[52px] rounded-xl font-bold text-base
              flex items-center justify-center gap-2
              hover:bg-primary/90 active:scale-[0.97]
              transition-all disabled:opacity-50"
          >
            <Save size={17} />
            {loading ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </main>

    </div>
  );
};

export default Settings;