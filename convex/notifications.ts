import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const notifyMatch = internalAction({
  args: {
    missingPersonId: v.id("missingPersons"),
    foundPersonId: v.id("foundPersons"),
    confidenceScore: v.number(),
  },
  handler: async (ctx, args) => {
    // Get missing person details
    const missingPerson = await ctx.runQuery(internal.missingPersons.internalGet, {
      id: args.missingPersonId,
    });

    const foundPerson = await ctx.runQuery(internal.foundPersons.internalGet, {
      id: args.foundPersonId,
    });

    if (!missingPerson || !foundPerson) return;

    // Get all trackers for this missing person
    const trackers = await ctx.runQuery(internal.trackers._listByMissingPerson, {
      missingPersonId: args.missingPersonId,
    });

    // Send email to each verified tracker
    const verifiedTrackers = trackers.filter((t) => t.verified);
    
    for (const tracker of verifiedTrackers) {
      // Find and mark the match as notified
      const match = await ctx.runQuery(internal.matches.findByPersons, {
        missingPersonId: args.missingPersonId,
        foundPersonId: args.foundPersonId,
      });

      // Send email via Resend API route
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/notify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: tracker.email,
            missingPersonName: missingPerson.name,
            foundPersonName: foundPerson.name,
            confidenceScore: args.confidenceScore,
            matchId: match?._id,
          }),
        });

        if (response.ok && match) {
          await ctx.runMutation(internal.matches.markNotified, {
            matchId: match._id,
          });
        }
      } catch (error) {
        console.error("Failed to send notification email:", error);
        // Continue even if email fails - we'll retry later
      }
    }
  },
});
