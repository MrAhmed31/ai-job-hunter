export type SubscriptionTier = "free" | "pro";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";
export type ResumeVersionType = "original" | "ats" | "modern" | "executive" | "student" | "internship";
export type CoverLetterTone = "professional" | "friendly" | "executive" | "student";
export type ApplicationStatus = "saved" | "applied" | "interviewing" | "offered" | "rejected" | "withdrawn";
export type EmbeddingSource =
  | "resume"
  | "cover_letter"
  | "job_description"
  | "company_info"
  | "career_guide"
  | "interview_guide"
  | "linkedin"
  | "portfolio"
  | "chat";

export interface Profile {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  desired_role: string | null;
  preferred_country: string | null;
  salary_min: number | null;
  salary_max: number | null;
  years_experience: number | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  original_filename: string | null;
  file_url: string | null;
  file_type: "pdf" | "docx" | "txt" | null;
  raw_text: string | null;
  ats_score: number | null;
  analysis: ResumeAnalysis | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResumeAnalysis {
  atsScore: number;
  formatting: { score: number; issues: string[]; suggestions: string[] };
  grammar: { score: number; issues: string[] };
  keywords: { found: string[]; missing: string[]; score: number };
  achievements: { score: number; weakBullets: string[]; suggestions: string[] };
  missingSkills: string[];
  actionVerbs: { score: number; weakVerbs: string[]; suggestions: string[] };
  readability: { score: number; gradeLevel: string; suggestions: string[] };
  recruiterView: string;
  hiringManagerView: string;
  overallSuggestions: string[];
}

export interface ResumeVersion {
  id: string;
  resume_id: string;
  user_id: string;
  version_type: ResumeVersionType;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface LinkedInReview {
  id: string;
  user_id: string;
  linkedin_url: string;
  scraped_data: Record<string, unknown> | null;
  overall_score: number | null;
  analysis: LinkedInAnalysis | null;
  suggestions: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface LinkedInAnalysis {
  headlineStrength: { score: number; feedback: string };
  seo: { score: number; keywords: string[]; suggestions: string[] };
  keywordOptimization: { score: number; missing: string[] };
  recruiterAppeal: { score: number; feedback: string };
  profileCompleteness: { score: number; missing: string[] };
  overallScore: number;
  betterHeadline: string;
  betterAbout: string;
  experienceRewrite: string;
  skillsSuggestions: string[];
  connectionStrategy: string[];
  networkingTips: string[];
}

export interface PortfolioReview {
  id: string;
  user_id: string;
  portfolio_url: string;
  portfolio_type: "github" | "website" | "behance" | "dribbble" | "other";
  scraped_data: Record<string, unknown> | null;
  overall_score: number | null;
  analysis: PortfolioAnalysis | null;
  suggestions: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioAnalysis {
  projects: { score: number; feedback: string };
  codeQuality: { score: number; feedback: string };
  descriptions: { score: number; feedback: string };
  readme: { score: number; feedback: string };
  ui: { score: number; feedback: string };
  ux: { score: number; feedback: string };
  performance: { score: number; feedback: string };
  seo: { score: number; feedback: string };
  accessibility: { score: number; feedback: string };
  deployment: { score: number; feedback: string };
  overallScore: number;
  suggestions: string[];
}

export interface Job {
  id: string;
  external_id: string | null;
  source: string;
  title: string;
  company: string;
  company_url: string | null;
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  remote: boolean;
  description: string | null;
  requirements: string[] | null;
  benefits: string[] | null;
  url: string;
  scraped_at: string;
  created_at: string;
}

export interface JobMatch {
  id: string;
  user_id: string;
  job_id: string;
  resume_id: string | null;
  match_score: number | null;
  missing_skills: string[] | null;
  learning_path: string[] | null;
  likelihood: string | null;
  why_match: string | null;
  apply_tips: string[] | null;
  created_at: string;
  job?: Job;
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  is_favorite: boolean;
  notes: string | null;
  created_at: string;
  job?: Job;
}

export interface Application {
  id: string;
  user_id: string;
  job_id: string | null;
  resume_id: string | null;
  cover_letter_id: string | null;
  status: ApplicationStatus;
  applied_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  job?: Job;
}

export interface CoverLetter {
  id: string;
  user_id: string;
  job_id: string | null;
  resume_id: string | null;
  title: string;
  content: string;
  tone: CoverLetterTone;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  job_id: string | null;
  resume_id: string | null;
  title: string;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  evaluation: InterviewEvaluation | null;
  confidence_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewQuestion {
  id: string;
  type: "technical" | "behavioral" | "hr" | "company" | "coding" | "system_design";
  question: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface InterviewAnswer {
  questionId: string;
  starAnswer: string;
  bestAnswer: string;
  redFlags: string[];
  followUpQuestions: string[];
}

export interface InterviewEvaluation {
  confidenceScore: number;
  communicationTips: string[];
  strengths: string[];
  weaknesses: string[];
  overallFeedback: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  feature: string;
  tokens_used: number;
  created_at: string;
}
