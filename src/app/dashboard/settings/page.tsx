import { getOrCreateProfile } from "@/lib/clerk/auth";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { SettingsContent } from "@/components/features/settings/settings-content";

export default async function SettingsPage() {
  const profile = await getOrCreateProfile();

  return (
    <>
      <DashboardHeader title="Settings" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-8">
          <SettingsContent
            email={profile.email}
            fullName={profile.full_name ?? ""}
            tier={profile.subscription_tier}
            desiredRole={profile.desired_role ?? ""}
            preferredCountry={profile.preferred_country ?? ""}
            yearsExperience={profile.years_experience}
          />
        </div>
      </main>
    </>
  );
}
