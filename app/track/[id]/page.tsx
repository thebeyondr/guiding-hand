"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft, Mail, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { ModeToggle } from "@/components/mode-toggle";

export default function TrackPage() {
  const params = useParams();
  const id = params.id as Id<"missingPersons">;
  const person = useQuery(api.missingPersons.get, { id });
  const subscribe = useMutation(api.trackers.subscribe);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showEmailTips, setShowEmailTips] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await subscribe({
        email,
        missingPersonId: id,
      });
      setSubmitted(true);
      // Show tips modal if user hasn't seen it before
      const hasSeenTips = localStorage.getItem("guiding-hand-email-tips-seen");
      if (!hasSeenTips) {
        setShowEmailTips(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to subscribe";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismissTips = () => {
    localStorage.setItem("guiding-hand-email-tips-seen", "true");
    setShowEmailTips(false);
  };

  if (!person) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <ModeToggle />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
        <ModeToggle />
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4 mb-2">
            <CardTitle className="text-xl">Track {person.name}</CardTitle>
            <StatusBadge status={person.status} />
          </div>
          <CardDescription>
            Get notified when a match is found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle2 className="size-16 text-primary mx-auto mb-6" />
              <p className="text-xl font-semibold mb-3">All set!</p>
              <p className="text-muted-foreground">
                You&apos;ll receive email notifications for matches found for {person.name}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className="text-base"
                  autoFocus
                />
              </div>
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <XCircle className="size-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-base h-11"
              >
                {isSubmitting ? "Subscribing…" : "Subscribe"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Dialog open={showEmailTips} onOpenChange={setShowEmailTips}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="size-5 text-primary" />
              Email Tips
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Check spam folder</p>
                <p className="text-sm text-muted-foreground">
                  Emails may arrive in spam. Check there if you don&apos;t see it.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Search your email</p>
                <p className="text-sm text-muted-foreground">
                  Search for &quot;Guiding Hand&quot; to find notifications.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Automatic alerts</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll be notified when high-confidence matches are found.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleDismissTips} variant="default">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

