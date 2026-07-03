import { auth, currentUser } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function getAuthUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function getOrCreateProfile(): Promise<Profile> {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const supabase = createServerClient();
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const fullName = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null;
  const avatarUrl = clerkUser.imageUrl ?? null;

  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_id", clerkUser.id)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Failed to load profile: ${selectError.message}`);
  }

  if (existing) {
    return existing as Profile;
  }

  const { data: created, error: insertError } = await supabase
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
    .maybeSingle();

  if (insertError) {
    throw new Error(`Failed to create profile: ${insertError.message}`);
  }

  if (!created) {
    const { data: retry } = await supabase
      .from("profiles")
      .select("*")
      .eq("clerk_id", clerkUser.id)
      .maybeSingle();

    if (retry) return retry as Profile;
    throw new Error("Failed to create profile: no row returned");
  }

  return created as Profile;
}

export async function getProfileByClerkId(clerkId: string): Promise<Profile | null> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_id", clerkId)
    .maybeSingle();
  return (data as Profile | null) ?? null;
}
