import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

export const subscribe = mutation({
  args: {
    email: v.string(),
    missingPersonId: v.id("missingPersons"),
  },
  handler: async (ctx, args) => {
    // Check if already tracking
    const existing = await ctx.db
      .query("trackers")
      .withIndex("by_email_and_person", (q) => 
        q.eq("email", args.email).eq("missingPersonId", args.missingPersonId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    const now = Date.now();
    const id = await ctx.db.insert("trackers", {
      email: args.email,
      missingPersonId: args.missingPersonId,
      verified: false, // Will be set to true after email verification
      createdAt: now,
    });

    // TODO: Send verification email
    return id;
  },
});

export const _listByMissingPerson = internalQuery({
  args: {
    missingPersonId: v.id("missingPersons"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trackers")
      .withIndex("by_missing_person", (q) => q.eq("missingPersonId", args.missingPersonId))
      .collect();
  },
});
