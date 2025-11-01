"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Share2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { motion } from "motion/react";
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

interface MissingPersonCardProps {
  person: MissingPerson;
  index: number;
  onShare: (personId: string, personName: string, location: string) => void;
  copiedShareId: string | null;
}

export function MissingPersonCard({
  person,
  index,
  onShare,
  copiedShareId,
}: MissingPersonCardProps) {
  const router = useRouter();

  const gradientClass =
    person.status === "missing"
      ? "bg-gradient-to-br from-background to-destructive/5"
      : person.status === "pending_verification"
      ? "bg-gradient-to-br from-background to-muted/30"
      : "bg-gradient-to-br from-background to-primary/5";

  const location = `${person.lastKnownLocationParish}${person.lastKnownLocationCity ? `, ${person.lastKnownLocationCity}` : ""}`;

  return (
    <motion.div
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
              <CardTitle className="text-lg leading-tight flex-1 min-w-0 pr-2 truncate">
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
                    onShare(person._id, person.name, location);
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
    </motion.div>
  );
}

