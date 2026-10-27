import React, { useState } from 'react';
import { X, Shield, User, Lock, Mail, Phone, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, quickLogin } = useAuth();
  const { showToast } = useNotifications();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        showToast('Signed in successfully!', 'success');
      } else {
        await register({ name, email, password, phone });
        showToast('Account registered and signed in!', 'success');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: 'admin' | 'user') => {
    setError(null);
    setLoading(true);
    try {
      await quickLogin(role);
      showToast(`Logged in as ${role === 'admin' ? 'Administrator' : 'Customer'}!`, 'success');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/30 backdrop-blur-xl">
      <div className="relative w-full max-w-md glass-panel-elevated rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border border-[var(--glass-border-highlight)] animate-in fade-in zoom-in-95 duration-200">
        {/* Specular Highlight Top Edge */}
        <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-pink-500/60 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 glass-btn-secondary rounded-full hover:bg-pink-500/10 transition-colors cursor-pointer"
          aria-label="Close auth dialog"
        >
          <X className="w-4 h-4 text-[var(--text-primary)]" />
        </button>

        {/* Header */}
        <div>
          <h2 className="text-xl font-display font-black text-[var(--text-primary)]">
            {mode === 'login' ? 'Welcome to IMovies' : 'Create IMovies Account'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {mode === 'login'
              ? 'Access reserved tickets, seat selection, and digital boarding passes.'
              : 'Join today for instant booking and VIP recliner reservations.'}
          </p>
        </div>

        {/* 1-Click Quick Demo Sign-in */}
        <div className="p-4 glass-panel-subtle rounded-2xl border border-[var(--glass-border-light)] space-y-2.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-pink-600 font-bold block flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-pink-500" />
            Quick 1-Click Demo Logins:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="px-3 py-2 glass-pill-purple rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('user')}
              className="px-3 py-2 glass-pill-pink rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer User</span>
            </button>
          </div>
        </div>

        {/* Mode switcher tabs in Frosted Pill */}
        <div className="flex p-1 glass-panel-subtle rounded-2xl border border-[var(--glass-border-light)] gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'glass-btn-primary font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'glass-btn-primary font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            }`}
          >
            New Registration
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-500 text-xs backdrop-blur-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-500/70" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full pl-10 pr-3.5 py-2.5 glass-input rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-500/70" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 glass-input rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-500/70" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 glass-input rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[var(--text-secondary)] mb-1 font-semibold">Mobile Phone (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-500/70" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-3.5 py-2.5 glass-input rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 glass-btn-primary disabled:opacity-50 font-bold text-xs rounded-2xl shadow-xl transition-all cursor-pointer mt-3"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In to Account' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}
