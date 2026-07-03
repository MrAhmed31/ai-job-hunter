import { getOpenAI, ANALYSIS_MODEL } from "@/lib/ai/openai";
import { INTERVIEW_QUESTIONS_PROMPT, INTERVIEW_EVALUATE_PROMPT } from "@/lib/ai/prompts";
import { createServerClient } from "@/lib/supabase/server";
import { checkUsageLimit, logUsage } from "@/lib/services/usage";
import type { Profile, InterviewQuestion, InterviewAnswer, InterviewEvaluation } from "@/types/database";

export async function generateInterviewPrep(
  profile: Profile,
  options: { jobTitle: string; companyName: string; jobDescription?: string; resumeId?: string }
) {
  const { allowed } = await checkUsageLimit(profile, "interview_session");
  if (!allowed) throw new Error("Monthly interview session limit reached. Upgrade to Pro.");

  const supabase = createServerClient();
  const { data: resume } = options.resumeId
    ? await supabase.from("resumes").select("raw_text").eq("id", options.resumeId).single()
    : await supabase.from("resumes").select("raw_text").eq("user_id", profile.id).eq("is_primary", true).single();

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [
      { role: "system", content: INTERVIEW_QUESTIONS_PROMPT },
      {
        role: "user",
        content: `Role: ${options.jobTitle} at ${options.companyName}\n\nResume:\n${resume?.raw_text?.slice(0, 4000) ?? "N/A"}\n\nJob Description:\n${options.jobDescription?.slice(0, 3000) ?? "N/A"}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Failed to generate interview questions");

  const parsed = JSON.parse(content) as { questions: InterviewQuestion[]; answers: InterviewAnswer[] };

  const { data, error } = await supabase
    .from("interview_sessions")
    .insert({
      user_id: profile.id,
      title: `Interview Prep - ${options.jobTitle} at ${options.companyName}`,
      questions: parsed.questions,
      answers: parsed.answers,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  await logUsage(profile.id, "interview_session");

  return data;
}

export async function evaluateInterviewResponse(
  profile: Profile,
  sessionId: string,
  questionId: string,
  userResponse: string
): Promise<InterviewEvaluation> {
  const supabase = createServerClient();
  const { data: session } = await supabase
    .from("interview_sessions")
    .select("questions")
    .eq("id", sessionId)
    .eq("user_id", profile.id)
    .single();

  const question = (session?.questions as InterviewQuestion[])?.find((q) => q.id === questionId);

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [
      { role: "system", content: INTERVIEW_EVALUATE_PROMPT },
      {
        role: "user",
        content: `Question: ${question?.question ?? "Unknown"}\n\nCandidate Response:\n${userResponse}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Failed to evaluate response");

  const evaluation = JSON.parse(content) as InterviewEvaluation;

  await supabase
    .from("interview_sessions")
    .update({ evaluation, confidence_score: evaluation.confidenceScore })
    .eq("id", sessionId);

  return evaluation;
}

export async function getInterviewSessions(userId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
