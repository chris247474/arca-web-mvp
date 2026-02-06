"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Users, User, LogOut, LogIn, Lock, TrendingUp, TrendingDown, ExternalLink, Briefcase, Globe, LineChart as LineChartIcon, FileCheck, Clock, DollarSign, CheckCircle2, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GroupCard } from "@/components/GroupCard";
import { BrowseGroupCard } from "@/components/BrowseGroupCard";
import { EmptyState } from "@/components/EmptyState";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StockCarousel } from "@/components/StockCarousel";
import { TradingInterface, TradingChart } from "@/components/TradingInterface";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getGroups, getUserGroups } from "@/lib/actions/groups";
import type { GroupWithCurator } from "@/lib/actions/groups";

const mockGroups = [
  {
    id: "1",
    name: "Bayan Investment Group (BIG)",
    description: "High cashflow SMEs with low EBITDA multiple asking prices",
    curator: "Jerome Ubando",
    memberCount: 8,
    documentCount: 12,
    lastActivity: "2h ago",
    members: [
      { id: "1", name: "Alice Chen", initials: "AC" },
      { id: "2", name: "Bob Smith", initials: "BS" },
      { id: "3", name: "Carol Davis", initials: "CD" },
    ],
  },
  {
    id: "2",
    name: "SME Perpetual Dividend Fund (SPDF)",
    description: "Fintech lender sourced SMEs with average yearly revenue of $5M",
    curator: "Adriel Maniego",
    memberCount: 12,
    documentCount: 24,
    lastActivity: "3h ago",
    members: [
      { id: "6", name: "Frank Lee", initials: "FL" },
      { id: "7", name: "Grace Kim", initials: "GK" },
      { id: "8", name: "Henry Park", initials: "HP" },
      { id: "9", name: "Iris Wang", initials: "IW" },
      { id: "10", name: "Jack Chen", initials: "JC" },
      { id: "11", name: "Kate Liu", initials: "KL" },
    ],
  },
];

const browseGroups = [
  {
    id: "1",
    name: "Bayan Investment Group (BIG)",
    description: "Curated by Jerome Ubando. High cashflow SMEs with low EBITDA multiple asking prices.",
    curator: "Jerome Ubando",
    memberCount: 8,
    documentCount: 12,
    lastActivity: "2h ago",
    ticker: "LDM",
    members: [
      { id: "1", name: "Jerome Ubando", initials: "JU" },
      { id: "2", name: "Alice Chen", initials: "AC" },
      { id: "3", name: "Bob Smith", initials: "BS" },
    ],
  },
  {
    id: "2",
    name: "SME Perpetual Dividend Fund (SPDF)",
    description: "Curated by Adriel Maniego. Fintech lender sourced SMEs with average yearly revenue of $5M.",
    curator: "Adriel Maniego",
    memberCount: 12,
    documentCount: 24,
    lastActivity: "3h ago",
    ticker: "SPDF",
    members: [
      { id: "4", name: "Adriel Maniego", initials: "AM" },
      { id: "5", name: "Frank Lee", initials: "FL" },
      { id: "6", name: "Grace Kim", initials: "GK" },
    ],
  },
  {
    id: "3",
    name: "Horizon Ventures",
    description: "Curated by Sarah Mitchell. Focus on early-stage tech startups with global expansion potential.",
    curator: "Sarah Mitchell",
    memberCount: 24,
    documentCount: 45,
    lastActivity: "1h ago",
    ticker: "MIPANDA",
    members: [
      { id: "7", name: "Sarah Mitchell", initials: "SM" },
      { id: "8", name: "Michael Torres", initials: "MT" },
      { id: "9", name: "Lisa Chang", initials: "LC" },
    ],
  },
  {
    id: "4",
    name: "Pacific Growth Partners",
    description: "Curated by James Wong. Southeast Asian markets and emerging fintech opportunities.",
    curator: "James Wong",
    memberCount: 18,
    documentCount: 32,
    lastActivity: "4h ago",
    ticker: "LDM",
    members: [
      { id: "10", name: "James Wong", initials: "JW" },
      { id: "11", name: "Nina Patel", initials: "NP" },
    ],
  },
  {
    id: "5",
    name: "Apex Capital Collective",
    description: "Curated by Robert Kim. Late-stage growth equity with focus on profitability metrics.",
    curator: "Robert Kim",
    memberCount: 31,
    documentCount: 67,
    lastActivity: "2h ago",
    ticker: "SPDF",
    members: [
      { id: "12", name: "Robert Kim", initials: "RK" },
      { id: "13", name: "Amanda Lee", initials: "AL" },
      { id: "14", name: "David Chen", initials: "DC" },
    ],
  },
  {
    id: "6",
    name: "Verde Impact Fund",
    description: "Curated by Elena Rodriguez. ESG-focused investments in renewable energy and sustainable tech.",
    curator: "Elena Rodriguez",
    memberCount: 15,
    documentCount: 28,
    lastActivity: "6h ago",
    ticker: "MIPANDA",
    members: [
      { id: "15", name: "Elena Rodriguez", initials: "ER" },
      { id: "16", name: "Thomas Green", initials: "TG" },
    ],
  },
];

