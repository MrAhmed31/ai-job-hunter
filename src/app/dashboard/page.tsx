import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getDashboardStats } from "@/lib/services/dashboard";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { DashboardContent } from "@/components/features/dashboard/dashboard-content";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

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
}
