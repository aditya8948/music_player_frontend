"use client";

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMusicStore } from '@/lib/store/useMusicStore';
import { loginWithZitadel } from '@/lib/auth/zitadelAuth';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle2
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';
  const { authUser } = useMusicStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isRegistered) {
      localStorage.removeItem('music-auth');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('music-player-store');
      return;
    }
    if (typeof window !== 'undefined' && Boolean(localStorage.getItem('music-auth'))) {
      router.replace('/');
    }
  }, [router, isRegistered]);

  const handleZitadelLogin = async () => {
    try {
      setLoading(true);
      await loginWithZitadel();
    } catch (err) {
      console.error('Failed to redirect to ZITADEL:', err);
      setLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto px-4'>
      <div className='auth-page-card bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl'>

        {/* Header */}
        <div className='mb-8 text-center'>
          <div className='flex items-center justify-center gap-2.5 mb-2'>
            <img
              src='/musekit-logo.jpg'
              alt='MuseKit'
              className='w-11 h-11 rounded-2xl shadow-lg shadow-purple-500/20'
            />
            <span className='text-xl font-bold tracking-tight text-white'>
              MuseKit
            </span>
          </div>

          <div className='inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium'>
            <Sparkles className='w-3.5 h-3.5 text-indigo-400' />
            <span>Identity by ZITADEL</span>
          </div>

          <h1 className='text-2xl font-extrabold text-white mt-4'>
            Welcome to MuseKit
          </h1>
          <p className='mt-2 text-sm text-slate-400'>
            Sign in securely through our central identity provider
          </p>
        </div>

        {/* Success Banner after registration */}
        {isRegistered && (
          <div className='mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300 shadow-lg shadow-emerald-500/5'>
            <CheckCircle2 className='w-5 h-5 shrink-0 text-emerald-400' />
            <span>Account created successfully! Please sign in with your credentials.</span>
          </div>
        )}

        {/* Action Button */}
        <div className='space-y-4'>
          <button
            type='button'
            onClick={handleZitadelLogin}
            disabled={loading}
            className='w-full group relative flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:shadow-indigo-500/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-60'
          >
            {loading ? (
              <span className='flex items-center gap-2.5'>
                <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                Redirecting to ZITADEL...
              </span>
            ) : (
              <>
                <Lock className='w-5 h-5 text-white/90' />
                <span>Continue with ZITADEL</span>
                <ArrowRight className='w-5 h-5 text-white/90 group-hover:translate-x-1 transition-transform' />
              </>
            )}
          </button>

          {/* Security Features Info */}
          <div className='rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4 text-xs text-slate-300 space-y-2 mt-6'>
            <div className='flex items-center gap-2 text-indigo-300 font-semibold'>
              <ShieldCheck className='w-4 h-4' />
              <span>Enterprise Grade Security</span>
            </div>
            <p className='text-slate-400 leading-relaxed'>
              Seamless OIDC authorization with PKCE, automated MongoDB profile sync, and full API Gateway protection.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className='mt-8 pt-5 border-t border-white/[0.07] text-center text-sm'>
          <span className='text-slate-400'>New to MuseKit?</span>
          <Link
            href='/signup'
            className='ml-1.5 font-semibold text-indigo-400 hover:text-indigo-300 transition-colors'
          >
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className='min-h-[80vh] flex items-center justify-center text-slate-400'>Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
