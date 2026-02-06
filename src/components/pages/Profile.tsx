"use client";

import { useState } from "react";
import { ArrowLeft, Wallet, User, Bell, Save, Link2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { user, privyUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState({
    legalName: "",
    residency: "",
    email: user?.email || privyUser?.email?.address || "",
    socialX: "",
    telegramBot: "",
    taxId: "",
    twoFactorEnabled: false,
  });

  const handleSave = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              <h1 className="text-lg font-semibold" data-testid="text-page-title">Profile</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button onClick={handleSave} data-testid="button-save-profile">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="wallet" className="gap-2" data-testid="tab-wallet">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2" data-testid="tab-profile">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2" data-testid="tab-notifications">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-4xl font-bold text-foreground" data-testid="text-wallet-balance">$0.00</p>
                <p className="text-sm text-muted-foreground">Ready to invest • USDC on Base</p>
              </div>
              <div className="flex items-center gap-2">
                <Button data-testid="button-deposit">Deposit</Button>
                <Button variant="outline" data-testid="button-withdraw">Withdraw</Button>
                <Button size="icon" variant="ghost" data-testid="button-wallet-more">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-foreground">Claims from investment</h3>
                <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">0</span>
              </div>
              <Card className="bg-muted/30">
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Link2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground mb-2">No claims available</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    If you made investments in tokens, locked and claimable assets will appear here after the token has been dispersed.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal name</Label>
                  <Input
                    id="legalName"
                    value={formData.legalName}
                    onChange={(e) => updateField("legalName", e.target.value)}
                    placeholder="Enter your legal name"
                    data-testid="input-legal-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="residency">Residency</Label>
                  <Input
                    id="residency"
                    value={formData.residency}
                    onChange={(e) => updateField("residency", e.target.value)}
                    placeholder="Enter your country of residency"
                    data-testid="input-residency"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Emails</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Enter your email"
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="socialX">Social / X</Label>
                  <Input
                    id="socialX"
                    value={formData.socialX}
                    onChange={(e) => updateField("socialX", e.target.value)}
                    placeholder="@username"
                    data-testid="input-social-x"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegramBot">Telegram bot</Label>
                  <Input
                    id="telegramBot"
                    value={formData.telegramBot}
                    onChange={(e) => updateField("telegramBot", e.target.value)}
                    placeholder="@bot_username"
                    data-testid="input-telegram"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investor information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Able to invest</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground" data-testid="text-able-to-invest">
                    Not Qualified
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Identity</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground" data-testid="text-identity">
                    Not Yet Verified
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => updateField("taxId", e.target.value)}
                    placeholder="Enter your tax ID"
                    data-testid="input-tax-id"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two Factor Auth.</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={formData.twoFactorEnabled}
                    onCheckedChange={(v) => updateField("twoFactorEnabled", v)}
                    data-testid="switch-2fa"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Lost the access to your passkey? Contact support to recover your account.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-email-notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Group activity</Label>
                    <p className="text-sm text-muted-foreground">Get notified when new documents are uploaded</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-group-notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Trade alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts for your open positions</p>
                  </div>
                  <Switch data-testid="switch-trade-notifications" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}

export default ProfilePage;
