import { Suspense } from "react";
import { getAnalyticsData } from "@/lib/admin-data";
import { AnalyticsClientLazy } from "@/components/LazyComponents";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

// Server Component for analytics data
async function AnalyticsData() {
  const data = await getAnalyticsData();
  return <AnalyticsClientLazy initialData={JSON.parse(JSON.stringify(data))} />;
}

export default async function AdminAnalyticsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <Suspense fallback={<LoadingSpinner section="dashboard" />}>
      <AnalyticsData />
    </Suspense>
  );
}
