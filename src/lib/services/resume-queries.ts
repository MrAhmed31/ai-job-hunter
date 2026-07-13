import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseUnreachable } from "@/lib/db/fallback-profile";
import { withTimeout } from "@/lib/db/with-timeout";
import { getBlobResume, listBlobResumes } from "@/lib/db/resume-blob";
import type { Resume } from "@/types/database";

const DB_TIMEOUT_MS = 4000;

export async function getUserResumes(profileId: string): Promise<Resume[]> {
  try {
    const supabase = createServerClient();
    const { data, error } = await withTimeout(
      supabase
        .from("resumes")
        .select("*")
        .eq("user_id", profileId)
        .order("created_at", { ascending: false }),
      DB_TIMEOUT_MS,
      "Load resumes"
    );

    if (error) {
      if (isSupabaseUnreachable(error)) return listBlobResumes(profileId);
      throw new Error(`Failed to load resumes: ${error.message}`);
    }

    return (data as Resume[]) ?? [];
  } catch (error) {
    if (isSupabaseUnreachable(error)) return listBlobResumes(profileId);
    throw error;
  }
}

export async function getResumeById(profileId: string, resumeId: string) {
  try {
    const supabase = createServerClient();
    const { data, error } = await withTimeout(
      supabase
        .from("resumes")
        .select("*, resume_versions(*)")
        .eq("id", resumeId)
        .eq("user_id", profileId)
        .maybeSingle(),
      DB_TIMEOUT_MS,
      "Load resume"
    );

    if (error) {
      if (isSupabaseUnreachable(error)) return getBlobResume(profileId, resumeId);
      throw new Error(`Failed to load resume: ${error.message}`);
    }

    return data;
  } catch (error) {
    if (isSupabaseUnreachable(error)) return getBlobResume(profileId, resumeId);
    throw error;
  }
}
