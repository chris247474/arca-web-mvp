"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createGroup } from "@/lib/actions/groups";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const SECTORS = [
  "Technology",
  "Finance",
  "Healthcare",
  "Real Estate",
  "Energy",
  "Consumer",
  "Manufacturing",
  "Other",
];

export function CreateGroupModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateGroupModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sector, setSector] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const resetForm = () => {
    setName("");
    setDescription("");
    setSector("");
    setVisibility("private");
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; description?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Group name is required";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be signed in to create a group",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await createGroup({
        name: name.trim(),
        description: description.trim(),
        curatorId: user.id,
        sector: sector || undefined,
        visibility,
      });

      if (result.success) {
        toast({
          title: "Group created",
          description: `"${name}" has been created successfully.`,
        });
        resetForm();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create group",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="e.g., Series A Prospects"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              disabled={isPending}
              data-testid="input-group-name"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-description">Description</Label>
            <Textarea
              id="group-description"
              placeholder="What's this group for?"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              className="resize-none"
              rows={3}
              disabled={isPending}
              data-testid="input-group-description"
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-sector">Sector (Optional)</Label>
            <Select value={sector} onValueChange={setSector} disabled={isPending}>
              <SelectTrigger id="group-sector" data-testid="select-group-sector">
                <SelectValue placeholder="Select a sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-visibility">Visibility</Label>
            <Select
              value={visibility}
              onValueChange={(v) => setVisibility(v as "public" | "private")}
              disabled={isPending}
            >
              <SelectTrigger id="group-visibility" data-testid="select-group-visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private - Invite only</SelectItem>
                <SelectItem value="public">Public - Visible to everyone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
            data-testid="button-create-group"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
