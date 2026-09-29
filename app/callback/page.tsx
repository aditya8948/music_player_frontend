"use client";

import { useEffect, useState } from "react";
import { handleAuthCallback, handleSignupCallback, getAuthIntent } from "@/lib/auth/zitadelAuth";
import { useMusicStore } from "@/lib/store/useMusicStore";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

let callbackExecuted = false;

export default function CallbackPage() {
  const { setAuthUser } = useMusicStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (callbackExecuted) return;
    callbackExecuted = true;

    async function processCallback() {
      const intent = getAuthIntent();

      if (intent === "signup") {
        try {
          const success = await handleSignupCallback();
          if (success) {
            window.location.replace("/login?registered=true");
          } else {
            setError("Account creation could not be completed. Please try signing up again.");
          }
        } catch (err: any) {
          console.error("Signup callback error:", err);
          setError(err.message || "Registration failed");
        }
      } else {
        try {
          const user = await handleAuthCallback();
          if (user) {
            setAuthUser(user);
            window.location.replace("/");
          } else {
            setError("Authentication completed but no user session was found. Please log in again.");
          }
        } catch (err: any) {
          console.error("Login callback error:", err);
          setError(err.message || "Authentication failed");
        }
      }
    }

    processCallback();
  }, [setAuthUser]);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="w-full max-w-sm rounded-2xl bg-[#11151b] border border-white/10 p-6 text-center shadow-2xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Authentication Issue</h2>
          <p className="text-sm text-gray-400 mb-5">{error}</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-sm font-semibold text-white transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">Loading...</span>
      </div>
    </div>
  );
}
