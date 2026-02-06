"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarStack } from "@/components/AvatarStack";
import { ApplyToGroupModal } from "@/components/ApplyToGroupModal";
import { useAuth } from "@/hooks/use-auth";
import { getGroupByInviteCode } from "@/lib/actions/groups";
import { getMembership } from "@/lib/actions/memberships";
import { getUserApplication } from "@/lib/actions/applications";

interface GroupData {
  id: string;
  name: string;
  description: string | null;
  sector: string | null;
  curatorName: string | null;
  memberCount: number;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, login } = useAuth();
  const inviteCode = params.code as string;

  const [group, setGroup] = useState<GroupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [hasApplication, setHasApplication] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    async function loadGroup() {
      if (!inviteCode) {
        setError("Invalid invite link");
        setIsLoading(false);
        return;
      }

      try {
        const result = await getGroupByInviteCode(inviteCode);

        if (!result.success || !result.group) {
          setError(result.error || "Invalid invite code");
          setIsLoading(false);
          return;
        }

        setGroup({
          id: result.group.id,
          name: result.group.name,
          description: result.group.description,
          sector: result.group.sector,
          curatorName: result.group.curator?.name || null,
          memberCount: result.memberCount || 0,
        });

        // Check if user is already a member or has an application
        if (user?.id && result.group.id) {
          const membership = await getMembership(user.id, result.group.id);
          if (membership) {
            setIsMember(true);
          } else {
            const application = await getUserApplication(user.id, result.group.id);
            if (application) {
              setHasApplication(true);
              setApplicationStatus(application.status);
            }
          }
        }
      } catch (err) {
        console.error("Error loading group:", err);
        setError("Failed to load group information");
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      loadGroup();
    }
  }, [inviteCode, user?.id, authLoading]);

  // Handle loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Invalid Invite Link</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle member state - redirect to group page
  if (isMember && group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>You&apos;re already a member!</CardTitle>
            <CardDescription>
              You are already a member of {group.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push(`/groups/${group.id}`)}>
              Go to Group
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle application pending state
  if (hasApplication && group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Application {applicationStatus === "pending" ? "Pending" : applicationStatus === "approved" ? "Approved" : "Rejected"}</CardTitle>
            <CardDescription>
              {applicationStatus === "pending"
                ? `Your application to join ${group.name} is being reviewed.`
                : applicationStatus === "approved"
                ? `Your application has been approved! You can now access ${group.name}.`
                : `Your application to join ${group.name} was not accepted.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-3">
            <Button onClick={() => router.push("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            {applicationStatus === "approved" && (
              <Button onClick={() => router.push(`/groups/${group.id}`)}>
                Go to Group
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Display group info and apply button
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{group?.name}</CardTitle>
          <CardDescription>
            {group?.description || "Join this investment group"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {group?.memberCount} members
            </span>
            {group?.sector && (
              <Badge variant="secondary">{group.sector}</Badge>
            )}
          </div>

          {group?.curatorName && (
            <p className="text-center text-sm text-muted-foreground">
              Curated by <span className="font-medium">{group.curatorName}</span>
            </p>
          )}

          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <Button
                className="w-full"
                onClick={() => setApplyModalOpen(true)}
                data-testid="button-apply-to-join"
              >
                Apply to Join
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={login}
                data-testid="button-login-to-apply"
              >
                Sign In to Apply
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {group && (
        <ApplyToGroupModal
          open={applyModalOpen}
          onOpenChange={setApplyModalOpen}
          groupId={group.id}
          groupName={group.name}
          curatorName={group.curatorName || "the curator"}
          onSuccess={() => {
            setHasApplication(true);
            setApplicationStatus("pending");
          }}
        />
      )}
    </div>
  );
}
