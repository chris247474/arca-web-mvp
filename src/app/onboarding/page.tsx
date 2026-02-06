"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { updateUserRole, UserRole } from "@/lib/actions/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, refreshProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Redirect if user already has a role
  useEffect(() => {
    if (!isLoading && user?.role) {
      router.push("/dashboard");
    }
  }, [isLoading, user?.role, router]);

  const handleRoleSelection = async (role: UserRole) => {
    if (!user?.privyId) {
      setError("Unable to update role. Please try logging in again.");
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const updatedProfile = await updateUserRole(user.privyId, role);

      if (!updatedProfile) {
        setError("Failed to update role. Please try again.");
        return;
      }

      // Refresh the profile in the auth context
      await refreshProfile();

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to update role:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if user already has role (will redirect)
  if (user?.role) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome to ArCa
          </h1>
          <p className="text-muted-foreground">
            Choose your role to get started. You can change this later in your
            profile settings.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Curator Card */}
          <Card
            className={`cursor-pointer transition-all hover:border-primary hover:shadow-lg ${
              isUpdating ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={() => !isUpdating && handleRoleSelection("curator")}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-8 h-8 text-primary"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <CardTitle className="text-xl">I'm a Curator</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-sm">
                Create and manage investment groups. Conduct due diligence,
                share research, and lead investment decisions for your
                community.
              </CardDescription>
              <Button
                className="mt-6 w-full"
                variant="outline"
                disabled={isUpdating}
              >
                {isUpdating ? "Setting up..." : "Continue as Curator"}
              </Button>
            </CardContent>
          </Card>

          {/* Investor Card */}
          <Card
            className={`cursor-pointer transition-all hover:border-primary hover:shadow-lg ${
              isUpdating ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={() => !isUpdating && handleRoleSelection("investor")}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-8 h-8 text-primary"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <CardTitle className="text-xl">I'm an Investor</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-sm">
                Join investment groups and participate in collaborative due
                diligence. Access curated research and make informed investment
                decisions.
              </CardDescription>
              <Button
                className="mt-6 w-full"
                variant="outline"
                disabled={isUpdating}
              >
                {isUpdating ? "Setting up..." : "Continue as Investor"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
