"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Member {
  id: string;
  name: string;
  initials: string;
}

interface AvatarStackProps {
  members: Member[];
  maxVisible?: number;
}

export function AvatarStack({ members, maxVisible = 5 }: AvatarStackProps) {
  const visible = members.slice(0, maxVisible);
  const remaining = members.length - maxVisible;

  return (
    <div className="flex items-center -space-x-2" data-testid="avatar-stack">
      {visible.map((member) => (
        <Avatar
          key={member.id}
          className="h-8 w-8 border-2 border-background"
        >
          <AvatarFallback className="text-xs bg-muted">
            {member.initials}
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
          +{remaining}
        </div>
      )}
    </div>
  );
}
