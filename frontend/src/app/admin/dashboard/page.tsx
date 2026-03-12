import { Suspense } from "react";
import { getDashboardStats } from "@/lib/admin-data";
import DashboardClient from "./DashboardClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

// Server Component for dashboard data
async function DashboardData({ range }: { range: string }) {
  const data = await getDashboardStats(range);
  return <DashboardClient initialData={data} />;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "admin") {
    redirect("/admin/login");
  }

  const range = searchParams.range || "week";

  return (
    <Suspense fallback={<LoadingSpinner section="dashboard" />}>
      <DashboardData range={range} />
    </Suspense>
  );
}
