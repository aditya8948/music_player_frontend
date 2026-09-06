"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import PlayerBar from '@/components/PlayerBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname === '/callback';

  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    if (pathname === '/callback') {
      setIsAuthorized(true);
      return;
    }

    const hasAuth = Boolean(localStorage.getItem('auth-token') && localStorage.getItem('music-auth'));

    if (!isAuthRoute && !hasAuth) {
      setIsAuthorized(false);
      router.replace('/login');
      return;
    }

    if (isAuthRoute && hasAuth) {
      if (window.location.search.includes('registered=true')) {
        setIsAuthorized(true);
        return;
      }
      router.replace('/');
      return;
    }

    setIsAuthorized(hasAuth);
  }, [isAuthRoute, pathname, router]);

  // Auth routes (/login, /signup, /callback) render their own view
  if (isAuthRoute) {
    return (
      <div className='app-shell' suppressHydrationWarning>
        <div className='auth-bg-container' aria-hidden='true'>
          <div className='auth-bg-overlay' />
        </div>
        <main className='main-content-auth'>
          {children}
        </main>
      </div>
    );
  }

  // Before client mounting or while validating auth, show the spinner inside the shell
  if (!mounted || !isAuthorized) {
    return (
      <div className='app-shell' suppressHydrationWarning>
        <div className='flex min-h-screen items-center justify-center bg-[#0d1117] text-white/60'>
          <div className='flex flex-col items-center gap-3'>
            <div className='h-8 w-8 animate-spin rounded-full border-2 border-lime-400 border-t-transparent' />
            <span className='text-xs uppercase tracking-widest text-slate-400'>Authenticating...</span>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user on protected routes
  return (
    <div className='app-shell' suppressHydrationWarning>
      <Header />
      <main className='main-content'>
        {children}
      </main>
      <PlayerBar />
    </div>
  );
}
