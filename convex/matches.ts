import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";

export const create = mutation({
  args: {
    missingPersonId: v.id("missingPersons"),
    foundPersonId: v.id("foundPersons"),
    confidenceScore: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("matches", {
      ...args,
      verificationStatus: "pending",
      notified: false,
      createdAt: now,
    });
  },
});

// Internal version
export const internalCreate = internalMutation({
  args: {
    missingPersonId: v.id("missingPersons"),
    foundPersonId: v.id("foundPersons"),
    confidenceScore: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("matches", {
      ...args,
      verificationStatus: "pending",
      notified: false,
      createdAt: now,
    });
  },
});

export const list = query({
  args: {
    missingPersonId: v.optional(v.id("missingPersons")),
    verificationStatus: v.optional(v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"))),
  },
  handler: async (ctx, args) => {
    if (args.missingPersonId) {
      return await ctx.db
        .query("matches")
        .withIndex("by_missing_person", (q) => q.eq("missingPersonId", args.missingPersonId!))
        .collect();
    }
    if (args.verificationStatus) {
      return await ctx.db
        .query("matches")
        .withIndex("by_status", (q) => q.eq("verificationStatus", args.verificationStatus!))
        .collect();
    }
    return await ctx.db.query("matches").order("desc").collect();
  },
});

export const findByPersons = internalQuery({
  args: {
    missingPersonId: v.id("missingPersons"),
    foundPersonId: v.id("foundPersons"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_missing_person", (q) => q.eq("missingPersonId", args.missingPersonId))
      .filter((q) => q.eq(q.field("foundPersonId"), args.foundPersonId))
      .first();
  },
});

export const markNotified = internalMutation({
  args: {
    matchId: v.optional(v.id("matches")),
  },
  handler: async (ctx, args) => {
    if (!args.matchId) return;
    await ctx.db.patch(args.matchId, {
      notified: true,
    });
  },
});
