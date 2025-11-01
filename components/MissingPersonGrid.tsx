"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MissingPersonCard } from "./MissingPersonCard";
import { SampleMissingPersonCard } from "./SampleMissingPersonCard";
import { Id } from "@/convex/_generated/dataModel";

type MissingPerson = {
  _id: Id<"missingPersons">;
  name: string;
  dateOfBirth?: string;
  height?: string;
  skinTone?: string;
  hairColor?: string;
  distinctiveFeatures?: string;
  lastKnownLocationParish: string;
  lastKnownLocationCity?: string;
  status: "missing" | "pending_verification" | "resolved";
};

interface MissingPersonGridProps {
  missingPersons: MissingPerson[] | undefined;
  filteredPersons: MissingPerson[] | null | undefined;
  hasActiveFilters: boolean;
  onShare: (personId: string, personName: string, location: string) => void;
  copiedShareId: string | null;
}

export function MissingPersonGrid({
  missingPersons,
  filteredPersons,
  hasActiveFilters,
  onShare,
  copiedShareId,
}: MissingPersonGridProps) {
  return (
    <>
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
            {filteredPersons.map((person, index) => (
              <MissingPersonCard
                key={person._id}
                person={person}
                index={index}
                onShare={onShare}
                copiedShareId={copiedShareId}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {hasActiveFilters ? (
              <div className="text-center py-12">
                <SearchIcon className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No matching results</p>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search filters or clearing your search terms.
                </p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Example card — only shows information you provide. You only need name, parish, and email to submit.
                  </p>
                  <SampleMissingPersonCard />
                </div>
                <div className="flex flex-col items-center justify-center py-12 lg:py-0">
                  <Users className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No missing persons reports yet</p>
                  <p className="text-muted-foreground text-center">
                    Be the first to report a missing person, or check back later for updates.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

