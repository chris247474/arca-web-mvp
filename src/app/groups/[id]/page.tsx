"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import GroupDetail from "@/components/pages/GroupDetail";
import { MobileNav } from "@/components/MobileNav";
import { getGroupById } from "@/lib/actions/groups";
import { getGroupWithMembers } from "@/lib/queries/groups";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import type { GroupWithCurator } from "@/lib/actions/groups";

interface GroupData {
  group: GroupWithCurator;
  memberCount: number;
  members: Array<{
    id: string;
    userId: string;
    name: string | null;
    email: string | null;
    role: "curator" | "member";
    joinedAt: Date;
  }>;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-14 items-center gap-4">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </main>
    </div>
  );
}

function NotFoundPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-semibold text-foreground">Group Not Found</h1>
        <p className="text-muted-foreground">
          The group you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupData = useCallback(async () => {
    if (!groupId) {
      setError("Group ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch group with members
      const [groupResult, membersResult] = await Promise.all([
        getGroupById(groupId),
        getGroupWithMembers(groupId),
      ]);

      if (!groupResult.success || !groupResult.group) {
        setError(groupResult.error || "Group not found");
        setIsLoading(false);
        return;
      }

      setGroupData({
        group: groupResult.group,
        memberCount: groupResult.memberCount || 0,
        members: membersResult.success ? (membersResult.members || []) : [],
      });
    } catch (err) {
      console.error("Error fetching group:", err);
      setError("Failed to load group");
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const handleBack = () => router.push("/");

  if (isLoading) {
    return (
      <>
        <LoadingSkeleton />
        <MobileNav
          activeView="groups"
          onNavigate={(view) => {
            if (view === "dashboard") router.push("/");
            if (view === "profile") router.push("/profile");
          }}
        />
      </>
    );
  }

  if (error || !groupData) {
    return (
      <>
        <NotFoundPage onBack={handleBack} />
        <MobileNav
          activeView="groups"
          onNavigate={(view) => {
            if (view === "dashboard") router.push("/");
            if (view === "profile") router.push("/profile");
          }}
        />
      </>
    );
  }

  return (
    <>
      <GroupDetail
        groupId={groupId}
        groupData={groupData}
        onBack={handleBack}
      />
      <MobileNav
        activeView="groups"
        onNavigate={(view) => {
          if (view === "dashboard") router.push("/");
          if (view === "profile") router.push("/profile");
        }}
      />
    </>
  );
}
