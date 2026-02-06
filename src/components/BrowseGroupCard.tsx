"use client";

import { useState } from "react";
import { FileText, Users, UserPlus, Eye } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApplyToGroupModal } from "./ApplyToGroupModal";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  name: string;
  initials: string;
}

interface BrowseGroupCardProps {
  id: string;
  name: string;
  description: string;
  curator: string;
  memberCount: number;
  documentCount: number;
  lastActivity: string;
  members: Member[];
  isMember?: boolean;
  onClick?: () => void;
}

export function BrowseGroupCard({
  id,
  name,
  description,
  curator,
  memberCount,
  documentCount,
  members,
  isMember = false,
  onClick,
}: BrowseGroupCardProps) {
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const displayMembers = members.slice(0, 3);
  const remainingCount = memberCount - displayMembers.length;

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to apply to join this group.",
      });
      login();
      return;
    }
    setApplyModalOpen(true);
  };

  return (
    <>
      <Card
        className="hover-elevate active-elevate-2 transition-all cursor-pointer"
        onClick={onClick}
        data-testid={`card-browse-group-${id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate text-foreground" data-testid={`text-group-name-${id}`}>
                {name}
              </h3>
              <Badge variant="secondary" className="mt-1">
                Curated by {curator}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {description}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {memberCount}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {documentCount}
              </span>
            </div>
            <div className="flex -space-x-2">
              {displayMembers.map((member) => (
                <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                </Avatar>
              ))}
              {remainingCount > 0 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+{remainingCount}</span>
                </div>
              )}
            </div>
          </div>
          {isMember ? (
            <Button
              className="w-full mt-4"
              variant="default"
              onClick={onClick}
              data-testid={`button-view-${id}`}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Group
            </Button>
          ) : (
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={handleApply}
              data-testid={`button-apply-${id}`}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Apply to Join
            </Button>
          )}
        </CardContent>
      </Card>

      <ApplyToGroupModal
        open={applyModalOpen}
        onOpenChange={setApplyModalOpen}
        groupId={id}
        groupName={name}
        curatorName={curator}
      />
    </>
  );
}
