import { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "My Profile | Sai Nandhini",
  description: "Manage your account and profile settings.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
