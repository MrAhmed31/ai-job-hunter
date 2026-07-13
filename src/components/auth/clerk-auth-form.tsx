"use client";

import { useEffect, useState } from "react";
import { SignIn, SignUp, useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

type Mode = "sign-in" | "sign-up";

export function ClerkAuthForm({ mode }: { mode: Mode }) {
  const { isLoaded } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg p-4">
      <div className="w-full max-w-md">
        {mode === "sign-in" ? (
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/dashboard"
            forceRedirectUrl="/dashboard"
          />
        ) : (
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/dashboard"
            forceRedirectUrl="/dashboard"
          />
        )}

        {!isLoaded && !timedOut && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading sign-in form...
          </div>
        )}

        {!isLoaded && timedOut && (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-card p-6 text-center text-sm shadow-sm">
            <p className="font-medium">Still loading Clerk?</p>
            <p className="mt-2 text-muted-foreground">
              In Clerk Dashboard → Configure → Paths, set Fallback development host to{" "}
              <code className="rounded bg-muted px-1">https://ai-job-hunter-liard.vercel.app</code>{" "}
              (no trailing slash) and Home URL to <code className="rounded bg-muted px-1">/</code>.
            </p>
            <p className="mt-2 text-muted-foreground">
              Also confirm your publishable key is complete in Vercel.
            </p>
            <a href="/" className="mt-4 inline-block text-violet-600 hover:underline dark:text-violet-400">
              ← Back to home
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
