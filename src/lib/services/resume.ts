import { getOpenAI, ANALYSIS_MODEL } from "@/lib/ai/openai";
import { RESUME_ANALYSIS_PROMPT, RESUME_IMPROVE_PROMPT } from "@/lib/ai/prompts";
import { createServerClient } from "@/lib/supabase/server";
import { storeEmbeddings } from "@/lib/rag/embeddings";
import { checkUsageLimit, logUsage } from "@/lib/services/usage";
import { extractTextFromFile, detectFileType, validateResumeText } from "@/lib/services/resume-parser";
import type { Profile, ResumeAnalysis, ResumeVersionType } from "@/types/database";

export async function uploadAndAnalyzeResume(
  profile: Profile,
  file: File
): Promise<{ resumeId: string; analysis: ResumeAnalysis }> {
  const { allowed } = await checkUsageLimit(profile, "resume_review");
  if (!allowed) throw new Error("Monthly resume review limit reached. Upgrade to Pro for unlimited reviews.");

  const fileType = detectFileType(file.name);
  if (!fileType) throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const rawText = await extractTextFromFile(buffer, fileType);

  if (!validateResumeText(rawText)) {
    throw new Error("Resume text is too short. Please upload a complete resume.");
  }

  const supabase = createServerClient();
  const filePath = `${profile.id}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(filePath, buffer, { contentType: file.type });

  if (uploadError) {
    console.warn("Storage upload failed, continuing without file URL:", uploadError.message);
  }

  const { data: publicUrl } = supabase.storage.from("resumes").getPublicUrl(filePath);

  const analysis = await analyzeResumeText(rawText);

  const { data: resume, error } = await supabase
    .from("resumes")
    .insert({
      user_id: profile.id,
      title: file.name.replace(/\.[^.]+$/, ""),
      original_filename: file.name,
      file_url: uploadError ? null : publicUrl.publicUrl,
      file_type: fileType,
      raw_text: rawText,
      ats_score: analysis.atsScore,
      analysis,
      is_primary: true,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save resume: ${error.message}`);

  await storeEmbeddings(profile.id, "resume", resume.id, rawText, {
    filename: file.name,
    atsScore: analysis.atsScore,
  });

  await logUsage(profile.id, "resume_review", 0, { resumeId: resume.id });

  return { resumeId: resume.id, analysis };
}

export async function analyzeResumeText(text: string): Promise<ResumeAnalysis> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [
      { role: "system", content: RESUME_ANALYSIS_PROMPT },
      { role: "user", content: `Resume:\n\n${text.slice(0, 12000)}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Failed to analyze resume");

  return JSON.parse(content) as ResumeAnalysis;
}

export async function generateResumeVersion(
  profile: Profile,
  resumeId: string,
  versionType: ResumeVersionType
): Promise<string> {
  const supabase = createServerClient();
  const { data: resume } = await supabase
    .from("resumes")
    .select("raw_text")
    .eq("id", resumeId)
    .eq("user_id", profile.id)
    .single();

  if (!resume?.raw_text) throw new Error("Resume not found");

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [
      { role: "system", content: RESUME_IMPROVE_PROMPT(versionType) },
      { role: "user", content: resume.raw_text.slice(0, 12000) },
    ],
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Failed to generate resume version");

  await supabase.from("resume_versions").insert({
    resume_id: resumeId,
    user_id: profile.id,
    version_type: versionType,
    content,
  });

  return content;
}

export async function getUserResumes(profileId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", profileId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getResumeById(profileId: string, resumeId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("resumes")
    .select("*, resume_versions(*)")
    .eq("id", resumeId)
    .eq("user_id", profileId)
    .single();
  return data;
}
