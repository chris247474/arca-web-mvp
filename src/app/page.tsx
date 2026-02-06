"use client";

import { useRouter } from "next/navigation";
import Dashboard from "@/components/pages/Dashboard";
import { MobileNav } from "@/components/MobileNav";

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <Dashboard
        onSelectGroup={(groupId) => router.push(`/groups/${groupId}`)}
        onNavigateToProfile={() => router.push("/profile")}
      />
      <MobileNav
        activeView="dashboard"
        onNavigate={(view) => {
          if (view === "profile") router.push("/profile");
        }}
      />
    </>
  );
}
