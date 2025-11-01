import { v } from "convex/values";
import { query } from "./_generated/server";

export const checkDuplicate = query({
  args: {
    name: v.string(),
    dateOfBirth: v.optional(v.string()),
    reporterEmail: v.string(),
  },
  handler: async (ctx, args) => {
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

    return existing !== null;
  },
});

