"use client";

import { useState } from "react";
import { Check, X, ExternalLink, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { approveApplication, rejectApplication } from "@/lib/actions/applications";
import { useToast } from "@/hooks/use-toast";

interface ApplicationCardProps {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  linkedinUrl: string | null;
  interestStatement: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  onStatusChange?: () => void;
}

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "??";
}

function getStatusBadgeVariant(status: "pending" | "approved" | "rejected") {
  switch (status) {
    case "pending":
      return "secondary";
    case "approved":
      return "default";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
}

export function ApplicationCard({
  id,
  user,
  linkedinUrl,
  interestStatement,
  status,
  createdAt,
  onStatusChange,
}: ApplicationCardProps) {
  const { toast } = useToast();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const result = await approveApplication(id);
      if (result) {
        setCurrentStatus("approved");
        toast({
          title: "Application Approved",
          description: `${user?.name || user?.email || "User"} has been added as a member.`,
        });
        onStatusChange?.();
      } else {
        toast({
          title: "Error",
          description: "Failed to approve application. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error approving application:", error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      const result = await rejectApplication(id);
      if (result) {
        setCurrentStatus("rejected");
        toast({
          title: "Application Rejected",
          description: "The application has been rejected.",
        });
        onStatusChange?.();
      } else {
        toast({
          title: "Error",
          description: "Failed to reject application. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const isPending = currentStatus === "pending";

  return (
    <Card className="overflow-hidden" data-testid={`application-card-${id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {getInitials(user?.name ?? null, user?.email ?? null)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-semibold text-foreground truncate">
                {user?.name || "Unknown User"}
              </h4>
              <Badge variant={getStatusBadgeVariant(currentStatus)} className="capitalize">
                {currentStatus}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground truncate mb-2">
              {user?.email || "No email provided"}
            </p>

            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-3"
                data-testid="linkedin-link"
              >
                <ExternalLink className="h-3 w-3" />
                LinkedIn Profile
              </a>
            )}

            {interestStatement && (
              <div className="mt-3 p-3 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Interest Statement
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {interestStatement}
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-3">
              Applied {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>

      {isPending && (
        <CardFooter className="p-4 pt-0 flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-destructive hover:text-destructive"
                disabled={isApproving || isRejecting}
                data-testid="button-reject"
              >
                {isRejecting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-1" />
                )}
                Reject
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Application</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to reject this application from{" "}
                  {user?.name || user?.email || "this user"}? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReject}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Reject
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            size="sm"
            className="flex-1"
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            data-testid="button-approve"
          >
            {isApproving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-1" />
            )}
            Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
