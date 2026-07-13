import { getOpenAI, ANALYSIS_MODEL } from "@/lib/ai/openai";
import { RESUME_ANALYSIS_PROMPT, RESUME_IMPROVE_PROMPT } from "@/lib/ai/prompts";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseUnreachable } from "@/lib/db/fallback-profile";
import { createResumeRecord, getBlobResume, saveBlobResume } from "@/lib/db/resume-blob";
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

  const analysis = await analyzeResumeText(rawText);
  const title = file.name.replace(/\.[^.]+$/, "");

  try {
    const supabase = createServerClient();
    const filePath = `${profile.id}/${Date.now()}-${file.name}`;

    const uploadResult = await Promise.race([
      supabase.storage.from("resumes").upload(filePath, buffer, { contentType: file.type }),
      new Promise<{ error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ error: { message: "storage timed out" } }), 4000)
      ),
    ]);

    const uploadError = uploadResult.error;
    if (uploadError) {
      console.warn("Storage upload failed, continuing without file URL:", uploadError.message);
    }

    const { data: publicUrl } = supabase.storage.from("resumes").getPublicUrl(filePath);

    const insertResult = await Promise.race([
      supabase
        .from("resumes")
        .insert({
          user_id: profile.id,
          title,
          original_filename: file.name,
          file_url: uploadError ? null : publicUrl.publicUrl,
          file_type: fileType,
          raw_text: rawText,
          ats_score: analysis.atsScore,
          analysis,
          is_primary: true,
        })
        .select()
        .single(),
      new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: "insert timed out" } }), 4000)
      ),
    ]);

    if (!insertResult.error && insertResult.data) {
      try {
        await storeEmbeddings(profile.id, "resume", insertResult.data.id, rawText, {
          filename: file.name,
          atsScore: analysis.atsScore,
        });
      } catch {
        // optional
      }
      await logUsage(profile.id, "resume_review", 0, { resumeId: insertResult.data.id });
      return { resumeId: insertResult.data.id, analysis };
    }

    if (insertResult.error && !isSupabaseUnreachable(insertResult.error) && !/timed out/i.test(insertResult.error.message)) {
      throw new Error(`Failed to save resume: ${insertResult.error.message}`);
    }
  } catch (error) {
    if (!isSupabaseUnreachable(error) && !(error instanceof Error && /timed out/i.test(error.message))) {
      // Fall through to blob for unreachable cases only when no explicit throw above.
      if (error instanceof Error && error.message.startsWith("Failed to save resume:")) throw error;
    }
  }

  const fallback = await saveBlobResume(
    profile.id,
    createResumeRecord({
      profileId: profile.id,
      title,
      originalFilename: file.name,
      fileType,
      rawText,
      atsScore: analysis.atsScore,
      analysis,
      fileUrl: null,
    })
  );

  await logUsage(profile.id, "resume_review", 0, { resumeId: fallback.id, storage: "blob" });
  return { resumeId: fallback.id, analysis };
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
  let rawText: string | null | undefined;

  try {
    const supabase = createServerClient();
    const { data: resume } = await supabase
      .from("resumes")
      .select("raw_text")
      .eq("id", resumeId)
      .eq("user_id", profile.id)
      .single();
    rawText = resume?.raw_text;
  } catch {
    rawText = null;
  }

  if (!rawText) {
    const blobResume = await getBlobResume(profile.id, resumeId);
    rawText = blobResume?.raw_text;
  }

  if (!rawText) throw new Error("Resume not found");

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [
      { role: "system", content: RESUME_IMPROVE_PROMPT(versionType) },
      { role: "user", content: rawText.slice(0, 12000) },
    ],
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Failed to generate resume version");

  try {
    const supabase = createServerClient();
    await supabase.from("resume_versions").insert({
      resume_id: resumeId,
      user_id: profile.id,
      version_type: versionType,
      content,
    });
  } catch {
    // Version persistence is best-effort when DB is down.
  }

  return content;
}

export { getUserResumes, getResumeById } from "@/lib/services/resume-queries";
