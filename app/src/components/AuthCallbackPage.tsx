import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'motion/react';
import { supabase } from '../supabaseClient';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion() ?? false;
  const [status, setStatus] = useState<'verifying' | 'failed'>('verifying');
  const [progress, setProgress] = useState(0);

  // P3-04: Retry handler to re-run the verification flow
  const handleRetry = useCallback(() => {
    setStatus('verifying');
    setProgress(0);
  }, []);

  useEffect(() => {
    let didNavigate = false;
    let progressInterval: ReturnType<typeof setInterval> | null = null;

    const startProgress = () => {
      // Increment progress bar from 0 to 100 over 10 seconds
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (progressInterval) clearInterval(progressInterval);
            return 100;
          }
          return prev + 1;
        });
      }, 100); // 100ms * 100 = 10s total
    };

    const verifySession = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (didNavigate) return;
        if (event === 'SIGNED_IN' && session) {
          didNavigate = true;
          if (progressInterval) clearInterval(progressInterval);
          navigate('/', { replace: true });
        }
      });

      // P3-04: Extended timeout from 3s to 10s
      const timeout = setTimeout(() => {
        if (didNavigate) return;
        if (progressInterval) clearInterval(progressInterval);
        setStatus('failed');
      }, 10000);

      return { subscription, timeout };
    };

    startProgress();
    const { subscription, timeout } = verifySession();

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [navigate, handleRetry]);

  const isVerifying = status === 'verifying';

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#0FB0CE' }}
    >
      <div className="text-center px-6 max-w-sm">
        {/* Logo */}
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{
            backgroundColor: '#050D1F',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <span
            className="text-2xl font-bold"
            style={{ color: '#0FB0CE' }}
          >
            P
          </span>
        </div>

        {/* Progress bar */}
        {isVerifying && (
          <div
            className="w-full h-1 rounded-full mx-auto mb-4 overflow-hidden"
            style={{ backgroundColor: 'rgba(11, 15, 10, 0.2)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                backgroundColor: '#050D1F',
                width: `${progress}%`,
              }}
            />
          </div>
        )}

        {/* Loading / Success */}
        {isVerifying ? (
          <>
            <div
              className={`w-8 h-8 border-2 mx-auto mb-4 rounded-full ${reduceMotion ? '' : 'animate-spin'}`}
              style={{
                borderColor: 'rgba(11, 15, 10, 0.3)',
                borderTopColor: '#050D1F',
              }}
            />
            <p
              className="text-sm font-medium"
              style={{ color: '#050D1F', fontFamily: '"Inter", sans-serif' }}
            >
              Verifying... {Math.round(progress)}%
            </p>
          </>
        ) : (
          <>
            <p
              className="text-sm font-semibold mb-3"
              style={{ color: '#050D1F', fontFamily: '"Inter", sans-serif' }}
            >
              Verification failed
            </p>
            <p
              className="text-xs mb-4"
              style={{ color: 'rgba(11, 15, 10, 0.7)', fontFamily: '"Inter", sans-serif' }}
            >
              Please try signing in again.
            </p>
            {/* P3-04: Retry button on failed state */}
            <button
              type="button"
              className="w-full mb-3 bg-transparent border border-[#050D1F] text-[#050D1F] font-bold py-3 rounded-full transition active:scale-[0.99]"
              onClick={handleRetry}
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              Retry
            </button>
            <button
              type="button"
              className="w-full bg-[#050D1F] text-[#0FB0CE] font-bold py-3 rounded-full transition active:scale-[0.99]"
              onClick={() => navigate('/auth')}
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

