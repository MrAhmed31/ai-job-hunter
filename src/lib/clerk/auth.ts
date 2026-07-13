import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  buildFallbackProfile,
  isSupabaseUnreachable,
} from "@/lib/db/fallback-profile";
import { withTimeout } from "@/lib/db/with-timeout";
import type { Profile } from "@/types/database";

const DB_TIMEOUT_MS = 4000;

export async function getAuthUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

function readClerkProfile(meta: unknown): Profile | undefined {
  if (!meta || typeof meta !== "object") return undefined;
  const profile = (meta as { ajhProfile?: Profile }).ajhProfile;
  if (!profile?.id || !profile?.clerk_id) return undefined;
  return profile;
}

export async function getOrCreateProfile(): Promise<Profile> {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const fullName = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null;
  const avatarUrl = clerkUser.imageUrl ?? null;
  const metadataProfile = readClerkProfile(clerkUser.privateMetadata);

  try {
    const supabase = createServerClient();

    const { data: existing, error: selectError } = await withTimeout(
      supabase.from("profiles").select("*").eq("clerk_id", clerkUser.id).maybeSingle(),
      DB_TIMEOUT_MS,
      "Load profile"
    );

    if (selectError) {
      if (isSupabaseUnreachable(selectError)) {
        return await ensureClerkFallbackProfile(clerkUser.id, email, fullName, avatarUrl, metadataProfile);
      }
      throw new Error(`Failed to load profile: ${selectError.message}`);
    }

    if (existing) {
      await mirrorProfileToClerk(clerkUser.id, existing as Profile).catch(() => undefined);
      return existing as Profile;
    }

    const { data: created, error: insertError } = await withTimeout(
      supabase
        .from("profiles")
        .upsert(
          {
            clerk_id: clerkUser.id,
            email,
            full_name: fullName,
            avatar_url: avatarUrl,
          },
          { onConflict: "clerk_id" }
        )
        .select("*")
        .maybeSingle(),
      DB_TIMEOUT_MS,
      "Create profile"
    );

    if (insertError) {
      if (isSupabaseUnreachable(insertError)) {
        return await ensureClerkFallbackProfile(clerkUser.id, email, fullName, avatarUrl, metadataProfile);
      }
      throw new Error(`Failed to create profile: ${insertError.message}`);
    }

    if (!created) {
      return await ensureClerkFallbackProfile(clerkUser.id, email, fullName, avatarUrl, metadataProfile);
    }

    await mirrorProfileToClerk(clerkUser.id, created as Profile).catch(() => undefined);
    return created as Profile;
  } catch (error) {
    if (
      isSupabaseUnreachable(error) ||
      (error instanceof Error && (/Missing Supabase|timed out/i.test(error.message)))
    ) {
      return await ensureClerkFallbackProfile(clerkUser.id, email, fullName, avatarUrl, metadataProfile);
    }
    throw error;
  }
}

async function ensureClerkFallbackProfile(
  clerkId: string,
  email: string,
  fullName: string | null,
  avatarUrl: string | null,
  existing?: Profile
): Promise<Profile> {
  if (existing?.id && existing.clerk_id === clerkId) {
    return {
      ...existing,
      email: email || existing.email,
      full_name: fullName ?? existing.full_name,
      avatar_url: avatarUrl ?? existing.avatar_url,
      updated_at: new Date().toISOString(),
    };
  }

  const profile = buildFallbackProfile({ clerkId, email, fullName, avatarUrl });
  await mirrorProfileToClerk(clerkId, profile).catch(() => undefined);
  return profile;
}

async function mirrorProfileToClerk(clerkId: string, profile: Profile) {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkId);
  await client.users.updateUser(clerkId, {
    privateMetadata: {
      ...user.privateMetadata,
      ajhProfile: profile,
      ajhDbMode: "fallback",
    },
  });
}

export async function getProfileByClerkId(clerkId: string): Promise<Profile | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await withTimeout(
      supabase.from("profiles").select("*").eq("clerk_id", clerkId).maybeSingle(),
      DB_TIMEOUT_MS,
      "Get profile"
    );

    if (!error && data) return data as Profile;
  } catch {
    // fall through to Clerk metadata
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkId);
    return readClerkProfile(user.privateMetadata) ?? null;
  } catch {
    return null;
  }
}
