"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateProfile } from "@/lib/clerk/auth";
import { uploadAndAnalyzeResume, generateResumeVersion } from "@/lib/services/resume";
import { sendChatMessage } from "@/lib/services/chat";
import type { ResumeVersionType } from "@/types/database";

export async function uploadResumeAction(formData: FormData) {
  try {
    const profile = await getOrCreateProfile();
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    const result = await uploadAndAnalyzeResume(profile, file);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/resume");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Upload failed" };
  }
}

export async function generateResumeVersionAction(resumeId: string, versionType: ResumeVersionType) {
  try {
    const profile = await getOrCreateProfile();
    const content = await generateResumeVersion(profile, resumeId, versionType);
    revalidatePath(`/dashboard/resume/${resumeId}`);
    return { success: true, data: { content, versionType } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Generation failed" };
  }
}

export async function sendChatMessageAction(conversationId: string | null, message: string) {
  try {
    const profile = await getOrCreateProfile();
    const result = await sendChatMessage(profile, conversationId, message);
    revalidatePath("/dashboard/chat");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Chat failed" };
  }
}
