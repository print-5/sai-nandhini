import { getSettingsData, getShippingRatesData } from "@/lib/admin-data";
import SettingsClient from "./SettingsClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "admin") {
    redirect("/admin/login");
  }

  const [settings, rates] = await Promise.all([
    getSettingsData(),
    getShippingRatesData(),
  ]);

  return <SettingsClient initialSettings={settings} initialRates={rates} />;
}
