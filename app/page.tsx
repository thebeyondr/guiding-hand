"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, CheckCircle, Search as SearchIcon, Users, CheckCircle2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { JAMAICAN_PARISHES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { motion, AnimatePresence } from "motion/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [parish, setParish] = useState<string>("all");
  const [searchName, setSearchName] = useState<string>("");
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const handleShare = async (personId: string, personName: string, location: string) => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/person/${personId}` : "";
    const shareData = {
      title: `${personName} - Missing Person`,
      text: `Help find ${personName}. Last seen in ${location}.`,
      url,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    } else {
      // Fallback to copy
      try {
        await navigator.clipboard.writeText(url);
        setCopiedShareId(personId);
        toast.success("Link copied!", {
          description: "Share this link to help spread the word.",
        });
        setTimeout(() => setCopiedShareId(null), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy link");
      }
    }
  };

  const missingPersons = useQuery(
    api.missingPersons.list,
    parish && parish !== "all" ? { parish } : {}
  );

  const filteredPersons = missingPersons?.filter((person) => {
    if (!searchName) return true;
    return person.name.toLowerCase().includes(searchName.toLowerCase());
  });

  const hasActiveFilters = searchName || (parish && parish !== "all");

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Masthead */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">Guiding Hand</h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Can&apos;t find someone after Hurricane Melissa or another disaster? Report missing or found persons in Jamaica, and get notified automatically when there&apos;s a match.
              </p>
            </div>
            <div className="flex items-start gap-4 relative">
              <Collapsible open={howItWorksOpen} onOpenChange={setHowItWorksOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    How It Works
                    <ChevronDown
                      className={`size-4 transition-transform ${
                        howItWorksOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="absolute top-full right-0 mt-2 z-50 w-full md:w-96">
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="shadow-lg">
                      <CardContent className="pt-6 space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">1. Report Missing Person</h3>
                          <p className="text-sm text-muted-foreground">
                            Submit details including name, identification numbers (TRN, NIN, Passport), physical description,
                            and last known location by parish.
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">2. Report Found Person</h3>
                          <p className="text-sm text-muted-foreground">
                            When someone is found, submit their information. Our system automatically matches against
                            all missing person reports using fuzzy matching algorithms.
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">3. Get Notified</h3>
                          <p className="text-sm text-muted-foreground">
                            If you&apos;re tracking a missing person and a match is found with high confidence (&gt;85%),
                            you&apos;ll receive an email notification automatically.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>
              <ModeToggle />
            </div>
          </div>
        </motion.div>

        {/* Reporting Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid sm:grid-cols-2 gap-3 mb-6 pb-6 border-b"
        >
          <Button asChild className="w-full h-11">
            <Link href="/report" className="flex items-center justify-center gap-2">
              <UserPlus className="size-4" />
              Report Missing Person
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-11">
            <Link href="/found" className="flex items-center justify-center gap-2">
              <CheckCircle className="size-4" />
              Report Found Person
            </Link>
          </Button>
        </motion.div>

        {/* Search & Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Input
              id="search"
              type="text"
              placeholder="Search by name…"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              autoFocus
              className="text-base focus-visible:ring-4 focus-visible:ring-blue-500/60 focus-visible:border-blue-500"
              aria-label="Search missing persons by name"
            />

            <Select value={parish} onValueChange={setParish}>
              <SelectTrigger id="parish" className="text-base focus-visible:ring-4 focus-visible:ring-blue-500/60 focus-visible:border-blue-500" aria-label="Filter by parish">
                <SelectValue placeholder="All parishes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-base">
                  All parishes
                </SelectItem>
                {JAMAICAN_PARISHES.map((p) => (
                  <SelectItem key={p} value={p} className="text-base">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchName("");
                  setParish("all");
                }}
              >
                Clear filters
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Missing Persons Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Missing Persons</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {missingPersons === undefined
              ? "Loading..."
              : filteredPersons && filteredPersons.length > 0
              ? `Showing ${filteredPersons.length} ${filteredPersons.length === 1 ? "person" : "people"}`
              : "No missing persons to display"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {missingPersons === undefined ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                    <Skeleton className="h-6 w-1/4 mt-4" />
                    <Skeleton className="h-9 w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : filteredPersons && filteredPersons.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPersons.map((person, index) => {
                const gradientClass =
                  person.status === "missing"
                    ? "bg-gradient-to-br from-background to-destructive/5"
                    : person.status === "pending_verification"
                    ? "bg-gradient-to-br from-background to-muted/30"
                    : "bg-gradient-to-br from-background to-primary/5";

                return (
                  <motion.div
                    key={person._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <motion.div
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      onClick={() => router.push(`/person/${person._id}`)}
                    >
                      <Card className={`flex flex-col h-full ${gradientClass} cursor-pointer transition-shadow hover:shadow-lg`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <CardTitle className="text-lg leading-tight flex-1 min-w-0 pr-2 truncate">{person.name}</CardTitle>
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
                            <span className="text-muted-foreground text-xs font-medium w-24 shrink-0">Date of Birth</span>
                            <span className="text-foreground">{person.dateOfBirth}</span>
                          </div>
                        )}
                        {person.height && (
                          <div className="flex items-end">
                            <span className="text-muted-foreground text-xs font-medium w-24 shrink-0">Height</span>
                            <span className="text-foreground">{person.height}</span>
                          </div>
                        )}
                        {(person.skinTone || person.hairColor) && (
                          <div className="flex items-end">
                            <span className="text-muted-foreground text-xs font-medium w-24 shrink-0">Appearance</span>
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
                            <span className="text-muted-foreground text-xs font-medium w-24 shrink-0">Features</span>
                            <span className="text-foreground leading-relaxed">{person.distinctiveFeatures}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-2 mt-auto space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <Button asChild variant="default" size="sm" className="flex-1">
                            <Link href={`/track/${person._id}`} className="flex items-center justify-center gap-2">
                              Track & Get Notified
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleShare(
                                person._id,
                                person.name,
                                `${person.lastKnownLocationParish}${person.lastKnownLocationCity ? `, ${person.lastKnownLocationCity}` : ""}`
                              );
                            }}
                            className="px-2.5"
                            title="Share"
                          >
                            {copiedShareId === person._id ? (
                              <CheckCircle2 className="size-4 text-primary" />
                            ) : (
                              <Share2 className="size-4" />
                            )}
                          </Button>
                        </div>
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link href={`/found?reference=${person._id}`} className="flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="size-3.5" />
                            Report as Found
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                    </motion.div>
                </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              {hasActiveFilters ? (
                <>
                  <SearchIcon className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No matching results</p>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search filters or clearing your search terms.
                  </p>
                </>
              ) : (
                <>
                  <Users className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No missing persons reports yet</p>
                  <p className="text-muted-foreground">
                    Be the first to report a missing person, or check back later for updates.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
