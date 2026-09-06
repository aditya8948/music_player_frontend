"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMusicStore } from '@/lib/store/useMusicStore';
import { signupWithZitadel } from '@/lib/auth/zitadelAuth';
import { 
  Sparkles, 
  ArrowRight, 
  Music, 
  ShieldCheck,
  Disc3,
  Heart,
  Lock
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { authUser } = useMusicStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && Boolean(localStorage.getItem('music-auth'))) {
      router.replace('/');
    }
  }, [authUser, router]);

  const handleSignup = async () => {
    try {
      setLoading(true);
      await signupWithZitadel();
    } catch (err) {
      console.error('Failed to redirect to ZITADEL:', err);
      setLoading(false);
    }
  };

  return (
    <div className='w-full max-w-5xl py-4'>
      <div className='auth-page-card grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-[2.5rem] border border-white/20 bg-slate-950/75 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8)]'>
        
        {/* Left Side: Visual Showcase */}
        <div className='lg:col-span-5 relative p-8 lg:p-10 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-pink-500/20 via-purple-600/20 to-amber-500/20 border-b lg:border-b-0 lg:border-r border-white/10'>
          
          <div className='absolute -top-20 -left-20 w-64 h-64 bg-pink-500/30 rounded-full blur-3xl pointer-events-none' />
          <div className='absolute -bottom-20 -right-20 w-64 h-64 bg-amber-400/25 rounded-full blur-3xl pointer-events-none' />
          
          <div className='relative z-10'>
            <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-pink-200 text-xs font-semibold tracking-wide shadow-sm'>
              <Sparkles className='w-3.5 h-3.5 text-amber-300' />
              <span>Join MuseKit</span>
            </div>
            
            <h2 className='mt-4 text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-rose-100 to-amber-200 leading-tight'>
              Your New Soundstage.
            </h2>
            <p className='mt-2 text-sm text-pink-100/80 leading-relaxed font-normal'>
              Unlimited tracks, curated playlists, and crystal-clear audio powered by modern microservices.
            </p>
          </div>

          <div className='relative z-10 my-6 flex justify-center'>
            <div className='relative group w-full max-w-[280px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-2 border-white/30 transition-transform duration-500 hover:scale-[1.03]'>
              <img 
                src='/headphones-flowers-card.jpg' 
                alt='Headphones surrounded by blooming flowers' 
                className='w-full h-full object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80' />
              
              <div className='absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-between text-white'>
                <div className='flex items-center gap-2.5'>
                  <div className='w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-white shadow-md'>
                    <Heart className='w-4 h-4 text-white' />
                  </div>
                  <div>
                    <div className='text-xs font-bold leading-none'>Unlimited Play</div>
                    <div className='text-[10px] text-pink-200/80 mt-0.5'>100% Free Access</div>
                  </div>
                </div>
                <div className='flex items-end gap-0.5 h-4'>
                  <span className='w-1 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3' />
                  <span className='w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s] h-4' />
                  <span className='w-1 bg-rose-400 rounded-full animate-bounce h-2' />
                </div>
              </div>
            </div>
          </div>

          <div className='relative z-10 grid grid-cols-2 gap-2.5 pt-2'>
            <div className='flex items-center gap-2 p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm'>
              <Disc3 className='w-4 h-4 text-pink-300 shrink-0' />
              <span className='text-xs font-medium text-slate-100'>ZITADEL Auth</span>
            </div>
            <div className='flex items-center gap-2 p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm'>
              <ShieldCheck className='w-4 h-4 text-emerald-300 shrink-0' />
              <span className='text-xs font-medium text-slate-100'>API Gateway</span>
            </div>
          </div>

        </div>

        {/* Right Side: Action Box */}
        <div className='lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-slate-900/60 relative'>
          
          <div className='mb-7'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='h-12 w-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 p-[2px] shadow-lg shadow-pink-500/30 flex items-center justify-center'>
                <div className='w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center'>
                  <Music className='w-6 h-6 text-pink-400' />
                </div>
              </div>
              <div>
                <h1 className='text-2xl lg:text-3xl font-black text-white tracking-tight'>Get Started</h1>
                <p className='text-xs sm:text-sm text-pink-200/70 font-medium'>Create your account via ZITADEL</p>
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <p className='text-sm text-slate-300 leading-relaxed'>
              MuseKit uses central cloud identity management. Click below to create your account or sign in with your credentials.
            </p>

            <button
              type='button'
              onClick={handleSignup}
              disabled={loading}
              className='group w-full rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 p-[1px] shadow-xl shadow-pink-500/25 transition-all duration-300 hover:shadow-pink-500/40 active:scale-[0.99] disabled:opacity-50'
            >
              <div className='w-full py-4 px-6 rounded-[15px] bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 group-hover:from-pink-500 group-hover:via-rose-500 group-hover:to-amber-500 text-white font-bold text-base flex items-center justify-center gap-2.5 transition-all duration-200'>
                {loading ? (
                  <>
                    <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    Connecting to ZITADEL...
                  </>
                ) : (
                  <>
                    <Lock className='w-5 h-5' />
                    <span>Sign up with ZITADEL</span>
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Navigation to Login */}
          <div className='mt-8 pt-5 border-t border-white/10 text-center text-sm'>
            <span className='text-slate-300 font-medium'>Already have an account?</span>
            <Link 
              href='/login'
              className='ml-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-amber-300 hover:underline inline-flex items-center gap-1'
            >
              Log in here
              <ArrowRight className='w-3.5 h-3.5 text-amber-300 inline' />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
