'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Lock, User, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';
import { loginAdmin } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminLoginModal() {
  const { loginModalOpen, setLoginModalOpen, setIsAdmin } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setLoginModalOpen(false);
    setUsername('');
    setPassword('');
    setError('');
    setShowPassword(false);
  };

  /* ESC key closes the modal */
  useEffect(() => {
    if (!loginModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [loginModalOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const success = await loginAdmin(username.trim(), password.trim());
      if (success) {
        setIsAdmin(true);
        toast.success('Welcome back, Admin!', {
          description: 'You now have access to sell and manage cars.',
          duration: 3000,
        });
        handleClose();
      } else {
        setError('Invalid username or password');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {loginModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[8px]"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          >
            <div
              className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0d1117]/95 backdrop-blur-xl shadow-2xl"
              suppressHydrationWarning
            >
              {/* Close button */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close admin login dialog"
                suppressHydrationWarning
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="px-6 pt-8 pb-2">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00D4FF]/10 border border-[#00D4FF]/20">
                  <Shield className="h-7 w-7 text-[#00D4FF]" />
                </div>
                <h2 className="text-center text-xl font-bold text-white">
                  Admin Login
                </h2>
                <p className="mt-1.5 text-center text-sm text-slate-400">
                  Only admins can list cars on Saatvik Cars
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="px-6 pb-8 pt-4">
                {/* Error banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      role="alert"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                      <span className="text-sm text-red-300">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Username field */}
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Username
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setError(''); }}
                      placeholder="Enter admin username"
                      autoComplete="username"
                      disabled={loading}
                      suppressHydrationWarning
                      className="h-11 rounded-xl border-white/[0.08] bg-white/[0.04] pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-400 focus:border-[#00D4FF]/40 focus:bg-white/[0.06]"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="mb-6">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="Enter password"
                      autoComplete="current-password"
                      disabled={loading}
                      suppressHydrationWarning
                      className="h-11 rounded-xl border-white/[0.08] bg-white/[0.04] pl-10 pr-11 text-sm text-slate-200 placeholder:text-slate-400 focus:border-[#00D4FF]/40 focus:bg-white/[0.06]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      suppressHydrationWarning
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Login button */}
                <Button
                  type="submit"
                  disabled={loading}
                  suppressHydrationWarning
                  className="h-11 w-full rounded-xl bg-[#00D4FF] text-sm font-bold text-[#0A0A0A] hover:bg-[#00B8E6] transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Login as Admin
                    </>
                  )}
                </Button>

                {/* Info text */}
                <p className="mt-4 text-center text-[11px] text-slate-400 leading-relaxed">
                  Only authorized administrators can list cars on Saatvik Cars.<br />
                  Contact support if you need admin access.
                </p>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
