"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { removeMember } from "@/lib/actions/memberships";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  name: string;
  email: string;
  initials?: string;
  role: "curator" | "member" | "owner" | "contributor" | "viewer";
  isCurrentUser?: boolean;
  userId?: string;
  groupId?: string;
}

interface MembersListProps {
  members: Member[];
  canManage?: boolean;
  onRemoveMember?: (id: string) => void;
  onMemberRemoved?: () => void;
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

function getRoleBadgeVariant(role: Member["role"]) {
  switch (role) {
    case "curator":
    case "owner":
      return "default" as const;
    default:
      return "outline" as const;
  }
}

function getRoleLabel(role: Member["role"]) {
  switch (role) {
    case "curator":
      return "Curator";
    case "owner":
      return "Owner";
    case "member":
      return "Member";
    case "contributor":
      return "Contributor";
    case "viewer":
      return "Viewer";
    default:
      return role;
  }
}

export function MembersList({
  members,
  canManage = false,
  onRemoveMember,
  onMemberRemoved,
}: MembersListProps) {
  const { toast } = useToast();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemoveMember = async (member: Member) => {
    // Use the server action if userId and groupId are available
    if (member.userId && member.groupId) {
      setRemovingId(member.id);
      try {
        const success = await removeMember(member.userId, member.groupId);
        if (success) {
          toast({
            title: "Member Removed",
            description: `${member.name || member.email} has been removed from the group.`,
          });
          onMemberRemoved?.();
        } else {
          toast({
            title: "Error",
            description: "Failed to remove member. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error removing member:", error);
        toast({
          title: "Error",
          description: "An error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setRemovingId(null);
      }
    } else {
      // Fall back to the callback for legacy/mock usage
      onRemoveMember?.(member.id);
    }
  };

  const isCuratorRole = (role: Member["role"]) => role === "curator" || role === "owner";

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const initials = member.initials || getInitials(member.name, member.email);
        const isRemoving = removingId === member.id;

        return (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-md bg-muted/50"
            data-testid={`member-${member.id}`}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium truncate">{member.name}</p>
                {member.isCurrentUser && (
                  <Badge variant="secondary" className="text-xs">
                    You
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {member.email}
              </p>
            </div>
            <Badge
              variant={getRoleBadgeVariant(member.role)}
              className="capitalize shrink-0"
            >
              {getRoleLabel(member.role)}
            </Badge>
            {canManage && !isCuratorRole(member.role) && !member.isCurrentUser && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={isRemoving}
                    data-testid={`button-remove-member-${member.id}`}
                  >
                    {isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Member</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove {member.name || member.email}{" "}
                      from this group? They will need to reapply to rejoin.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleRemoveMember(member)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        );
      })}
    </div>
  );
}
