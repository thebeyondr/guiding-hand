import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

// Simple Levenshtein distance for fuzzy name matching
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1].toLowerCase() === str2[j - 1].toLowerCase() ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

function nameSimilarity(name1: string, name2: string): number {
  const distance = levenshteinDistance(name1.toLowerCase(), name2.toLowerCase());
  const maxLen = Math.max(name1.length, name2.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

// Flexible validation: check if found person details match missing person
// Returns true if there's reasonable match on name/physical attributes
function validateReferencedMatch(foundPerson: any, missingPerson: any): boolean {
  // Name similarity (fuzzy match, allow aliases/spelling variations)
  const nameSim = nameSimilarity(foundPerson.name, missingPerson.name);
  if (nameSim < 0.6) {
    return false; // Name too different
  }

  // Check physical attributes - allow missing optional fields and minor variations
  let matchFactors = 0;
  let totalFactors = 0;

  // Height (allow some variation)
  if (foundPerson.height && missingPerson.height) {
    totalFactors++;
    if (foundPerson.height === missingPerson.height) {
      matchFactors++;
    }
  }

  // Skin tone
  if (foundPerson.skinTone && missingPerson.skinTone) {
    totalFactors++;
    if (foundPerson.skinTone.toLowerCase() === missingPerson.skinTone.toLowerCase()) {
      matchFactors++;
    }
  }

  // Hair color
  if (foundPerson.hairColor && missingPerson.hairColor) {
    totalFactors++;
    if (foundPerson.hairColor.toLowerCase() === missingPerson.hairColor.toLowerCase()) {
      matchFactors++;
    }
  }

  // If we have physical attributes, at least one should match
  // If no physical attributes, rely on name similarity
  if (totalFactors > 0) {
    return matchFactors / totalFactors >= 0.5 || nameSim > 0.8;
  }

  // No physical attributes - rely on name similarity alone (must be strong)
  return nameSim > 0.75;
}

export const create = mutation({
  args: {
    name: v.string(),
    dateOfBirth: v.optional(v.string()),
    trn: v.optional(v.string()),
    nin: v.optional(v.string()),
    passport: v.optional(v.string()),
    driverLicense: v.optional(v.string()),
    height: v.optional(v.string()),
    weight: v.optional(v.string()),
    skinTone: v.optional(v.string()),
    hairColor: v.optional(v.string()),
    distinctiveFeatures: v.optional(v.string()),
    foundLocationParish: v.string(),
    foundLocationCity: v.optional(v.string()),
    photoIds: v.array(v.id("_storage")),
    reporterEmail: v.string(),
    reporterPhone: v.optional(v.string()),
    referencedMissingPersonId: v.optional(v.id("missingPersons")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // If referencedMissingPersonId is provided, validate the match
    if (args.referencedMissingPersonId) {
      const missingPerson = await ctx.db.get(args.referencedMissingPersonId);
      if (!missingPerson || missingPerson.status !== "missing") {
        throw new Error("Referenced missing person not found or no longer missing");
      }

      // Validate that details match using flexible validation
      const isValid = validateReferencedMatch(args, missingPerson);
      if (!isValid) {
        throw new Error("Found person details do not match the referenced missing person report");
      }
    }

    const id = await ctx.db.insert("foundPersons", {
      ...args,
      status: "pending_verification",
      createdAt: now,
      updatedAt: now,
    });

    // If referencedMissingPersonId is provided and validated, create match with 75-80% confidence
    if (args.referencedMissingPersonId) {
      // Use 78% as moderate confidence - reflects user's explicit reference but requires validation
      await ctx.scheduler.runAfter(0, internal.matching.createReferencedMatch, {
        missingPersonId: args.referencedMissingPersonId,
        foundPersonId: id,
      });
    }

    // Still trigger normal matching logic (may find additional matches or boost confidence)
    await ctx.scheduler.runAfter(0, internal.matching.matchFoundPerson, {
      foundPersonId: id,
    });

    return id;
  },
});

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("pending_verification"), v.literal("verified"), v.literal("rejected"))),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("foundPersons")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("foundPersons").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("foundPersons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Internal version for use in actions
export const internalGet = internalQuery({
  args: { id: v.id("foundPersons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("foundPersons"),
    status: v.union(v.literal("pending_verification"), v.literal("verified"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