const mockPositions = [
  { symbol: "LDM", name: "LDM Technologies", size: 1500, entryPrice: 38.50, currentPrice: 42.15, leverage: 5, type: "long" as const },
  { symbol: "SPDF", name: "SME Perpetual Dividend Fund", size: 500, entryPrice: 142.00, currentPrice: 156.80, leverage: 2, type: "long" as const },
  { symbol: "MIPANDA", name: "MiPanda Holdings", size: 800, entryPrice: 115.20, currentPrice: 128.50, leverage: 3, type: "long" as const },
];

const mockPnLHistory = [
  { date: "Nov 1", pnl: 0 },
  { date: "Nov 5", pnl: 2340 },
  { date: "Nov 10", pnl: 5120 },
  { date: "Nov 15", pnl: 3890 },
  { date: "Nov 20", pnl: 8450 },
  { date: "Nov 25", pnl: 12300 },
  { date: "Nov 30", pnl: 9870 },
  { date: "Dec 1", pnl: 15420 },
  { date: "Dec 3", pnl: 18900 },
  { date: "Dec 5", pnl: 22150 },
  { date: "Dec 7", pnl: 27375 },
  { date: "Dec 8", pnl: 35012 },
];

// My Deals - deals user has participated in or applied to
const mockMyDeals = {
  active: [
    { id: "a1", name: "LDM Driving School Series B", groupName: "Bayan Investment Group (BIG)", groupId: "1", investedAmount: 50000, status: "invested" as const, investedDate: "Dec 10, 2024", targetAmount: 2500000, raisedAmount: 1875000, closingDate: "Jan 15, 2025", expectedReturn: 18.0 },
    { id: "a2", name: "Digital Lending Platform Portfolio Q1", groupName: "SME Perpetual Dividend Fund (SPDF)", groupId: "2", investedAmount: 150000, status: "invested" as const, investedDate: "Dec 5, 2024", targetAmount: 10000000, raisedAmount: 7500000, closingDate: "Jan 20, 2025", expectedReturn: 14.5 },
    { id: "a3", name: "MiPanda Milk Tea Franchise Expansion", groupName: "Horizon Ventures", groupId: "3", investedAmount: 0, status: "applied" as const, appliedDate: "Dec 12, 2024", targetAmount: 3000000, raisedAmount: 2100000, closingDate: "Jan 25, 2025", expectedReturn: 24.0 },
  ],
  completed: [
    { id: "c1", name: "Davao Fleet Management Acquisition", groupName: "Bayan Investment Group (BIG)", groupId: "1", investedAmount: 75000, status: "completed" as const, investedDate: "Aug 15, 2024", closedDate: "Nov 30, 2024", actualReturn: 18.5, profit: 13875 },
    { id: "c2", name: "Invoice Financing Pool Series A", groupName: "SME Perpetual Dividend Fund (SPDF)", groupId: "2", investedAmount: 200000, status: "completed" as const, investedDate: "Jul 1, 2024", closedDate: "Dec 1, 2024", actualReturn: 14.2, profit: 28400 },
    { id: "c3", name: "Cloud Kitchen Network Series A", groupName: "Horizon Ventures", groupId: "3", investedAmount: 40000, status: "completed" as const, investedDate: "Jun 20, 2024", closedDate: "Nov 20, 2024", actualReturn: 32.1, profit: 12840 },
  ],
};

