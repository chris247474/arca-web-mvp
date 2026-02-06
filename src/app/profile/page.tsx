"use client";

import { useRouter } from "next/navigation";
import ProfilePage from "@/components/pages/Profile";
import { MobileNav } from "@/components/MobileNav";

export default function ProfileRoute() {
  const router = useRouter();

  return (
    <>
      <ProfilePage onBack={() => router.push("/")} />
      <MobileNav
        activeView="profile"
        onNavigate={(view) => {
          if (view === "dashboard") router.push("/");
          if (view === "groups") router.push("/");
        }}
      />
    </>
  );
}
