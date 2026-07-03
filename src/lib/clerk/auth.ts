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

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_id", clerkUser.id)
    .single();

  if (existing) return existing as Profile;

  const { data: created, error } = await supabase
    .from("profiles")
    .insert({
      clerk_id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      full_name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
      avatar_url: clerkUser.imageUrl ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create profile: ${error.message}`);
  return created as Profile;
}

export async function getProfileByClerkId(clerkId: string): Promise<Profile | null> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();
  return data as Profile | null;
}
