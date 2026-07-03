"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { uploadResumeAction } from "@/actions/resume";
import { cn, scoreBg, formatDate } from "@/lib/utils";
import type { Resume } from "@/types/database";

interface Props {
  resumes: Resume[];
}

export function ResumeOptimizerPage({ resumes }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadResumeAction(formData);
      if (result.success && result.data) {
        toast.success("Resume analyzed successfully!");
        router.push(`/dashboard/resume/${result.data.resumeId}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <>
      <DashboardHeader title="Resume Optimizer" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <div>
            <h2 className="text-2xl font-bold">Optimize Your Resume</h2>
            <p className="text-muted-foreground">Upload your resume for ATS analysis, scoring, and AI-powered improvements.</p>
          </div>

          <Card
            className={cn(
              "border-2 border-dashed transition-colors",
              dragActive ? "border-violet-500 bg-violet-500/5" : "border-border"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
          >
            <CardContent className="flex flex-col items-center justify-center py-12">
              {isPending ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Loader2 className="h-12 w-12 text-violet-500" />
                </motion.div>
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground" />
              )}
              <h3 className="mt-4 text-lg font-semibold">
                {isPending ? "Analyzing your resume..." : "Drop your resume here"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">PDF, DOCX, or TXT — up to 10MB</p>
              <label className="mt-6">
                <Button variant="gradient" disabled={isPending} asChild>
                  <span>
                    <FileText className="mr-2 h-4 w-4" />
                    Choose File
                  </span>
                </Button>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  disabled={isPending}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                />
              </label>
            </CardContent>
          </Card>

          {resumes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Resumes</h3>
              <div className="grid gap-4">
                {resumes.map((resume) => (
                  <Card
                    key={resume.id}
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => router.push(`/dashboard/resume/${resume.id}`)}
                  >
                    <CardContent className="flex items-center justify-between pt-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                          <FileText className="h-5 w-5 text-violet-500" />
                        </div>
                        <div>
                          <p className="font-medium">{resume.title}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(resume.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {resume.ats_score !== null && (
                          <Badge className={scoreBg(resume.ats_score)}>{resume.ats_score}/100</Badge>
                        )}
                        {resume.is_primary && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
