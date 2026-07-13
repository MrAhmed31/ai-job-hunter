import { randomUUID } from "crypto";
import { blobGetJson, blobPutJson, hasBlobStore } from "@/lib/db/blob-store";
import type { Resume } from "@/types/database";

function resumesPath(profileId: string) {
  return `ajh/users/${profileId}/resumes.json`;
}

export async function listBlobResumes(profileId: string): Promise<Resume[]> {
  if (!hasBlobStore()) return [];
  const data = await blobGetJson<Resume[]>(resumesPath(profileId));
  return Array.isArray(data) ? data : [];
}

export async function saveBlobResume(profileId: string, resume: Resume): Promise<Resume> {
  const existing = await listBlobResumes(profileId);
  const next = [resume, ...existing.filter((r) => r.id !== resume.id)].map((r) =>
    r.id === resume.id ? resume : { ...r, is_primary: false }
  );
  await blobPutJson(resumesPath(profileId), next);
  return resume;
}

export async function getBlobResume(profileId: string, resumeId: string): Promise<Resume | null> {
  const existing = await listBlobResumes(profileId);
  return existing.find((r) => r.id === resumeId) ?? null;
}

export function createResumeRecord(input: {
  profileId: string;
  title: string;
  originalFilename: string;
  fileType: "pdf" | "docx" | "txt";
  rawText: string;
  atsScore: number;
  analysis: Resume["analysis"];
  fileUrl?: string | null;
}): Resume {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    user_id: input.profileId,
    title: input.title,
    original_filename: input.originalFilename,
    file_url: input.fileUrl ?? null,
    file_type: input.fileType,
    raw_text: input.rawText,
    ats_score: input.atsScore,
    analysis: input.analysis,
    is_primary: true,
    created_at: now,
    updated_at: now,
  };
}
