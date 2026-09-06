"use client";

import { useEffect, useState } from 'react';
import { handleAuthCallback, handleSignupCallback, getAuthIntent } from '@/lib/auth/zitadelAuth';
import { useMusicStore } from '@/lib/store/useMusicStore';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Module-level guard: completely immune to React Strict Mode double-invocations
let callbackExecuted = false;

export default function CallbackPage() {
  const { setAuthUser } = useMusicStore();
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Connecting with ZITADEL...');

  useEffect(() => {
    if (callbackExecuted) return;
    callbackExecuted = true;

    async function processCallback() {
      const intent = getAuthIntent();

      if (intent === 'signup') {
        setStatusMessage('Creating your account in database...');
        try {
          const success = await handleSignupCallback();
          if (success) {
            // Cleanly replace URL to login page with registered flag (NOT logged in)
            window.location.replace('/login?registered=true');
          } else {
            setError('Account creation could not be completed. Please try signing up again.');
          }
        } catch (err: any) {
          console.error('Signup callback error:', err);
          setError(err.message || 'Registration failed');
        }
      } else {
        setStatusMessage('Completing login with ZITADEL...');
        try {
          const user = await handleAuthCallback();
          if (user) {
            setAuthUser(user);
            window.location.replace('/');
          } else {
            setError('Authentication completed but no user session was found. Please log in again.');
          }
        } catch (err: any) {
          console.error('Login callback error:', err);
          setError(err.message || 'Authentication failed');
        }
      }
    }

    processCallback();
  }, [setAuthUser]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0e14] px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#151922] p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authentication Issue</h2>
          <p className="text-sm text-gray-400 mb-6">{error}</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full rounded-xl bg-[#6366f1] px-4 py-3 font-medium text-white transition hover:bg-[#4f46e5]"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0e14] px-4 text-white">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#6366f1]" />
        <h2 className="text-lg font-medium text-gray-200">{statusMessage}</h2>
        <p className="text-xs text-gray-500">Securing your session with API Gateway</p>
      </div>
    </div>
  );
}
