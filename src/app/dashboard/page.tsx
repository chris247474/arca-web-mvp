"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, hasRole, logout } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Redirect to onboarding if no role
  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRole) {
      router.push("/onboarding");
    }
  }, [isLoading, isAuthenticated, hasRole, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated or no role (will redirect)
  if (!isAuthenticated || !hasRole) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.email || "User"}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
          >
            Sign Out
          </button>
        </div>

        <div className="grid gap-6">
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-lg font-semibold mb-2">Your Role</h2>
            <p className="text-muted-foreground capitalize">
              {user?.role || "Not set"}
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-lg font-semibold mb-2">Account Details</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Email:</dt>
                <dd>{user?.email || "Not set"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Member since:</dt>
                <dd>
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Unknown"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
