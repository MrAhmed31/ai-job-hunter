import { createServerClient } from "@/lib/supabase/server";
import type { Resume } from "@/types/database";

export async function getUserResumes(profileId: string): Promise<Resume[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load resumes: ${error.message}`);
  }

  return (data as Resume[]) ?? [];
}

export async function getResumeById(profileId: string, resumeId: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("resumes")
    .select("*, resume_versions(*)")
    .eq("id", resumeId)
    .eq("user_id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load resume: ${error.message}`);
  }

  return data;
}
