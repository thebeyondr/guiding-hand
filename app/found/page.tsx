"use client";

import { ReportForm } from "@/components/ReportForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState, Suspense } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { toast } from "sonner";

function ReportFoundContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referenceParam = searchParams.get("reference");
  const [initialReference, setInitialReference] = useState<Id<"missingPersons"> | null>(null);

  useEffect(() => {
    if (referenceParam) {
      setInitialReference(referenceParam as Id<"missingPersons">);
    }
  }, [referenceParam]);

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
          <CardTitle>Report Found Person</CardTitle>
          <CardDescription>
            Share information about someone you&apos;ve found. If you saw a missing person report, you can reference it to help us link them faster. We&apos;ll automatically check for matches with missing persons.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportForm
            type="found"
            initialReferencedMissingPersonId={initialReference}
            onSuccess={() => {
              toast.success("Report submitted!", {
                description: "We&apos;re checking for matches and will notify relevant parties if we find any.",
              });
              setTimeout(() => router.push("/"), 2000);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportFoundPage() {
  return (
    <Suspense fallback={
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
            <CardTitle>Report Found Person</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <ReportFoundContent />
    </Suspense>
  );
}

