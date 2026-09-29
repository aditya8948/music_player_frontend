"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMusicStore } from "@/lib/store/useMusicStore";
import { signupWithZitadel } from "@/lib/auth/zitadelAuth";
import { ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { authUser } = useMusicStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && Boolean(localStorage.getItem("music-auth"))) {
      router.replace("/");
    }
  }, [authUser, router]);

  const handleSignup = async () => {
    try {
      setLoading(true);
      await signupWithZitadel();
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
            Create an account
          </h1>
          <p className="mt-1.5 text-sm text-stone-500">
            Start streaming and creating custom playlists
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleSignup}
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
                <span>Sign up with ZITADEL</span>
                <ArrowRight className="w-4 h-4 text-stone-300" />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-stone-100 text-center text-sm">
          <span className="text-stone-500">Already have an account?</span>
          <Link
            href="/login"
            className="ml-1.5 font-medium text-stone-900 hover:text-amber-800 hover:underline transition-colors font-semibold"
          >
            Log in
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
