"use client";

import { FileText, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarStack } from "./AvatarStack";

interface Member {
  id: string;
  name: string;
  initials: string;
}

interface GroupCardProps {
  id: string;
  name: string;
  description: string;
  curator?: string;
  memberCount: number;
  documentCount: number;
  lastActivity: string;
  members: Member[];
  onClick?: () => void;
}

export function GroupCard({
  name,
  description,
  curator,
  memberCount,
  documentCount,
  lastActivity,
  members,
  onClick,
}: GroupCardProps) {
  return (
    <Card
      className="cursor-pointer hover-elevate active-elevate-2 transition-all"
      onClick={onClick}
      data-testid={`card-group-${name.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold truncate text-foreground">{name}</h3>
          {curator && (
            <Badge variant="secondary" className="mt-1">
              Curated by {curator}
            </Badge>
          )}
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {description}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AvatarStack members={members} maxVisible={4} />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {memberCount}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {documentCount}
            </span>
          </div>
          <span>{lastActivity}</span>
        </div>
      </CardContent>
    </Card>
  );
}
