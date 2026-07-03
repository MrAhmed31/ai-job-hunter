import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getDashboardStats } from "@/lib/services/dashboard";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { DashboardContent } from "@/components/features/dashboard/dashboard-content";
import { DashboardError } from "@/components/layout/dashboard-error";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  try {
    const profile = await getOrCreateProfile();
    const stats = await getDashboardStats(profile.id);

    return (
      <>
        <DashboardHeader title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-6">
          <DashboardContent
            userName={user.firstName ?? "there"}
            stats={stats}
            tier={profile.subscription_tier}
          />
        </main>
      </>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <DashboardError
        title="Dashboard couldn't load"
        message={`${message}. Confirm Supabase schema is applied and service role key is set on Vercel.`}
      />
    );
  }
}
