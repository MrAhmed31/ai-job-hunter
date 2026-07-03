import type { ResumeAnalysis, JobMatch, Application, SubscriptionTier } from "@/types/database";

export type DashboardStats = {
  applicationsSent: number;
  resumeScore: number | null;
  interviewReadiness: number | null;
  linkedinScore: number | null;
  portfolioScore: number | null;
  savedJobs: number;
  recentApplications: Application[];
  recentMatches: JobMatch[];
  aiSuggestions: string[];
};

export type ResumeUploadResult = {
  resumeId: string;
  analysis: ResumeAnalysis;
};

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export const FREE_TIER_LIMITS: Record<string, number> = {
  resume_review: 3,
  job_match: 5,
  cover_letter: 1,
  interview_session: 1,
  linkedin_review: 2,
  portfolio_review: 2,
};

export const PRO_FEATURES: SubscriptionTier[] = ["pro"];
