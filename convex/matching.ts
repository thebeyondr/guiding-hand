import { v } from "convex/values";
import { internalAction } from "./_generated/server";
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

export const createReferencedMatch = internalAction({
  args: {
    missingPersonId: v.id("missingPersons"),
    foundPersonId: v.id("foundPersons"),
  },
  handler: async (ctx, args) => {
    // Check if match already exists
    const existingMatch = await ctx.runQuery(internal.matches.findByPersons, {
      missingPersonId: args.missingPersonId,
      foundPersonId: args.foundPersonId,
    });

    if (!existingMatch) {
      // Create match with 78% confidence - moderate confidence reflecting user's explicit reference
      // Still requires validation to reach 85% threshold for notification
      await ctx.runMutation(internal.matches.internalCreate, {
        missingPersonId: args.missingPersonId,
        foundPersonId: args.foundPersonId,
        confidenceScore: 78,
      });
    }
  },
});

export const matchFoundPerson = internalAction({
  args: {
    foundPersonId: v.id("foundPersons"),
  },
  handler: async (ctx, args) => {
    const foundPerson = await ctx.runQuery(internal.foundPersons.internalGet, {
      id: args.foundPersonId,
    });

    if (!foundPerson) return;

    // Get all active missing persons
    const missingPersons = await ctx.runQuery(internal.missingPersons.internalList, {
      status: "missing",
    });

    for (const missingPerson of missingPersons) {
      let confidenceScore = 0;

      // Exact match on TRN/NIN/Passport = 100%
      if (foundPerson.trn && missingPerson.trn && foundPerson.trn === missingPerson.trn) {
        confidenceScore = 100;
      } else if (foundPerson.nin && missingPerson.nin && foundPerson.nin === missingPerson.nin) {
        confidenceScore = 100;
      } else if (foundPerson.passport && missingPerson.passport && foundPerson.passport === missingPerson.passport) {
        confidenceScore = 100;
      }
      // Name + DOB match = 90%
      else if (
        missingPerson.dateOfBirth &&
        foundPerson.dateOfBirth &&
        missingPerson.dateOfBirth === foundPerson.dateOfBirth
      ) {
        const nameSim = nameSimilarity(foundPerson.name, missingPerson.name);
        if (nameSim > 0.8) {
          confidenceScore = 90;
        } else if (nameSim > 0.6) {
          confidenceScore = 70; // Fuzzy name + DOB
        }
      }
      // Name + physical description + location = 75%
      else {
        const nameSim = nameSimilarity(foundPerson.name, missingPerson.name);
        if (nameSim > 0.7) {
          let matchFactors = 0;
          let totalFactors = 0;

          if (foundPerson.height && missingPerson.height) {
            totalFactors++;
            if (foundPerson.height === missingPerson.height) matchFactors++;
          }
          if (foundPerson.skinTone && missingPerson.skinTone) {
            totalFactors++;
            if (foundPerson.skinTone === missingPerson.skinTone) matchFactors++;
          }
          if (foundPerson.hairColor && missingPerson.hairColor) {
            totalFactors++;
            if (foundPerson.hairColor === missingPerson.hairColor) matchFactors++;
          }
          if (foundPerson.foundLocationParish === missingPerson.lastKnownLocationParish) {
            totalFactors++;
            matchFactors++;
          }

          if (totalFactors > 0 && matchFactors / totalFactors > 0.6) {
            confidenceScore = 75;
          } else if (nameSim > 0.6 && missingPerson.dateOfBirth && foundPerson.dateOfBirth) {
            confidenceScore = 70; // Fuzzy name + DOB only
          }
        }
      }

      // Create match record if confidence > 70%
      if (confidenceScore >= 70) {
        await ctx.runMutation(internal.matches.internalCreate, {
          missingPersonId: missingPerson._id,
          foundPersonId: args.foundPersonId,
          confidenceScore,
        });

        // Auto-notify if >85% confidence
        if (confidenceScore > 85) {
          await ctx.runAction(internal.notifications.notifyMatch, {
            missingPersonId: missingPerson._id,
            foundPersonId: args.foundPersonId,
            confidenceScore,
          });
        }
      }
    }
  },
});
