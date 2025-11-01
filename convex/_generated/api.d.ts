/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as deduplication from "../deduplication.js";
import type * as files from "../files.js";
import type * as foundPersons from "../foundPersons.js";
import type * as matches from "../matches.js";
import type * as matching from "../matching.js";
import type * as missingPersons from "../missingPersons.js";
import type * as notifications from "../notifications.js";
import type * as trackers from "../trackers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  deduplication: typeof deduplication;
  files: typeof files;
  foundPersons: typeof foundPersons;
  matches: typeof matches;
  matching: typeof matching;
  missingPersons: typeof missingPersons;
  notifications: typeof notifications;
  trackers: typeof trackers;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
