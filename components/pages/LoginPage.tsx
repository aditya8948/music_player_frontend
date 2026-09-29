"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMusicStore } from "@/lib/store/useMusicStore";
import { loginWithZitadel } from "@/lib/auth/zitadelAuth";
import { ArrowRight, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";
  const { authUser } = useMusicStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isRegistered) {
      localStorage.removeItem("music-auth");
      localStorage.removeItem("auth-token");
      localStorage.removeItem("music-player-store");
      return;
    }
    if (typeof window !== "undefined" && Boolean(localStorage.getItem("music-auth"))) {
      router.replace("/");
    }
  }, [router, isRegistered]);

  const handleZitadelLogin = async () => {
    try {
      setLoading(true);
      await loginWithZitadel();
    } catch (err) {
      console.error("Failed to redirect to ZITADEL:", err);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto px-4">
      <div className="rounded-3xl border border-stone-200/90 bg-white p-10 sm:p-12 shadow-[0_20px_50px_rgba(40,30,20,0.08),0_1px_3px_rgba(0,0,0,0.04)]">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/musekit-logo.jpg"
              alt="MuseKit"
              className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-stone-200"
            />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Log in to MuseKit
          </h1>
          <p className="mt-1.5 text-sm text-stone-500">
            Listen to your personal music collection
          </p>
        </div>

        {/* Success Banner if redirected from sign up */}
        {isRegistered && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Account created. Please sign in to continue.</span>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleZitadelLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-stone-900 text-white px-4 py-3.5 text-base font-semibold hover:bg-black active:scale-[0.99] transition duration-150 disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              <>
                <span>Continue with ZITADEL</span>
                <ArrowRight className="w-4 h-4 text-stone-300" />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-stone-100 text-center text-sm">
          <span className="text-stone-500">Don't have an account?</span>
          <Link
            href="/signup"
            className="ml-1.5 font-medium text-stone-900 hover:text-amber-800 hover:underline transition-colors font-semibold"
          >
            Sign up
          </Link>
        </div>

        {/* Subtle provider tag */}
        <p className="mt-4 text-center text-[11px] text-stone-400">
          Single Sign-On powered by ZITADEL
        </p>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-stone-500 text-sm">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
