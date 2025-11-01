import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  missingPersons: defineTable({
    // PII fields
    name: v.string(),
    dateOfBirth: v.optional(v.string()), // ISO date string
    trn: v.optional(v.string()), // Tax Registration Number (encrypted)
    nin: v.optional(v.string()), // National ID (encrypted)
    passport: v.optional(v.string()),
    driverLicense: v.optional(v.string()),
    
    // Physical description
    height: v.optional(v.string()),
    weight: v.optional(v.string()),
    skinTone: v.optional(v.string()),
    hairColor: v.optional(v.string()),
    distinctiveFeatures: v.optional(v.string()),
    
    // Location
    lastKnownLocationParish: v.string(), // One of 14 parishes
    lastKnownLocationCity: v.optional(v.string()),
    
    // Photos
    photoIds: v.array(v.id("_storage")), // Convex file storage IDs
    
    // Reporter info
    reporterEmail: v.string(),
    reporterPhone: v.optional(v.string()),
    
    // Metadata
    status: v.union(
      v.literal("missing"),
      v.literal("pending_verification"),
      v.literal("resolved")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_dob", ["dateOfBirth"])
    .index("by_parish", ["lastKnownLocationParish"])
    .index("by_status", ["status"])
    .index("by_reporter_email", ["reporterEmail"]),

  foundPersons: defineTable({
    // Similar PII fields
    name: v.string(),
    dateOfBirth: v.optional(v.string()),
    trn: v.optional(v.string()),
    nin: v.optional(v.string()),
    passport: v.optional(v.string()),
    driverLicense: v.optional(v.string()),
    
    // Physical description
    height: v.optional(v.string()),
    weight: v.optional(v.string()),
    skinTone: v.optional(v.string()),
    hairColor: v.optional(v.string()),
    distinctiveFeatures: v.optional(v.string()),
    
    // Location found
    foundLocationParish: v.string(),
    foundLocationCity: v.optional(v.string()),
    
    // Photos
    photoIds: v.array(v.id("_storage")),
    
    // Reporter info
    reporterEmail: v.string(),
    reporterPhone: v.optional(v.string()),
    
    // Reference to missing person report (if user explicitly referenced one)
    referencedMissingPersonId: v.optional(v.id("missingPersons")),
    
    // Metadata
    status: v.union(
      v.literal("pending_verification"),
      v.literal("verified"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_dob", ["dateOfBirth"])
    .index("by_status", ["status"]),

  trackers: defineTable({
    email: v.string(),
    missingPersonId: v.id("missingPersons"),
    verified: v.boolean(), // Email verified
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_missing_person", ["missingPersonId"])
    .index("by_email_and_person", ["email", "missingPersonId"]),

  matches: defineTable({
    missingPersonId: v.id("missingPersons"),
    foundPersonId: v.id("foundPersons"),
    confidenceScore: v.number(), // 0-100
    verificationStatus: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("rejected")
    ),
    notified: v.boolean(), // Whether trackers have been notified
    createdAt: v.number(),
  })
    .index("by_missing_person", ["missingPersonId"])
    .index("by_found_person", ["foundPersonId"])
    .index("by_confidence", ["confidenceScore"])
    .index("by_status", ["verificationStatus"]),
});

