"use client";

import { useState, useTransition } from "react";
import { Loader2, Mail, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateCoverLetterAction } from "@/actions/features";
import type { CoverLetter, CoverLetterTone } from "@/types/database";

interface Props {
  letters: CoverLetter[];
}

export function CoverLetterPage({ letters }: Props) {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [tone, setTone] = useState<CoverLetterTone>("professional");
  const [version, setVersion] = useState<"short" | "long">("long");
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    if (!jobTitle || !companyName) return;
    startTransition(async () => {
      const result = await generateCoverLetterAction({ jobTitle, companyName, jobDescription, companyUrl, tone, version });
      if (result.success && result.data) {
        setGenerated(result.data.content);
        toast.success("Cover letter generated!");
      } else {
        toast.error(result.error);
      }
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <>
      <DashboardHeader title="Cover Letter Generator" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h2 className="text-2xl font-bold">AI Cover Letter Generator</h2>
            <p className="text-muted-foreground">Generate personalized cover letters tailored to each role.</p>
          </div>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Job Title</Label>
                  <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Software Engineer" className="mt-1" />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Corp" className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Company Website (optional)</Label>
                <Input value={companyUrl} onChange={(e) => setCompanyUrl(e.target.value)} placeholder="https://company.com" className="mt-1" />
              </div>
              <div>
                <Label>Job Description (optional)</Label>
                <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste job description..." className="mt-1" rows={4} />
              </div>
              <div className="flex flex-wrap gap-4">
                <div>
                  <Label>Tone</Label>
                  <div className="mt-2 flex gap-2">
                    {(["professional", "friendly", "executive", "student"] as const).map((t) => (
                      <Button key={t} variant={tone === t ? "default" : "outline"} size="sm" onClick={() => setTone(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Length</Label>
                  <div className="mt-2 flex gap-2">
                    {(["short", "long"] as const).map((v) => (
                      <Button key={v} variant={version === v ? "default" : "outline"} size="sm" onClick={() => setVersion(v)}>
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="gradient" disabled={isPending} onClick={handleGenerate}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Generate Cover Letter
              </Button>
            </CardContent>
          </Card>

          {generated && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Generated Cover Letter</CardTitle>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{generated}</div>
              </CardContent>
            </Card>
          )}

          {letters.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Previous Cover Letters</h3>
              {letters.slice(0, 5).map((letter) => (
                <Card key={letter.id}>
                  <CardContent className="flex items-center justify-between pt-6">
                    <div>
                      <p className="font-medium">{letter.title}</p>
                      <p className="text-xs text-muted-foreground">{letter.tone} · {letter.version}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setGenerated(letter.content)}>View</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
