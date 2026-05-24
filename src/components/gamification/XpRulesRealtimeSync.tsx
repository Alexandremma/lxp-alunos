import { useXpRulesSync } from "@/hooks/useXpRulesSync";

/** Mount inside QueryClientProvider to keep lesson/trail XP previews in sync with admin. */
export function XpRulesRealtimeSync() {
  useXpRulesSync();
  return null;
}
