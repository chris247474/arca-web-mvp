"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  UserPlus,
  Upload,
  FileText,
  Users,
  Activity,
  TrendingUp,
  FolderOpen,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarStack } from "@/components/AvatarStack";
import { DocumentRow } from "@/components/DocumentRow";
import { UploadZone } from "@/components/UploadZone";
import { InviteModal } from "@/components/InviteModal";
import { MembersList } from "@/components/MembersList";
import { ActivityFeed } from "@/components/ActivityFeed";
import { EmptyState } from "@/components/EmptyState";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TradingInterface, TradingChart } from "@/components/TradingInterface";
import { useAuth } from "@/hooks/use-auth";
import type { GroupWithCurator } from "@/lib/actions/groups";

// Types for group data from database
interface GroupDataFromDB {
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

// todo: remove mock functionality - lookup groups by ID
const defaultMockGroup = {
  id: "1",
  name: "Investment Group",
  description: "Curated investment opportunities",
  memberCount: 8,
  createdAt: "Nov 15, 2024",
  isOwner: true,
  ticker: "LDM",
  members: [
    { id: "1", name: "Alice Chen", initials: "AC" },
    { id: "2", name: "Bob Smith", initials: "BS" },
    { id: "3", name: "Carol Davis", initials: "CD" },
  ],
};

const mockGroupsData: Record<string, typeof defaultMockGroup> = {
  "1": {
    id: "1",
    name: "Bayan Investment Group (BIG)",
    description: "High cashflow SMEs with low EBITDA multiple asking prices",
    memberCount: 8,
    createdAt: "Nov 15, 2024",
    isOwner: true,
    ticker: "LDM",
    members: [
      { id: "1", name: "Alice Chen", initials: "AC" },
      { id: "2", name: "Bob Smith", initials: "BS" },
      { id: "3", name: "Carol Davis", initials: "CD" },
      { id: "4", name: "Dan Wilson", initials: "DW" },
      { id: "5", name: "Eve Brown", initials: "EB" },
      { id: "6", name: "Frank Lee", initials: "FL" },
      { id: "7", name: "Grace Kim", initials: "GK" },
      { id: "8", name: "Henry Park", initials: "HP" },
    ],
  },
  "2": {
    id: "2",
    name: "SME Perpetual Dividend Fund (SPDF)",
    description: "Fintech lender sourced SMEs with average yearly revenue of $5M",
    memberCount: 12,
    createdAt: "Oct 20, 2024",
    isOwner: false,
    ticker: "SPDF",
    members: [
      { id: "6", name: "Frank Lee", initials: "FL" },
      { id: "7", name: "Grace Kim", initials: "GK" },
      { id: "8", name: "Henry Park", initials: "HP" },
      { id: "9", name: "Iris Wang", initials: "IW" },
      { id: "10", name: "Jack Chen", initials: "JC" },
      { id: "11", name: "Kate Liu", initials: "KL" },
    ],
  },
  "3": {
    id: "3",
    name: "Horizon Ventures",
    description: "Focus on early-stage tech startups with global expansion potential",
    memberCount: 24,
    createdAt: "Sep 10, 2024",
    isOwner: false,
    ticker: "MIPANDA",
    members: [
      { id: "7", name: "Sarah Mitchell", initials: "SM" },
      { id: "8", name: "Michael Torres", initials: "MT" },
      { id: "9", name: "Lisa Chang", initials: "LC" },
    ],
  },
  "4": {
    id: "4",
    name: "Pacific Growth Partners",
    description: "Southeast Asian markets and emerging fintech opportunities",
    memberCount: 18,
    createdAt: "Aug 5, 2024",
    isOwner: false,
    ticker: "LDM",
    members: [
      { id: "10", name: "James Wong", initials: "JW" },
      { id: "11", name: "Nina Patel", initials: "NP" },
    ],
  },
  "5": {
    id: "5",
    name: "Apex Capital Collective",
    description: "Late-stage growth equity with focus on profitability metrics",
    memberCount: 31,
    createdAt: "Jul 20, 2024",
    isOwner: false,
    ticker: "SPDF",
    members: [
      { id: "12", name: "Robert Kim", initials: "RK" },
      { id: "13", name: "Amanda Lee", initials: "AL" },
      { id: "14", name: "David Chen", initials: "DC" },
    ],
  },
  "6": {
    id: "6",
    name: "Verde Impact Fund",
    description: "ESG-focused investments in renewable energy and sustainable tech",
    memberCount: 15,
    createdAt: "Jun 15, 2024",
    isOwner: false,
    ticker: "MIPANDA",
    members: [
      { id: "15", name: "Elena Rodriguez", initials: "ER" },
      { id: "16", name: "Thomas Green", initials: "TG" },
    ],
  },
};

const mockDocuments = [
  { id: "1", name: "Q4 Financial Analysis - TechCorp.pdf", uploaderName: "Alice Chen", uploaderInitials: "AC", uploadedAt: "2 hours ago", fileSize: "2.4 MB" },
  { id: "2", name: "Pitch Deck - InnovateFin v3.pdf", uploaderName: "Bob Smith", uploaderInitials: "BS", uploadedAt: "1 day ago", fileSize: "5.1 MB" },
  { id: "3", name: "Term Sheet Draft - PaymentPro.pdf", uploaderName: "Carol Davis", uploaderInitials: "CD", uploadedAt: "3 days ago", fileSize: "890 KB" },
  { id: "4", name: "Due Diligence Report - CryptoFlow.pdf", uploaderName: "Dan Wilson", uploaderInitials: "DW", uploadedAt: "1 week ago", fileSize: "12.3 MB" },
];

const mockMemberDetails = [
  { id: "1", name: "Alice Chen", email: "alice@example.com", initials: "AC", role: "owner" as const },
  { id: "2", name: "Bob Smith", email: "bob@example.com", initials: "BS", role: "contributor" as const, isCurrentUser: true },
  { id: "3", name: "Carol Davis", email: "carol@example.com", initials: "CD", role: "contributor" as const },
  { id: "4", name: "Dan Wilson", email: "dan@example.com", initials: "DW", role: "viewer" as const },
  { id: "5", name: "Eve Brown", email: "eve@example.com", initials: "EB", role: "viewer" as const },
];

const mockActivities = [
  { id: "1", type: "upload" as const, userName: "Alice Chen", userInitials: "AC", description: "uploaded Q4 Financial Analysis - TechCorp.pdf", timestamp: "2 hours ago", date: "Today" },
  { id: "2", type: "join" as const, userName: "Henry Park", userInitials: "HP", description: "joined the group", timestamp: "5 hours ago", date: "Today" },
  { id: "3", type: "upload" as const, userName: "Bob Smith", userInitials: "BS", description: "uploaded Pitch Deck - InnovateFin v3.pdf", timestamp: "Yesterday at 3:45 PM", date: "Yesterday" },
  { id: "4", type: "view" as const, userName: "Carol Davis", userInitials: "CD", description: "viewed Term Sheet Draft - PaymentPro.pdf", timestamp: "Yesterday at 11:20 AM", date: "Yesterday" },
];

// Group-specific deals data
const mockDealsData: Record<string, { upcoming: typeof upcomingDealsTemplate; closed: typeof closedDealsTemplate }> = {
  "1": {
    upcoming: [
      { id: "u1", name: "LDM Driving School Series B", targetAmount: 2500000, raisedAmount: 1875000, closingDate: "Jan 15, 2025", status: "open" as const, minInvestment: 25000 },
      { id: "u2", name: "Metro Manila Logistics Hub Expansion", targetAmount: 5000000, raisedAmount: 2100000, closingDate: "Feb 1, 2025", status: "open" as const, minInvestment: 50000 },
      { id: "u3", name: "Cebu Auto Parts Distribution Network", targetAmount: 1500000, raisedAmount: 0, closingDate: "Feb 28, 2025", status: "upcoming" as const, minInvestment: 15000 },
    ],
    closed: [
      { id: "c1", name: "Davao Fleet Management Acquisition", targetAmount: 3000000, raisedAmount: 3000000, closedDate: "Nov 30, 2024", return: 18.5 },
      { id: "c2", name: "Iloilo Transport Services Buyout", targetAmount: 1800000, raisedAmount: 1800000, closedDate: "Oct 15, 2024", return: 22.3 },
    ],
  },
  "2": {
    upcoming: [
      { id: "u1", name: "Digital Lending Platform Portfolio Q1", targetAmount: 10000000, raisedAmount: 7500000, closingDate: "Jan 20, 2025", status: "open" as const, minInvestment: 100000 },
      { id: "u2", name: "SME Working Capital Fund Tranche 5", targetAmount: 5000000, raisedAmount: 3200000, closingDate: "Feb 10, 2025", status: "open" as const, minInvestment: 50000 },
    ],
    closed: [
      { id: "c1", name: "Invoice Financing Pool Series A", targetAmount: 8000000, raisedAmount: 8000000, closedDate: "Dec 1, 2024", return: 14.2 },
      { id: "c2", name: "MSME Credit Line Syndicate", targetAmount: 6000000, raisedAmount: 6000000, closedDate: "Nov 1, 2024", return: 16.8 },
      { id: "c3", name: "Supply Chain Finance Bundle", targetAmount: 4000000, raisedAmount: 4000000, closedDate: "Sep 15, 2024", return: 15.5 },
    ],
  },
  "3": {
    upcoming: [
      { id: "u1", name: "MiPanda Milk Tea Franchise Expansion", targetAmount: 3000000, raisedAmount: 2100000, closingDate: "Jan 25, 2025", status: "open" as const, minInvestment: 30000 },
      { id: "u2", name: "AI-Powered Inventory Management Seed", targetAmount: 1500000, raisedAmount: 450000, closingDate: "Feb 15, 2025", status: "open" as const, minInvestment: 25000 },
      { id: "u3", name: "EdTech Platform Pre-Series A", targetAmount: 2000000, raisedAmount: 0, closingDate: "Mar 1, 2025", status: "upcoming" as const, minInvestment: 20000 },
    ],
    closed: [
      { id: "c1", name: "Cloud Kitchen Network Series A", targetAmount: 2500000, raisedAmount: 2500000, closedDate: "Nov 20, 2024", return: 32.1 },
      { id: "c2", name: "B2B Marketplace Seed Round", targetAmount: 1000000, raisedAmount: 1000000, closedDate: "Oct 1, 2024", return: 28.7 },
    ],
  },
  "4": {
    upcoming: [
      { id: "u1", name: "Vietnam E-Wallet Integration", targetAmount: 4000000, raisedAmount: 2800000, closingDate: "Jan 30, 2025", status: "open" as const, minInvestment: 40000 },
      { id: "u2", name: "Indonesia Micro-Insurance Platform", targetAmount: 3000000, raisedAmount: 1500000, closingDate: "Feb 20, 2025", status: "open" as const, minInvestment: 30000 },
    ],
    closed: [
      { id: "c1", name: "Thailand BNPL Expansion", targetAmount: 5000000, raisedAmount: 5000000, closedDate: "Dec 5, 2024", return: 24.5 },
      { id: "c2", name: "Singapore Neo-Bank Partnership", targetAmount: 3500000, raisedAmount: 3500000, closedDate: "Oct 20, 2024", return: 19.8 },
    ],
  },
  "5": {
    upcoming: [
      { id: "u1", name: "Enterprise SaaS Growth Round", targetAmount: 15000000, raisedAmount: 12000000, closingDate: "Jan 15, 2025", status: "open" as const, minInvestment: 150000 },
      { id: "u2", name: "Profitable D2C Brand Acquisition", targetAmount: 8000000, raisedAmount: 4500000, closingDate: "Feb 5, 2025", status: "open" as const, minInvestment: 80000 },
    ],
    closed: [
      { id: "c1", name: "Mature Fintech Pre-IPO Round", targetAmount: 20000000, raisedAmount: 20000000, closedDate: "Nov 25, 2024", return: 35.2 },
      { id: "c2", name: "Cash-Flow Positive Logistics Co", targetAmount: 12000000, raisedAmount: 12000000, closedDate: "Sep 30, 2024", return: 28.4 },
    ],
  },
  "6": {
    upcoming: [
      { id: "u1", name: "Solar Farm Portfolio Philippines", targetAmount: 6000000, raisedAmount: 4200000, closingDate: "Jan 28, 2025", status: "open" as const, minInvestment: 60000 },
      { id: "u2", name: "Sustainable Packaging Startup Series A", targetAmount: 2500000, raisedAmount: 1000000, closingDate: "Feb 18, 2025", status: "open" as const, minInvestment: 25000 },
      { id: "u3", name: "Electric Vehicle Charging Network", targetAmount: 4000000, raisedAmount: 0, closingDate: "Mar 10, 2025", status: "upcoming" as const, minInvestment: 40000 },
    ],
    closed: [
      { id: "c1", name: "Wind Energy Project Mindanao", targetAmount: 8000000, raisedAmount: 8000000, closedDate: "Dec 10, 2024", return: 21.3 },
      { id: "c2", name: "Organic Agriculture Tech Fund", targetAmount: 3000000, raisedAmount: 3000000, closedDate: "Oct 25, 2024", return: 18.9 },
    ],
  },
};

const upcomingDealsTemplate: Array<{ id: string; name: string; targetAmount: number; raisedAmount: number; closingDate: string; status: "open" | "upcoming"; minInvestment: number }> = [
  { id: "u1", name: "Sample Deal", targetAmount: 1000000, raisedAmount: 500000, closingDate: "Jan 15, 2025", status: "open", minInvestment: 10000 },
];

const closedDealsTemplate = [
  { id: "c1", name: "Completed Deal", targetAmount: 2000000, raisedAmount: 2000000, closedDate: "Dec 1, 2024", return: 15.0 },
];

interface GroupDetailProps {
  groupId: string;
  groupData?: GroupDataFromDB;
  onBack?: () => void;
}

export function GroupDetail({ groupId, groupData, onBack }: GroupDetailProps) {
  const { isAuthenticated, user } = useAuth();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("files");
  const [filesSubTab, setFilesSubTab] = useState("documents");
  const [documents, setDocuments] = useState(mockDocuments); // todo: remove mock functionality

  // Transform real data to display format, or use mock data as fallback
  const group = useMemo(() => {
    if (groupData?.group) {
      const dbGroup = groupData.group;
      const createdDate = new Date(dbGroup.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      // Transform members to display format
      const members = groupData.members.map((m) => {
        const name = m.name || "Unknown";
        const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
        return {
          id: m.id,
          name,
          initials,
        };
      });

      return {
        id: dbGroup.id,
        name: dbGroup.name,
        description: dbGroup.description || "",
        memberCount: groupData.memberCount,
        createdAt: createdDate,
        isOwner: dbGroup.curatorId === user?.id,
        ticker: dbGroup.sector?.substring(0, 6).toUpperCase() || "GRP",
        members,
      };
    }
    // Fallback to mock data for backward compatibility
    return mockGroupsData[groupId] || defaultMockGroup;
  }, [groupData, groupId, user?.id]);

  // Transform real member data for MembersList, or use mock
  const memberDetails = useMemo(() => {
    if (groupData?.members) {
      return groupData.members.map((m) => ({
        id: m.id,
        name: m.name || "Unknown Member",
        email: m.email || "",
        initials: (m.name || "U").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase(),
        role: m.role === "curator" ? "owner" as const : "contributor" as const,
        isCurrentUser: m.userId === user?.id,
      }));
    }
    return mockMemberDetails;
  }, [groupData?.members, user?.id]);

  // Check if current user is a member
  const isMember = useMemo(() => {
    if (groupData?.members) {
      return groupData.members.some(m => m.userId === user?.id);
    }
    return mockMemberDetails.some(m => m.isCurrentUser);
  }, [groupData?.members, user?.id]);

  const handleUpload = (file: File) => {
    // todo: remove mock functionality
    const newDoc = {
      id: String(documents.length + 1),
      name: file.name,
      uploaderName: "You",
      uploaderInitials: "YO",
      uploadedAt: "Just now",
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    };
    setDocuments([newDoc, ...documents]);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={onBack} data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold truncate" data-testid="text-group-name">{group.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button onClick={() => setInviteModalOpen(true)} data-testid="button-invite">
                <UserPlus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Invite</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm mb-2">{group.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{group.memberCount} members</span>
              <span>Created {group.createdAt}</span>
            </div>
          </div>
          <AvatarStack members={group.members} maxVisible={5} />
        </div>

        {isMember && (
          <Card className="p-6" data-testid="chart-container">
            <TradingChart symbol={group.ticker} />
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="files" className="gap-2" data-testid="tab-group-files">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Group Files</span>
              <span className="sm:hidden">Files</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2" data-testid="tab-upcoming-deals">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Upcoming Deals</span>
              <span className="sm:hidden">Upcoming</span>
            </TabsTrigger>
            <TabsTrigger value="closed" className="gap-2" data-testid="tab-closed-deals">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Closed Deals</span>
              <span className="sm:hidden">Closed</span>
            </TabsTrigger>
            <TabsTrigger value="trade" className="gap-2" data-testid="tab-quick-trade">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Trade</span>
              <span className="sm:hidden">Trade</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="mt-0">
            <Tabs value={filesSubTab} onValueChange={setFilesSubTab} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto mb-4">
                <TabsTrigger value="documents" className="gap-2" data-testid="tab-documents">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Documents</span>
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2" data-testid="tab-upload">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload</span>
                </TabsTrigger>
                <TabsTrigger value="members" className="gap-2" data-testid="tab-members">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Members</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2" data-testid="tab-activity">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Activity</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="documents" className="mt-4">
                {documents.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No documents yet"
                    description="Upload your first investment document to get started."
                    actionLabel="Upload PDF"
                    onAction={() => setFilesSubTab("upload")}
                  />
                ) : (
                  <div className="divide-y divide-border rounded-md border bg-card">
                    {documents.map((doc) => (
                      <DocumentRow
                        key={doc.id}
                        {...doc}
                        canDelete={group.isOwner}
                        onView={() => console.log("View:", doc.name)}
                        onDownload={() => console.log("Download:", doc.name)}
                        onDelete={() => setDocuments(documents.filter((d) => d.id !== doc.id))}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upload" className="mt-4">
                <UploadZone groupId={groupId} onUpload={handleUpload} />
              </TabsContent>

              <TabsContent value="members" className="mt-4">
                <MembersList
                  members={memberDetails}
                  canManage={group.isOwner}
                  onRemoveMember={(id) => console.log("Remove member:", id)}
                />
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <ActivityFeed activities={mockActivities} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0">
            {(() => {
              const deals = mockDealsData[groupId]?.upcoming || upcomingDealsTemplate;
              return (
                <div className="space-y-4">
                  {deals.map((deal) => {
                    const progress = (deal.raisedAmount / deal.targetAmount) * 100;
                    return (
                      <Card key={deal.id} data-testid={`card-upcoming-deal-${deal.id}`}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-foreground">{deal.name}</h4>
                                <Badge variant={deal.status === "open" ? "default" : "secondary"} className="text-xs">
                                  {deal.status === "open" ? "Open" : "Coming Soon"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Closes {deal.closingDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  Min ${deal.minInvestment.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              disabled={deal.status === "upcoming"}
                              data-testid={`button-invest-${deal.id}`}
                            >
                              {deal.status === "open" ? "Invest Now" : "Notify Me"}
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                ${deal.raisedAmount.toLocaleString()} raised
                              </span>
                              <span className="font-medium text-foreground">
                                ${deal.targetAmount.toLocaleString()} target
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground text-right">
                              {progress.toFixed(0)}% funded
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {deals.length === 0 && (
                    <EmptyState
                      icon={Calendar}
                      title="No upcoming deals"
                      description="Check back soon for new investment opportunities."
                    />
                  )}
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="closed" className="mt-0">
            {(() => {
              const deals = mockDealsData[groupId]?.closed || closedDealsTemplate;
              return (
                <div className="space-y-4">
                  {deals.map((deal) => (
                    <Card key={deal.id} data-testid={`card-closed-deal-${deal.id}`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground">{deal.name}</h4>
                              <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Closed
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Closed {deal.closedDate}</span>
                              <span>${deal.raisedAmount.toLocaleString()} raised</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Return</div>
                            <div className="text-lg font-bold text-green-500">+{deal.return}%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {deals.length === 0 && (
                    <EmptyState
                      icon={CheckCircle2}
                      title="No closed deals yet"
                      description="Completed deals will appear here."
                    />
                  )}
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="trade" className="mt-0">
            {isMember ? (
              <TradingInterface groupId={groupId} hideChart symbol={group.ticker} />
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="Join to Trade"
                description="You need to be a member of this group to access the trading interface."
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      <InviteModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        groupName={group.name}
        onSendInvite={(email, role) => console.log("Invite:", email, role)}
      />
    </div>
  );
}

export default GroupDetail;
