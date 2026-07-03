"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Send,
  FileText,
  Mic,
  Network,
  Globe,
  Bookmark,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, scoreBg } from "@/lib/utils";
import type { DashboardStats } from "@/types/index";
import type { SubscriptionTier } from "@/types/database";

interface Props {
  userName: string;
  stats: DashboardStats;
  tier: SubscriptionTier;
}

function StatCard({
  title,
  value,
  icon: Icon,
  suffix,
  href,
}: {
  title: string;
  value: number | string | null;
  icon: React.ElementType;
  suffix?: string;
  href?: string;
}) {
  const content = (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
          <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">
            {value !== null ? value : "—"}
            {suffix && value !== null && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function DashboardContent({ userName, stats, tier }: Props) {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {userName} 👋</h2>
            <p className="text-muted-foreground">Here&apos;s your career progress at a glance.</p>
          </div>
          <Badge variant={tier === "pro" ? "default" : "secondary"}>
            {tier === "pro" ? "Pro Plan" : "Free Plan"}
          </Badge>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Applications Sent" value={stats.applicationsSent} icon={Send} href="/dashboard/jobs" />
        <StatCard title="Resume Score" value={stats.resumeScore} icon={FileText} suffix="/100" href="/dashboard/resume" />
        <StatCard title="Interview Ready" value={stats.interviewReadiness} icon={Mic} suffix="%" href="/dashboard/interview" />
        <StatCard title="LinkedIn Score" value={stats.linkedinScore} icon={Network} suffix="/100" href="/dashboard/linkedin" />
        <StatCard title="Portfolio Score" value={stats.portfolioScore} icon={Globe} suffix="/100" href="/dashboard/portfolio" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              AI Suggestions
            </CardTitle>
            <CardDescription>Personalized recommendations to boost your job search</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.aiSuggestions.map((suggestion, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-muted/50 p-3">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                <p className="text-sm">{suggestion}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Saved Jobs
            </CardTitle>
            <CardDescription>{stats.savedJobs} jobs saved</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.savedJobs === 0 ? (
              <p className="text-sm text-muted-foreground">No saved jobs yet. Start matching to find opportunities.</p>
            ) : (
              <p className="text-2xl font-bold">{stats.savedJobs}</p>
            )}
            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <Link href="/dashboard/jobs">
                Browse Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {stats.resumeScore !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Resume Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={stats.resumeScore} className="flex-1" />
              <span className={cn("text-lg font-bold", scoreBg(stats.resumeScore))}>{stats.resumeScore}/100</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/dashboard/resume", title: "Optimize Resume", desc: "Upload and improve your resume" },
          { href: "/dashboard/jobs", title: "Find Jobs", desc: "AI-powered job matching" },
          { href: "/dashboard/chat", title: "Ask AI", desc: "Career advice and guidance" },
        ].map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="h-full transition-all hover:border-violet-500/30 hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-base">{action.title}</CardTitle>
                <CardDescription>{action.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
