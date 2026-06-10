import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/', { replace: true });
      }
    });

    const timeout = setTimeout(() => navigate('/', { replace: true }), 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0F14]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#C7FF2E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#C7FF2E] text-sm font-mono">Verifying...</p>
      </div>
    </div>
  );
}