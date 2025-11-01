import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { api } from "./_generated/api";

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
    lastKnownLocationParish: v.string(),
    lastKnownLocationCity: v.optional(v.string()),
    photoIds: v.array(v.id("_storage")),
    reporterEmail: v.string(),
    reporterPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check for duplicates (same name + DOB + reporter email within last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const existing = await ctx.db
      .query("missingPersons")
      .withIndex("by_reporter_email", (q) => q.eq("reporterEmail", args.reporterEmail))
      .filter((q) => 
        q.and(
          q.eq(q.field("name"), args.name),
          q.eq(q.field("dateOfBirth"), args.dateOfBirth ?? ""),
          q.gt(q.field("createdAt"), oneDayAgo)
        )
      )
      .first();

    if (existing) {
      throw new Error("A similar report was already submitted recently");
    }

    // Basic rate limiting: check reports in last hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentReports = await ctx.db
      .query("missingPersons")
      .withIndex("by_reporter_email", (q) => q.eq("reporterEmail", args.reporterEmail))
      .filter((q) => q.gt(q.field("createdAt"), oneHourAgo))
      .collect();

    if (recentReports.length >= 5) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    const now = Date.now();
    const id = await ctx.db.insert("missingPersons", {
      ...args,
      status: "missing",
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

export const list = query({
  args: {
    parish: v.optional(v.string()),
    status: v.optional(v.union(v.literal("missing"), v.literal("pending_verification"), v.literal("resolved"))),
  },
  handler: async (ctx, args) => {
    if (args.parish) {
      const parish = args.parish; // Type narrowing
      return await ctx.db
        .query("missingPersons")
        .withIndex("by_parish", (q) => q.eq("lastKnownLocationParish", parish))
        .order("desc")
        .collect();
    }
    
    if (args.status) {
      return await ctx.db
        .query("missingPersons")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }

    return await ctx.db.query("missingPersons").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("missingPersons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Internal version for use in actions
export const internalGet = internalQuery({
  args: { id: v.id("missingPersons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const internalList = internalQuery({
  args: {
    status: v.optional(v.union(v.literal("missing"), v.literal("pending_verification"), v.literal("resolved"))),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("missingPersons")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    }
    return await ctx.db.query("missingPersons").collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("missingPersons"),
    status: v.union(v.literal("missing"), v.literal("pending_verification"), v.literal("resolved")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
