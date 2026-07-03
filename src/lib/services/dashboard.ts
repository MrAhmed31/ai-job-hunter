import { createServerClient } from "@/lib/supabase/server";
import type { DashboardStats } from "@/types/index";

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = createServerClient();

  const [
    applicationsResult,
    primaryResume,
    linkedinReview,
    portfolioReview,
    savedJobsCount,
    recentApplications,
    recentMatches,
  ] = await Promise.all([
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "applied"),
    supabase
      .from("resumes")
      .select("ats_score")
      .eq("user_id", userId)
      .eq("is_primary", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("linkedin_reviews")
      .select("overall_score")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("portfolio_reviews")
      .select("overall_score")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("saved_jobs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("applications")
      .select("*, jobs(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("job_matches")
      .select("*, jobs(*)")
      .eq("user_id", userId)
      .order("match_score", { ascending: false })
      .limit(5),
  ]);

  const interviewSessions = await supabase
    .from("interview_sessions")
    .select("confidence_score")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);

  const avgConfidence =
    interviewSessions.data && interviewSessions.data.length > 0
      ? Math.round(
          interviewSessions.data.reduce((sum, s) => sum + (s.confidence_score ?? 0), 0) /
            interviewSessions.data.length
        )
      : null;

  const aiSuggestions = generateSuggestions({
    resumeScore: primaryResume.data?.ats_score ?? null,
    linkedinScore: linkedinReview.data?.overall_score ?? null,
    portfolioScore: portfolioReview.data?.overall_score ?? null,
    applicationsSent: applicationsResult.count ?? 0,
  });

  return {
    applicationsSent: applicationsResult.count ?? 0,
    resumeScore: primaryResume.data?.ats_score ?? null,
    interviewReadiness: avgConfidence,
    linkedinScore: linkedinReview.data?.overall_score ?? null,
    portfolioScore: portfolioReview.data?.overall_score ?? null,
    savedJobs: savedJobsCount.count ?? 0,
    recentApplications: recentApplications.data ?? [],
    recentMatches: recentMatches.data ?? [],
    aiSuggestions,
  };
}

function generateSuggestions(ctx: {
  resumeScore: number | null;
  linkedinScore: number | null;
  portfolioScore: number | null;
  applicationsSent: number;
}): string[] {
  const suggestions: string[] = [];

  if (ctx.resumeScore === null) {
    suggestions.push("Upload your resume to get an ATS score and personalized improvements.");
  } else if (ctx.resumeScore < 70) {
    suggestions.push("Your resume ATS score is below 70. Run the optimizer to boost your chances.");
  }

  if (ctx.linkedinScore === null) {
    suggestions.push("Add your LinkedIn profile for a free optimization review.");
  } else if (ctx.linkedinScore < 75) {
    suggestions.push("Your LinkedIn profile has room to improve. Check the review suggestions.");
  }

  if (ctx.portfolioScore === null) {
    suggestions.push("Connect your GitHub or portfolio for a professional review.");
  }

  if (ctx.applicationsSent === 0) {
    suggestions.push("Start matching jobs to find roles that fit your experience.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Great progress! Generate a cover letter for your top job match.");
    suggestions.push("Practice interview questions to boost your readiness score.");
  }

  return suggestions.slice(0, 4);
}
