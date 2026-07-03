"use client";

import { ClerkFailed, ClerkLoaded, ClerkLoading, SignIn, SignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

type Mode = "sign-in" | "sign-up";

export function ClerkAuthForm({ mode }: { mode: Mode }) {
  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg p-4">
      <div className="w-full max-w-md">
        <ClerkLoading>
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card/80 p-10 shadow-sm backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            <p className="text-sm text-muted-foreground">Loading authentication...</p>
          </div>
        </ClerkLoading>

        <ClerkLoaded>
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
        </ClerkLoaded>

        <ClerkFailed>
          <div className="rounded-2xl border border-red-500/30 bg-card p-8 text-center shadow-sm">
            <h1 className="text-lg font-semibold">Sign-in failed to load</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Clerk could not start. Check these in order:
            </p>
            <ol className="mt-4 space-y-2 text-left text-sm text-muted-foreground">
              <li>
                1. Vercel has <code className="rounded bg-muted px-1">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and{" "}
                <code className="rounded bg-muted px-1">CLERK_SECRET_KEY</code>
              </li>
              <li>2. You redeployed after adding those variables</li>
              <li>
                3. In Clerk Dashboard → Configure → Domains, add{" "}
                <code className="rounded bg-muted px-1">ai-job-hunter-liard.vercel.app</code>
              </li>
            </ol>
            <a
              href="/"
              className="mt-6 inline-block text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
            >
              ← Back to home
            </a>
          </div>
        </ClerkFailed>
      </div>
    </div>
  );
}
