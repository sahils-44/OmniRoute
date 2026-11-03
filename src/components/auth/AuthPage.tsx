import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Mail,
  Lock,
  User,
  Phone,
  ShoppingBag,
  UtensilsCrossed,
  Store,
  Bike,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

interface AuthPageProps {
  defaultMode?: 'login' | 'signup' | 'forgot';
  onDemoLogin?: (role: UserRole) => void;
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  defaultMode = 'login',
  onDemoLogin,
  onSuccess,
}) => {
  const { loginUser, registerUser, loginWithGoogle, resetPassword, loginDemoRole } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(() => {
    if (location.pathname === '/register') return 'signup';
    if (location.pathname === '/forgot-password') return 'forgot';
    return defaultMode;
  });

  // Keep mode aligned with URL if navigating directly
  React.useEffect(() => {
    if (location.pathname === '/register') setMode('signup');
    else if (location.pathname === '/forgot-password') setMode('forgot');
    else if (location.pathname === '/login') setMode('login');
  }, [location.pathname]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const getDashboardPath = (targetRole: UserRole): string => {
    switch (targetRole) {
      case 'customer':
        return '/customer/dashboard';
      case 'restaurant_owner':
      case 'hotel_owner':
        return '/hotel/dashboard';
      case 'vendor':
        return '/vendor/dashboard';
      case 'delivery_partner':
        return '/delivery/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/customer/dashboard';
    }
  };

  const handleAuthRedirect = (targetRole?: UserRole) => {
    if (onSuccess) onSuccess();
    const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname;
    const dest = fromPath && !fromPath.includes('/login') && !fromPath.includes('/register')
      ? fromPath
      : targetRole ? getDashboardPath(targetRole) : '/';
    navigate(dest, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginUser(email, password);
        handleAuthRedirect();
      } else if (mode === 'signup') {
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match. Please verify.');
          setLoading(false);
          return;
        }

        await registerUser(email, password, name, role, phone);
        handleAuthRedirect(role);
      } else if (mode === 'forgot') {
        if (!email) {
          setErrorMsg('Please enter your account email address.');
          setLoading(false);
          return;
        }
        await resetPassword(email);
        setSuccessMsg(`Password reset link sent to ${email}. Check your inbox!`);
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error('Auth action failed:', error);
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        setErrorMsg('Invalid email or password. Please verify and try again.');
      } else if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Try signing in.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg(error.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle(role);
      handleAuthRedirect(role);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Google authentication was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions: { role: UserRole; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      role: 'customer',
      title: 'Customer',
      desc: 'Browse restaurants, order food & track live',
      icon: <ShoppingBag className="w-4 h-4 text-cyan-400" />,
    },
    {
      role: 'restaurant_owner',
      title: 'Hotel Owner',
      desc: 'Manage kitchen, menus & dispatch food',
      icon: <UtensilsCrossed className="w-4 h-4 text-gold-400" />,
    },
    {
      role: 'vendor',
      title: 'Local Vendor / Chai',
      desc: 'Smart multi-order route grouping & fast stock',
      icon: <Store className="w-4 h-4 text-electric-orange" />,
    },
    {
      role: 'delivery_partner',
      title: 'Courier Partner',
      desc: 'Live GPS navigation, trip manifest & earnings',
      icon: <Bike className="w-4 h-4 text-emerald-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-gold-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-electric-orange/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6 my-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-200 p-0.5 shadow-gold-glow items-center justify-center mb-1">
            <div className="w-full h-full bg-charcoal-950 rounded-[14px] flex items-center justify-center">
              <Compass className="w-7 h-7 text-gold-400" />
            </div>
          </div>
          <h1 className="text-3xl font-black font-display tracking-tight text-white">
            Omni<span className="gold-gradient-text">Route</span>™
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Commercial Smart Logistics & Multi-Vendor Cloud
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="glass-panel-gold rounded-3xl p-6 sm:p-8 border border-gold-500/30 shadow-2xl space-y-6">
          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 rounded-xl bg-charcoal-900 border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-gold-400" />
                <span className="font-bold text-sm text-white">Reset Account Password</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-slate-400 hover:text-gold-400 transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Mehta / Chef Rajesh"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-charcoal-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-gold-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98201 12345"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-charcoal-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-gold-500/60"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-charcoal-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-gold-500/60"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-semibold block">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-[11px] text-gold-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-charcoal-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-gold-500/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-charcoal-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-gold-500/60"
                  />
                </div>
              </div>
            )}

            {/* Role Selection on Signup (Excludes admin) */}
            {mode === 'signup' && (
              <div className="space-y-2 pt-1">
                <label className="text-slate-300 font-semibold block">Select Your Platform Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map(opt => (
                    <button
                      type="button"
                      key={opt.role}
                      onClick={() => setRole(opt.role)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        role === opt.role
                          ? 'bg-gold-500/15 border-gold-500/80 text-white shadow-sm'
                          : 'bg-charcoal-900/60 border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        {opt.icon}
                        <span className="font-bold text-xs text-white">{opt.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-1">
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:brightness-110 active:scale-[0.99] text-charcoal-950 font-bold text-xs shadow-gold-glow transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Communicating with Firebase...</span>
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? 'Sign In to Dashboard'
                      : mode === 'signup'
                      ? 'Complete Registration'
                      : 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Google Auth Divider & Button */}
          {mode !== 'forgot' && (
            <div className="space-y-3 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-charcoal-950 px-3 text-[10px] font-mono uppercase text-slate-500 absolute">
                  Or Google SSO
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-charcoal-900 hover:bg-white/5 border border-white/10 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          {/* Quick Demo Access Bar */}
          <div className="pt-4 border-t border-white/10 space-y-2 text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              ⚡ Instant 1-Click Demo Evaluation
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {(
                [
                  { role: 'customer' as const, label: 'Customer' },
                  { role: 'restaurant_owner' as const, label: 'Hotel Owner' },
                  { role: 'vendor' as const, label: 'Chai Vendor' },
                  { role: 'delivery_partner' as const, label: 'Courier' },
                  { role: 'admin' as const, label: 'Admin' },
                ]
              ).map(demo => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => {
                    if (onDemoLogin) {
                      onDemoLogin(demo.role);
                    } else {
                      loginDemoRole(demo.role);
                    }
                    handleAuthRedirect(demo.role);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-charcoal-900 hover:bg-gold-500/20 hover:text-gold-300 text-slate-400 border border-white/5 text-[11px] font-medium transition-colors"
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured by Firebase Authentication & Firestore Rules</span>
        </div>
      </div>
    </div>
  );
};
