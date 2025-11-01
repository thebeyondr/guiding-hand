"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { HomeMasthead } from "@/components/HomeMasthead";
import { HomeActions } from "@/components/HomeActions";
import { MissingPersonFilters } from "@/components/MissingPersonFilters";
import { MissingPersonGrid } from "@/components/MissingPersonGrid";

export default function Home() {
  const [parish, setParish] = useState<string>("all");
  const [searchName, setSearchName] = useState<string>("");
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

  const hasActiveFilters = Boolean(searchName || (parish && parish !== "all"));

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <HomeMasthead />
        <HomeActions />
        <MissingPersonFilters
          searchName={searchName}
          parish={parish}
          onSearchChange={setSearchName}
          onParishChange={setParish}
        />
        <MissingPersonGrid
          missingPersons={missingPersons}
          filteredPersons={filteredPersons}
          hasActiveFilters={hasActiveFilters}
          onShare={handleShare}
          copiedShareId={copiedShareId}
        />
      </div>
    </div>
  );
}
