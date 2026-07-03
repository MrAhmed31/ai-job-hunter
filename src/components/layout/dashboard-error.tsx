import Link from "next/link";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardError({
  title = "Something went wrong",
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <>
      <DashboardHeader title="Error" />
      <main className="flex flex-1 items-center justify-center p-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{message}</p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/resume">Try Resume again</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
