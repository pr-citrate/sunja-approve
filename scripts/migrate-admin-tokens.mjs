import { migrateAdminTokens } from "../src/lib/server/xataMaintenance.js";

try {
const removeLegacy = process.env.REMOVE_LEGACY === "1" || process.env.REMOVE_LEGACY === "true";
const result = await migrateAdminTokens({ removeLegacy });
console.log(
  `Migration summary (legacy ${removeLegacy ? "removed" : "retained"}):`,
  result
);
} catch (error) {
  console.error("Failed to migrate admin tokens:", error);
  process.exitCode = 1;
}
