/**
 * Auth Route Pages — /login, /signup
 * Exports default for React.lazy compatibility, plus named exports for direct use.
 */
import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../services/AuthContext';

const AuthPage = lazy(() => import('./AuthPage'));

interface AuthPageWrapperProps {
  defaultView: 'login' | 'register';
}

function AuthPageWrapper({ defaultView }: AuthPageWrapperProps) {
  const auth = useAuthContext();

  if (auth.user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 rounded-full animate-spin border-[#56be89] border-t-transparent" />
      </div>
    }>
      <AuthPage
        onLoginSuccess={() => {
          window.location.href = '/dashboard';
        }}
        defaultView={defaultView}
      />
    </Suspense>
  );
}

export const LoginPage = () => <AuthPageWrapper defaultView="login" />;
export const SignupPage = () => <AuthPageWrapper defaultView="register" />;
export default { LoginPage, SignupPage };
