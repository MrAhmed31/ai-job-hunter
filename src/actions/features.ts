"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateProfile } from "@/lib/clerk/auth";
import { reviewLinkedInProfile } from "@/lib/services/linkedin";
import { reviewPortfolio } from "@/lib/services/portfolio";
import { matchJobFromUrl, saveJob } from "@/lib/services/jobs";
import { generateCoverLetter } from "@/lib/services/cover-letter";
import { generateInterviewPrep, evaluateInterviewResponse } from "@/lib/services/interview";
import type { CoverLetterTone } from "@/types/database";

export async function reviewLinkedInAction(linkedinUrl: string) {
  try {
    const profile = await getOrCreateProfile();
    const result = await reviewLinkedInProfile(profile, linkedinUrl);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/linkedin");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Review failed" };
  }
}

export async function reviewPortfolioAction(
  portfolioUrl: string,
  portfolioType: "github" | "website" | "behance" | "dribbble" | "other"
) {
  try {
    const profile = await getOrCreateProfile();
    const result = await reviewPortfolio(profile, portfolioUrl, portfolioType);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/portfolio");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Review failed" };
  }
}

export async function matchJobAction(jobUrl: string, resumeId?: string) {
  try {
    const profile = await getOrCreateProfile();
    const result = await matchJobFromUrl(profile, jobUrl, resumeId);
    revalidatePath("/dashboard/jobs");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Match failed" };
  }
}

export async function saveJobAction(jobId: string, isFavorite = false) {
  try {
    const profile = await getOrCreateProfile();
    await saveJob(profile.id, jobId, isFavorite);
    revalidatePath("/dashboard/jobs");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Save failed" };
  }
}

export async function generateCoverLetterAction(options: {
  jobTitle: string;
  companyName: string;
  jobDescription?: string;
  companyUrl?: string;
  tone: CoverLetterTone;
  version: "short" | "long";
  jobId?: string;
  resumeId?: string;
}) {
  try {
    const profile = await getOrCreateProfile();
    const result = await generateCoverLetter(profile, options);
    revalidatePath("/dashboard/cover-letter");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Generation failed" };
  }
}

export async function generateInterviewAction(options: {
  jobTitle: string;
  companyName: string;
  jobDescription?: string;
  resumeId?: string;
}) {
  try {
    const profile = await getOrCreateProfile();
    const result = await generateInterviewPrep(profile, options);
    revalidatePath("/dashboard/interview");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Generation failed" };
  }
}

export async function evaluateInterviewAction(sessionId: string, questionId: string, response: string) {
  try {
    const profile = await getOrCreateProfile();
    const result = await evaluateInterviewResponse(profile, sessionId, questionId, response);
    revalidatePath("/dashboard/interview");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Evaluation failed" };
  }
}
