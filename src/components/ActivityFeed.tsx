"use client";

import { FileText, UserPlus, Upload } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type ActivityType = "upload" | "join" | "view";

interface Activity {
  id: string;
  type: ActivityType;
  userName: string;
  userInitials: string;
  description: string;
  timestamp: string;
  date: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const activityIcons: Record<ActivityType, typeof FileText> = {
  upload: Upload,
  join: UserPlus,
  view: FileText,
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const groupedByDate = activities.reduce((acc, activity) => {
    if (!acc[activity.date]) {
      acc[activity.date] = [];
    }
    acc[activity.date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedByDate).map(([date, items]) => (
        <div key={date}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
            {date}
          </p>
          <div className="space-y-2">
            {items.map((activity) => {
              const Icon = activityIcons[activity.type];
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3"
                  data-testid={`activity-${activity.id}`}
                >
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarFallback className="text-xs">{activity.userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.userName}</span>{" "}
                      <span className="text-muted-foreground">{activity.description}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                  <div className="h-6 w-6 flex items-center justify-center text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
