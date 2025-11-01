"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { motion } from "motion/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function HomeMasthead() {
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  return (
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
  );
}

