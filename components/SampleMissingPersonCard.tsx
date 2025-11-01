"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SampleMissingPersonCard() {
  // Sample data to demonstrate what a card can look like with optional fields
  const samplePerson = {
    name: "Jane Doe",
    dateOfBirth: "1990-05-15",
    height: "5'6\"",
    skinTone: "Brown",
    hairColor: "Black",
    distinctiveFeatures: "Tattoo on right wrist, glasses",
    lastKnownLocationParish: "Westmoreland",
    lastKnownLocationCity: "Savanna-la-Mar",
    status: "missing" as const,
  };

  return (
    <Card className="flex flex-col h-full border-dashed opacity-70 bg-muted/30 cursor-default">
      <CardHeader className="pb-3 relative">
        <span
          className={cn(
            "absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-background/80 backdrop-blur-sm border-muted-foreground/30 text-muted-foreground"
          )}
        >
          Sample
        </span>
        <div className="flex items-start justify-between gap-3 mb-2">
          <CardTitle className="text-lg leading-tight flex-1 min-w-0 pr-2">
            {samplePerson.name}
          </CardTitle>
          <StatusBadge status={samplePerson.status} className="shrink-0" />
        </div>
        <CardDescription className="text-sm">
          {samplePerson.lastKnownLocationParish}
          {samplePerson.lastKnownLocationCity && `, ${samplePerson.lastKnownLocationCity}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4 text-sm">
        <div className="space-y-2.5">
          {samplePerson.dateOfBirth && (
            <div className="flex items-end">
              <span className="text-muted-foreground text-xs font-medium w-24 shrink-0">
                Date of Birth
              </span>
              <span className="text-foreground">{samplePerson.dateOfBirth}</span>
            </div>
          )}
          {samplePerson.height && (
            <div className="flex items-end">
              <span className="text-muted-foreground text-xs font-medium w-24 shrink-0">
                Height
              </span>
              <span className="text-foreground">{samplePerson.height}</span>
            </div>
          )}
          {(samplePerson.skinTone || samplePerson.hairColor) && (
            <div className="flex items-end">
              <span className="text-muted-foreground text-xs font-medium w-24 shrink-0">
                Appearance
              </span>
              <span className="text-foreground">
                {samplePerson.skinTone && samplePerson.hairColor
                  ? `${samplePerson.skinTone} skin tone, ${samplePerson.hairColor} hair`
                  : samplePerson.skinTone
                  ? `${samplePerson.skinTone} skin tone`
                  : `${samplePerson.hairColor} hair`}
              </span>
            </div>
          )}
          {samplePerson.distinctiveFeatures && (
            <div className="flex items-start pt-0.5">
              <span className="text-muted-foreground text-xs font-medium w-24 shrink-0">
                Features
              </span>
              <span className="text-foreground leading-relaxed">
                {samplePerson.distinctiveFeatures}
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 mt-auto space-y-2">
          <div className="flex gap-2">
            <Button variant="default" size="sm" className="flex-1" disabled>
              Track & Get Notified
            </Button>
            <Button variant="ghost" size="sm" className="px-2.5" disabled>
              <Share2 className="size-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="w-full" disabled>
            <CheckCircle2 className="size-3.5 mr-1.5" />
            Report as Found
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

