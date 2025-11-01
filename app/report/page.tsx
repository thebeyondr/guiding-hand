"use client";

import { ReportForm } from "@/components/ReportForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ReportMissingPage() {
  const router = useRouter();
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
          <CardTitle>Report Missing Person</CardTitle>
          <CardDescription>
            Share what you know about a missing person. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportForm
            type="missing"
            onSuccess={() => {
              toast.success("Report submitted!", {
                description: "We'll notify you if there are any matches.",
              });
              setTimeout(() => router.push("/"), 2000);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

