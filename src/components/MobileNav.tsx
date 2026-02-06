"use client";

import { Home, Users, Upload, User } from "lucide-react";

type View = "dashboard" | "groups" | "upload" | "profile";

interface MobileNavProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

const navItems: { view: View; icon: typeof Home; label: string }[] = [
  { view: "dashboard", icon: Home, label: "Home" },
  { view: "groups", icon: Users, label: "Groups" },
  { view: "upload", icon: Upload, label: "Upload" },
  { view: "profile", icon: User, label: "Profile" },
];

export function MobileNav({ activeView, onNavigate }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden safe-area-inset-bottom">
      <div className="flex h-16 items-center justify-around px-4">
        {navItems.map(({ view, icon: Icon, label }) => {
          const isActive = activeView === view;
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={`flex flex-col items-center gap-1 min-w-[64px] py-2 px-3 rounded-md transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid={`nav-${view}`}
            >
              <Icon className="h-5 w-5" />
              {isActive && (
                <span className="text-xs font-medium">{label}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
