import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/pricing",
  "/faq",
  "/robots.txt",
  "/sitemap.xml",
]);

/**
 * Do NOT use auth.protect() here.
 * With Clerk development keys (pk_test_), protect() rewrites unauthenticated
 * requests to /404 (X-Clerk-Auth-Reason: protect-rewrite, dev-browser-missing).
 * Manual redirect to /sign-in is the reliable fix.
 */
const clerkHandler = clerkMiddleware(
  async (auth, request) => {
    if (isPublicRoute(request)) return;

    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.url);
      return NextResponse.redirect(signInUrl);
    }
  },
  {
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
  }
);

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  const hasClerkKeys =
    process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!hasClerkKeys) {
    if (isPublicRoute(request)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
