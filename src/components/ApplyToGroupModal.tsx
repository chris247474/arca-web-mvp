"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { submitApplication } from "@/lib/actions/applications";

const applicationSchema = z.object({
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL").min(1, "LinkedIn profile is required"),
  investmentFocus: z.string().min(1, "Please select an investment sector"),
  pastInvestments: z.string().min(10, "Please describe your past investments (minimum 10 characters)"),
  personalBio: z.string().min(20, "Please provide a brief bio (minimum 20 characters)"),
  valueAdd: z.string().min(20, "Please explain your value add (minimum 20 characters)"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplyToGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
  curatorName: string;
  onSuccess?: () => void;
}

const investmentSectors = [
  "Fintech",
  "Healthcare & Biotech",
  "Climate & Sustainability",
  "Enterprise SaaS",
  "Consumer Tech",
  "AI & Machine Learning",
  "Real Estate",
  "Crypto & Web3",
  "E-commerce",
  "Gaming & Entertainment",
  "Other",
];

export function ApplyToGroupModal({
  open,
  onOpenChange,
  groupId,
  groupName,
  curatorName,
  onSuccess,
}: ApplyToGroupModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      linkedinUrl: "",
      investmentFocus: "",
      pastInvestments: "",
      personalBio: "",
      valueAdd: "",
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    if (!user?.id) {
      setError("You must be logged in to apply");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Combine form fields into interest statement
      const interestStatement = [
        `Investment Focus: ${data.investmentFocus}`,
        `Past Investments: ${data.pastInvestments}`,
        `Bio: ${data.personalBio}`,
        `Value Add: ${data.valueAdd}`,
      ].join("\n\n");

      const result = await submitApplication(groupId, {
        userId: user.id,
        linkedinUrl: data.linkedinUrl,
        interestStatement,
      });

      if (result) {
        toast({
          title: "Application Submitted",
          description: `Your request to join ${groupName} has been sent to ${curatorName} for review.`,
        });

        form.reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        setError("Failed to submit application. Please try again.");
      }
    } catch (err) {
      console.error("Application submission error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to Join {groupName}</DialogTitle>
          <DialogDescription>
            Complete your investor profile to apply. {curatorName} will review your application.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn Profile</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://linkedin.com/in/yourprofile"
                      {...field}
                      data-testid="input-linkedin"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="investmentFocus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Sector Focus</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-investment-focus">
                        <SelectValue placeholder="Select your primary investment focus" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {investmentSectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pastInvestments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Past Investments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your notable past investments, portfolio companies, or investment experience..."
                      className="min-h-[80px]"
                      {...field}
                      data-testid="textarea-past-investments"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personalBio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself, your background, and your investment philosophy..."
                      className="min-h-[80px]"
                      {...field}
                      data-testid="textarea-bio"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valueAdd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why would you be a good fit?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain what unique value you would bring to this group and why you're interested in joining..."
                      className="min-h-[80px]"
                      {...field}
                      data-testid="textarea-value-add"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md" data-testid="error-message">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-apply"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-submit-application"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
