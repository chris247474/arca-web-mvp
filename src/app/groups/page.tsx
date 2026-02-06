"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrowseGroupCard } from "@/components/BrowseGroupCard";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/use-auth";
import { searchGroups } from "@/lib/queries/groups";
import { getUserGroups } from "@/lib/actions/groups";
import type { GroupWithCurator } from "@/lib/actions/groups";

const SECTORS = [
  "All Sectors",
  "Technology",
  "Finance",
  "Healthcare",
  "Real Estate",
  "Energy",
  "Consumer",
  "Manufacturing",
  "Other",
];

// Helper function to transform group data for display
function transformGroupForDisplay(group: GroupWithCurator) {
  const curatorName = group.curator?.name || "Unknown Curator";
  const memberCount = group.memberships?.length || 1;

  // Generate initials from member names
  const members = group.memberships?.slice(0, 6).map((m, i) => {
    const userName = (m as { user?: { name?: string } }).user?.name || `Member ${i + 1}`;
    const initials = userName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    return {
      id: m.id,
      name: userName,
      initials,
    };
  }) || [];

  return {
    id: group.id,
    name: group.name,
    description: group.description || "",
    curator: curatorName,
    memberCount,
    documentCount: 0, // TODO: Fetch real document count
    lastActivity: "Recently",
    members,
    sector: group.sector,
  };
}

export default function GroupsBrowsePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All Sectors");
  const [groups, setGroups] = useState<GroupWithCurator[]>([]);
  const [userGroupIds, setUserGroupIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch public groups
  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    const sectorFilter = selectedSector !== "All Sectors" ? selectedSector : undefined;
    const result = await searchGroups(searchQuery || undefined, sectorFilter);

    if (result.success && result.groups) {
      setGroups(result.groups as GroupWithCurator[]);
    }
    setIsLoading(false);
  }, [searchQuery, selectedSector]);

  // Fetch user's group memberships to check if they're a member
  const fetchUserGroups = useCallback(async () => {
    if (!user?.id) {
      setUserGroupIds(new Set());
      return;
    }
    const result = await getUserGroups(user.id);
    if (result.success && result.groups) {
      setUserGroupIds(new Set(result.groups.map(g => g.id)));
    }
  }, [user?.id]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGroups();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchGroups]);

  // Fetch user groups when auth changes
  useEffect(() => {
    fetchUserGroups();
  }, [fetchUserGroups]);

  const displayGroups = groups.map(transformGroupForDisplay);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">Browse Groups</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-4">
            Discover investment groups curated by experienced investors and apply to join
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-groups"
              />
            </div>

            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-sector-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : displayGroups.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No groups found"
            description={
              searchQuery || selectedSector !== "All Sectors"
                ? "Try adjusting your search or filter criteria"
                : "Be the first to create a public group!"
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayGroups.map((group) => (
              <BrowseGroupCard
                key={group.id}
                {...group}
                isMember={userGroupIds.has(group.id)}
                onClick={() => router.push(`/groups/${group.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <MobileNav
        activeView="groups"
        onNavigate={(view) => {
          if (view === "dashboard") router.push("/");
          if (view === "profile") router.push("/profile");
        }}
      />
    </div>
  );
}
