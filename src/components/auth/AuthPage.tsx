import React, { useState } from 'react';
import { UserRole } from '../../types';
import { loginUser, registerUser } from '../../services/authService';
import {
  Compass,
  Mail,
  Lock,
  User,
  ShoppingBag,
  UtensilsCrossed,
  Store,
  Bike,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AuthPageProps {
  onDemoLogin?: (role: UserRole) => void;
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onDemoLogin, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginUser(email, password);
      } else {
        await registerUser(email, password, name, role);
      }
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error("Auth action failed:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
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
    <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-gold-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-electric-orange/10 blur-[100px] pointer-events-none"></div>

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
          <div className="grid grid-cols-2 p-1 rounded-xl bg-charcoal-900 border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'signup' && (
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

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Password</label>
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

            {/* Role Selection on Signup */}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 hover:brightness-110 active:scale-[0.99] text-charcoal-950 font-bold text-xs shadow-gold-glow transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Authenticating with Firebase...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="pt-4 border-t border-white/10 space-y-2 text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              ⚡ Or Instant One-Click Demo Access
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
                    if (onDemoLogin) onDemoLogin(demo.role);
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
