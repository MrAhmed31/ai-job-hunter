"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SubscriptionTier } from "@/types/database";

interface Props {
  email: string;
  fullName: string;
  tier: SubscriptionTier;
  desiredRole: string;
  preferredCountry: string;
  yearsExperience: number | null;
}

export function SettingsContent({ email, fullName, tier, desiredRole, preferredCountry, yearsExperience }: Props) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium">{fullName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Plan</span>
            <Badge variant={tier === "pro" ? "default" : "secondary"}>{tier === "pro" ? "Pro" : "Free"}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Career Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Desired Role</span>
            <span className="text-sm font-medium">{desiredRole || "Not set"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Country</span>
            <span className="text-sm font-medium">{preferredCountry || "Not set"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Experience</span>
            <span className="text-sm font-medium">{yearsExperience !== null ? `${yearsExperience} years` : "Not set"}</span>
          </div>
        </CardContent>
      </Card>

      {tier === "free" && (
        <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5">
          <CardHeader>
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>Unlimited resume reviews, job matches, cover letters, and interview coaching.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="gradient">Upgrade — $19/month</Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
