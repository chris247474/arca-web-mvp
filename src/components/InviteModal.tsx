"use client";

import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PendingInvite {
  id: string;
  email: string;
  role: "viewer" | "contributor";
}

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  pendingInvites?: PendingInvite[];
  onSendInvite?: (email: string, role: "viewer" | "contributor") => void;
  onRemoveInvite?: (id: string) => void;
}

export function InviteModal({
  open,
  onOpenChange,
  groupName,
  pendingInvites = [],
  onSendInvite,
  onRemoveInvite,
}: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "contributor">("viewer");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    onSendInvite?.(email, role);
    setEmail("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to {groupName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="investor@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              data-testid="input-invite-email"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "viewer" | "contributor")}>
              <SelectTrigger data-testid="select-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer - Can view and download</SelectItem>
                <SelectItem value="contributor">Contributor - Can also upload</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" data-testid="button-send-invite">
            <Send className="h-4 w-4 mr-2" />
            Send Invite
          </Button>
        </form>

        {pendingInvites.length > 0 && (
          <div className="mt-6 space-y-2">
            <Label className="text-muted-foreground">Pending invites</Label>
            <div className="space-y-2">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-2 rounded-md bg-muted"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{invite.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{invite.role}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onRemoveInvite?.(invite.id)}
                    data-testid={`button-remove-invite-${invite.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
