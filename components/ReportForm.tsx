"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState, useEffect } from "react";
import { JAMAICAN_PARISHES } from "@/lib/constants";
import { MissingPersonSearch } from "@/components/MissingPersonSearch";
import { Id } from "@/convex/_generated/dataModel";

type StorageId = Id<"_storage">;
import { toast } from "sonner";
import { XCircle } from "lucide-react";

const reportSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dateOfBirth: z.string().optional(),
  trn: z.string().optional(),
  nin: z.string().optional(),
  passport: z.string().optional(),
  driverLicense: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  skinTone: z.string().optional(),
  hairColor: z.string().optional(),
  distinctiveFeatures: z.string().optional(),
  lastKnownLocationParish: z.string().min(1, "Parish is required"),
  lastKnownLocationCity: z.string().optional(),
  reporterEmail: z.string().email("Valid email is required"),
  reporterPhone: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportFormProps {
  type: "missing" | "found";
  onSuccess?: () => void;
  initialReferencedMissingPersonId?: Id<"missingPersons"> | null;
}

export function ReportForm({ type, onSuccess, initialReferencedMissingPersonId }: ReportFormProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referencedMissingPersonId, setReferencedMissingPersonId] = useState<Id<"missingPersons"> | null>(
    initialReferencedMissingPersonId || null
  );

  // Update referencedMissingPersonId if initialReferencedMissingPersonId changes
  useEffect(() => {
    if (initialReferencedMissingPersonId) {
      setReferencedMissingPersonId(initialReferencedMissingPersonId);
    }
  }, [initialReferencedMissingPersonId]);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createMissing = useMutation(api.missingPersons.create);
  const createFound = useMutation(api.foundPersons.create);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      name: "",
      dateOfBirth: "",
      trn: "",
      nin: "",
      passport: "",
      driverLicense: "",
      height: "",
      weight: "",
      skinTone: "",
      hairColor: "",
      distinctiveFeatures: "",
      lastKnownLocationParish: "",
      lastKnownLocationCity: "",
      reporterEmail: "",
      reporterPhone: "",
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3);
      setPhotos(files);
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Upload photos first
      const photoIds: StorageId[] = [];
      for (const photo of photos) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": photo.type },
          body: photo,
        });
        const { storageId } = await result.json();
        if (storageId) {
          photoIds.push(storageId as StorageId);
        }
      }

      // Clean up empty optional fields
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== "")
      ) as ReportFormData;

      if (type === "missing") {
        const { reporterEmail, reporterPhone, lastKnownLocationParish, lastKnownLocationCity, ...rest } = cleanedData;
        await createMissing({
          ...rest,
          photoIds,
          reporterEmail,
          reporterPhone,
          lastKnownLocationParish,
          lastKnownLocationCity,
        });
      } else {
        const { reporterEmail, reporterPhone, lastKnownLocationParish, lastKnownLocationCity, ...rest } = cleanedData;
        await createFound({
          ...rest,
          photoIds,
          reporterEmail,
          reporterPhone,
          foundLocationParish: lastKnownLocationParish,
          foundLocationCity: lastKnownLocationCity,
          referencedMissingPersonId: referencedMissingPersonId || undefined,
        });
      }

      form.reset();
      setPhotos([]);
      setReferencedMissingPersonId(null);
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit report";
      console.error("Error submitting report:", error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const locationFieldName =
    type === "missing" ? "lastKnownLocationParish" : "lastKnownLocationParish";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {type === "found" && (
          <div className="space-y-2">
            <Label>I saw a missing person report (optional)</Label>
            <FormDescription className="text-sm">
              If you saw a missing person report and believe this is the same person, search for and select it. This helps us link the reports faster.
            </FormDescription>
            <MissingPersonSearch
              onSelect={(id) => setReferencedMissingPersonId(id)}
              selectedId={referencedMissingPersonId}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="John Doe"
                  autoComplete="name"
                  className="text-base"
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  autoComplete="bday"
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="trn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TRN (Tax Registration Number)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="123-456-789"
                    autoComplete="off"
                    className="text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIN (National ID)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="National ID number"
                    autoComplete="off"
                    className="text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="passport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passport Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Passport number"
                    autoComplete="off"
                    className="text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="driverLicense"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver&apos;s License</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="License number"
                    autoComplete="off"
                    className="text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="5'8&quot; or 173 cm"
                    autoComplete="off"
                    className="text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="150 lbs or 68 kg"
                    autoComplete="off"
                    className="text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="skinTone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skin Tone</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., light, medium, dark"
                    autoComplete="off"
                    className="text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hairColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hair Color</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., black, brown, blonde"
                    autoComplete="off"
                    className="text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="distinctiveFeatures"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distinctive Features</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Scars, tattoos, birthmarks, etc."
                  rows={3}
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={locationFieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {type === "missing" ? "Last Known Location - Parish *" : "Found Location - Parish *"}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Select parish" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {JAMAICAN_PARISHES.map((parish) => (
                    <SelectItem key={parish} value={parish} className="text-base">
                      {parish}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastKnownLocationCity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {type === "missing" ? "City/Town (optional)" : "City/Town (optional)"}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="City or town name"
                  autoComplete="address-level2"
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Label htmlFor="photos">Photos (up to 3)</Label>
          <div className="mt-2">
            <Input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="text-base"
            />
            {photos.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {photos.length} photo(s) selected
              </p>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="reporterEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Email *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  {...field}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="text-base"
                />
              </FormControl>
              <FormDescription>
                We&apos;ll use this to contact you with updates
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reporterPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Phone (optional)</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  {...field}
                  placeholder="+1-876-123-4567 or +1-658-123-4567"
                  autoComplete="tel"
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
          <h3 className="font-semibold text-sm">What information is shared?</h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-medium text-foreground mb-1">Anyone can see:</p>
              <ul className="list-disc list-inside space-y-0.5 text-muted-foreground ml-2">
                <li>Name, date of birth, photos</li>
                <li>Physical description (height, skin tone, hair color, distinctive features)</li>
                <li>Last known location (parish and city)</li>
                <li>Status (missing/found/resolved)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Only we keep:</p>
              <ul className="list-disc list-inside space-y-0.5 text-muted-foreground ml-2">
                <li>ID numbers (TRN, NIN, passport, driver&apos;s license)</li>
                <li>Weight</li>
                <li>Your contact information (email and phone)</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t border-border">
              The public information helps others identify the person if they see them. We&apos;ll only use your contact info to reach out if there&apos;s a match or update.
            </p>
          </div>
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
          className="w-full text-base min-h-[44px]"
        >
          {isSubmitting ? "Saving…" : type === "missing" ? "Report Missing Person" : "Report Found Person"}
        </Button>
      </form>
    </Form>
  );
}