interface DashboardProps {
  onSelectGroup?: (groupId: string) => void;
  onNavigateToProfile?: () => void;
}

function AuthRequiredOverlay({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="absolute inset-0 z-10 flex items-start justify-center pt-16">
      <div className="absolute inset-0 backdrop-blur-md bg-background/60" />
      <div className="relative z-20 flex flex-col items-center gap-4 p-8 text-center">
        <div className="p-4 rounded-full bg-muted">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Sign in Required</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please sign in to access this content
          </p>
        </div>
        <Button onClick={onLogin} data-testid="button-auth-cta">
          <LogIn className="h-4 w-4 mr-2" />
          Sign in with Privy
        </Button>
      </div>
    </div>
  );
}

function PortfolioContent({ onLogin, isAuthenticated }: { onLogin: () => void; isAuthenticated: boolean }) {
  const [selectedSymbol, setSelectedSymbol] = useState(mockPositions[0]?.symbol || "LDM");

  const totalPnL = mockPositions.reduce((acc, pos) => {
    const pnl = pos.type === "long"
      ? (pos.currentPrice - pos.entryPrice) * pos.size * pos.leverage
      : (pos.entryPrice - pos.currentPrice) * pos.size * pos.leverage;
    return acc + pnl;
  }, 0);

  const totalValue = mockPositions.reduce((acc, pos) => acc + pos.size * pos.currentPrice, 0);

  return (
    <div className="relative">
      {!isAuthenticated && <AuthRequiredOverlay onLogin={onLogin} />}
      <div className={!isAuthenticated ? "pointer-events-none select-none" : ""}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Portfolio Value</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground" data-testid="text-portfolio-value">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Across {mockPositions.length} positions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total PnL</CardTitle>
              {totalPnL >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold font-mono ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}
                data-testid="text-total-pnl"
              >
                {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {((totalPnL / (totalValue - totalPnL)) * 100).toFixed(2)}% return
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground truncate">Partner Exchange</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full truncate"
                variant="outline"
                onClick={() => window.open("https://gmx.io", "_blank")}
                data-testid="button-partner-exchange"
              >
                <span className="truncate">Access Full Trading Tools</span>
                <ExternalLink className="h-4 w-4 ml-2 shrink-0" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6" data-testid="card-pnl-chart">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Portfolio PnL</CardTitle>
            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockPnLHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`$${(value as number).toLocaleString()}`, 'PnL']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.5} />
                  <Line
                    type="monotone"
                    dataKey="pnl"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: 'rgb(34, 197, 94)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Open Positions</h3>
          <div className="space-y-3">
            {mockPositions.map((position, index) => {
              const pnl = position.type === "long"
                ? (position.currentPrice - position.entryPrice) * position.size * position.leverage
                : (position.entryPrice - position.currentPrice) * position.size * position.leverage;
              const pnlPercent = ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100 * (position.type === "long" ? 1 : -1);

              return (
                <Card
                  key={index}
                  data-testid={`card-position-${position.symbol}`}
                  className={`cursor-pointer transition-all ${selectedSymbol === position.symbol ? "ring-2 ring-primary" : "hover-elevate"}`}
                  onClick={() => setSelectedSymbol(position.symbol)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          position.type === "long" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                        }`}>
                          {position.leverage}x {position.type.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{position.symbol}</div>
                          <div className="text-sm text-muted-foreground">{position.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Size</div>
                          <div className="font-mono text-foreground">${(position.size * position.currentPrice).toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Entry</div>
                          <div className="font-mono text-foreground">${position.entryPrice.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Current</div>
                          <div className="font-mono text-foreground">${position.currentPrice.toFixed(2)}</div>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <div className="text-sm text-muted-foreground">PnL</div>
                          <div className={`font-mono font-semibold ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} ({pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Trade</h3>
          <Card className="mb-4">
            <CardContent className="p-4">
              <TradingChart symbol={selectedSymbol} />
            </CardContent>
          </Card>
          <TradingInterface groupId="portfolio" symbol={selectedSymbol} hideChart />
        </div>
      </div>
    </div>
  );
}

// Helper function to transform group data for display
function transformGroupForDisplay(group: GroupWithCurator) {
  const curatorName = group.curator?.name || "Unknown";
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
    lastActivity: "Recently", // TODO: Calculate from last activity
    members,
    sector: group.sector,
  };
}

export function Dashboard({ onSelectGroup, onNavigateToProfile }: DashboardProps) {
  const { isAuthenticated, isLoading, login, logout, user, privyUser } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");

  // Real data state
  const [publicGroups, setPublicGroups] = useState<GroupWithCurator[]>([]);
  const [userGroups, setUserGroups] = useState<GroupWithCurator[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

  // Fetch public groups
  const fetchPublicGroups = useCallback(async () => {
    const result = await getGroups();
    if (result.success && result.groups) {
      setPublicGroups(result.groups);
    }
  }, []);

  // Fetch user's groups
  const fetchUserGroups = useCallback(async () => {
    if (!user?.id) {
      setUserGroups([]);
      return;
    }
    const result = await getUserGroups(user.id);
    if (result.success && result.groups) {
      setUserGroups(result.groups);
    }
  }, [user?.id]);

  // Fetch data on mount and when user changes
  useEffect(() => {
    setIsLoadingGroups(true);
    Promise.all([fetchPublicGroups(), fetchUserGroups()]).finally(() => {
      setIsLoadingGroups(false);
    });
  }, [fetchPublicGroups, fetchUserGroups]);

  // Refresh data after creating a group
  const handleGroupCreated = useCallback(() => {
    fetchPublicGroups();
    fetchUserGroups();
  }, [fetchPublicGroups, fetchUserGroups]);

  const handleCreateGroup = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create a new group.",
      });
      login();
      return;
    }
    setCreateModalOpen(true);
  };

  const getUserInitials = () => {
    if (!privyUser) return "?";
    if (privyUser.email?.address) {
      return privyUser.email.address.substring(0, 2).toUpperCase();
    }
    if (privyUser.google?.name) {
      const names = privyUser.google.name.split(" ");
      return names.map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
    }
    return "U";
  };

  // Transform and filter user groups
  const transformedUserGroups = userGroups.map(transformGroupForDisplay);
  const filteredGroups = transformedUserGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Transform and filter public groups for browse
  // Combine real fetched groups with fallback mock data if no real data yet
  const displayBrowseGroups = publicGroups.length > 0
    ? publicGroups.map(transformGroupForDisplay)
    : browseGroups; // Use mock data as fallback

  const filteredBrowseGroups = displayBrowseGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            <h1 className="text-xl font-semibold text-foreground">ArCa</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onNavigateToProfile} data-testid="menu-item-profile">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} data-testid="menu-item-signout">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="outline" onClick={login} data-testid="button-login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Market Trends</h2>
          <StockCarousel />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6" data-testid="tabs-dashboard">
            <TabsTrigger value="browse" className="flex items-center gap-2" data-testid="tab-browse">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Browse Groups</span>
              <span className="sm:hidden">Browse</span>
            </TabsTrigger>
            <TabsTrigger value="my-groups" className="flex items-center gap-2" data-testid="tab-my-groups">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">My Groups</span>
              <span className="sm:hidden">Groups</span>
            </TabsTrigger>
            <TabsTrigger value="my-deals" className="flex items-center gap-2" data-testid="tab-my-deals">
              <FileCheck className="h-4 w-4" />
              <span className="hidden sm:inline">My Deals</span>
              <span className="sm:hidden">Deals</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2" data-testid="tab-portfolio">
              <Briefcase className="h-4 w-4" />
              <span>Portfolio</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-0">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Discover groups curated by experienced investors and apply to join
              </p>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-browse"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredBrowseGroups.map((group) => {
                const isMember = isAuthenticated && userGroups.some(
                  (g) => g.name.toLowerCase() === group.name.toLowerCase()
                );
                return (
                  <BrowseGroupCard
                    key={group.id}
                    {...group}
                    isMember={isMember}
                    onClick={() => onSelectGroup?.(group.id)}
                  />
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="my-groups" className="mt-0">
            <div className="relative">
              {!isAuthenticated && <AuthRequiredOverlay onLogin={login} />}
              <div className={!isAuthenticated ? "pointer-events-none select-none" : ""}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {transformedUserGroups.length} investment {transformedUserGroups.length === 1 ? "group" : "groups"}
                    </p>
                  </div>
                  <Button onClick={handleCreateGroup} data-testid="button-create-group">
                    <Plus className="h-4 w-4 mr-2" />
                    New Group
                  </Button>
                </div>

                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search your groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-groups"
                  />
                </div>

                {filteredGroups.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title={searchQuery ? "No groups found" : "No groups yet"}
                    description={
                      searchQuery
                        ? "Try adjusting your search terms"
                        : "Create your first investment group to start collaborating with other investors."
                    }
                    actionLabel={searchQuery ? undefined : "Create Group"}
                    onAction={searchQuery ? undefined : handleCreateGroup}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredGroups.map((group) => (
                      <GroupCard
                        key={group.id}
                        {...group}
                        onClick={() => onSelectGroup?.(group.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-deals" className="mt-0">
            <div className="relative">
              {!isAuthenticated && <AuthRequiredOverlay onLogin={login} />}
              <div className={!isAuthenticated ? "pointer-events-none select-none" : ""}>
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Active Investments</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold font-mono text-foreground" data-testid="text-active-invested">
                          ${mockMyDeals.active.filter(d => d.status === "invested").reduce((acc, d) => acc + d.investedAmount, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">{mockMyDeals.active.filter(d => d.status === "invested").length} active deals</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Pending Applications</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold font-mono text-foreground" data-testid="text-pending-applications">
                          {mockMyDeals.active.filter(d => d.status === "applied").length}
                        </div>
                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Total Realized Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold font-mono text-green-500" data-testid="text-realized-profit">
                          +${mockMyDeals.completed.reduce((acc, d) => acc + d.profit, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">From {mockMyDeals.completed.length} completed deals</p>
                      </CardContent>
                    </Card>
                  </div>

                  <h3 className="text-lg font-semibold mb-4 text-foreground">Active Deals</h3>
                  <div className="space-y-4 mb-8">
                    {mockMyDeals.active.map((deal) => {
                      const progress = (deal.raisedAmount / deal.targetAmount) * 100;
                      return (
                        <Card key={deal.id} data-testid={`card-my-deal-${deal.id}`}>
                          <CardContent className="p-4">
                            <div className="flex flex-col gap-4">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="font-semibold text-foreground">{deal.name}</h4>
                                    <Badge
                                      variant={deal.status === "invested" ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {deal.status === "invested" ? "Invested" : "Applied"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{deal.groupName}</p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Closes {deal.closingDate}
                                    </span>
                                    {deal.status === "invested" && (
                                      <span className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        ${deal.investedAmount.toLocaleString()} invested
                                      </span>
                                    )}
                                    <span className="text-green-500">Est. {deal.expectedReturn}% return</span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onSelectGroup?.(deal.groupId)}
                                  data-testid={`button-view-deal-${deal.id}`}
                                >
                                  View Deal
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
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <h3 className="text-lg font-semibold mb-4 text-foreground">Completed Deals</h3>
                  <div className="space-y-4">
                    {mockMyDeals.completed.map((deal) => (
                      <Card key={deal.id} data-testid={`card-completed-deal-${deal.id}`}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-semibold text-foreground">{deal.name}</h4>
                                <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{deal.groupName}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                <span>Invested ${deal.investedAmount.toLocaleString()}</span>
                                <span>Closed {deal.closedDate}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Profit</div>
                              <div className="text-lg font-bold text-green-500">
                                +${deal.profit.toLocaleString()} ({deal.actualReturn}%)
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="mt-0">
            <PortfolioContent onLogin={login} isAuthenticated={isAuthenticated} />
          </TabsContent>
        </Tabs>
      </main>

      <CreateGroupModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleGroupCreated}
      />
    </div>
  );
}

export default Dashboard;
