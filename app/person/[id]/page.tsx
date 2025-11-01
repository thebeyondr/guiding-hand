"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";
import { ArrowLeft, Share2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "@/components/mode-toggle";
import { useState, useEffect } from "react";
import { motion } from "motion/react";

export default function PersonPage() {
  const params = useParams();
  const id = params.id as Id<"missingPersons">;
  const person = useQuery(api.missingPersons.get, { id });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    if (person) {
      const statusText =
        person.status === "missing"
          ? "Missing"
          : person.status === "pending_verification"
          ? "Pending Verification"
          : "Resolved";
      document.title = `${person.name} - ${statusText} | Guiding Hand`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          `Help find ${person.name}. Last seen in ${person.lastKnownLocationParish}${person.lastKnownLocationCity ? `, ${person.lastKnownLocationCity}` : ""}. ${person.status === "missing" ? "Status: Missing" : person.status === "pending_verification" ? "Status: Pending Verification" : "Status: Resolved"}.`
        );
      }
    } else {
      document.title = "Missing Person | Guiding Hand";
    }
  }, [person]);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: person ? `${person.name} - Missing Person` : "Missing Person",
      text: person
        ? `Help find ${person.name}. Last seen in ${person.lastKnownLocationParish}${person.lastKnownLocationCity ? `, ${person.lastKnownLocationCity}` : ""}.`
        : "Missing Person Report",
      url,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error occurred
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback to copy
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied!", {
          description: "Share this link to help spread the word.",
        });
      } catch (err) {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy link");
      }
    }
  };

  const pageGradient =
    !person
      ? "bg-gradient-to-br from-background via-background to-background"
      : person.status === "missing"
      ? "bg-gradient-to-br from-background via-destructive/10 to-destructive/20"
      : person.status === "pending_verification"
      ? "bg-gradient-to-br from-background via-muted/20 to-muted/40"
      : "bg-gradient-to-br from-background via-primary/10 to-primary/20";

  if (!person) {
    return (
      <div className={`min-h-screen ${pageGradient} transition-colors duration-500`}>
        <div className="container mx-auto py-8 px-4 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
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
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${pageGradient} transition-colors duration-500`}>
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back to Search
            </Link>
          </Button>
          <ModeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3 mb-2">
                <CardTitle className="text-lg leading-tight flex-1 min-w-0 pr-2">
                  {person.name}
                </CardTitle>
                <StatusBadge status={person.status} className="shrink-0" />
              </div>
              <CardDescription className="text-sm">
                {person.lastKnownLocationParish}
                {person.lastKnownLocationCity && `, ${person.lastKnownLocationCity}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4 text-sm">
              <div className="space-y-2.5">
                {person.dateOfBirth && (
                  <div className="flex items-end">
                    <span className="text-muted-foreground text-xs font-medium w-24 shrink-0">
                      Date of Birth
                    </span>
                    <span className="text-foreground">{person.dateOfBirth}</span>
                  </div>
                )}
                {person.height && (
                  <div className="flex items-end">
                    <span className="text-muted-foreground text-xs font-medium w-24 shrink-0">
                      Height
                    </span>
                    <span className="text-foreground">{person.height}</span>
                  </div>
                )}
                {(person.skinTone || person.hairColor) && (
                  <div className="flex items-end">
                    <span className="text-muted-foreground text-xs font-medium w-24 shrink-0">
                      Appearance
                    </span>
                    <span className="text-foreground">
                      {person.skinTone && person.hairColor
                        ? `${person.skinTone} skin tone, ${person.hairColor} hair`
                        : person.skinTone
                        ? `${person.skinTone} skin tone`
                        : `${person.hairColor} hair`}
                    </span>
                  </div>
                )}
                {person.distinctiveFeatures && (
                  <div className="flex items-start pt-0.5">
                    <span className="text-muted-foreground text-xs font-medium w-24 shrink-0">
                      Features
                    </span>
                    <span className="text-foreground leading-relaxed">
                      {person.distinctiveFeatures}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 mt-auto space-y-2">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="size-4 mr-2" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="size-4 mr-2" />
                      Share This Person
                    </>
                  )}
                </Button>
                <Button asChild variant="default" size="sm" className="w-full">
                  <Link href={`/track/${person._id}`} className="flex items-center justify-center gap-2">
                    Track & Get Notified
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link
                    href={`/found?reference=${person._id}`}
                    className="flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="size-3.5" />
                    Report as Found
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

