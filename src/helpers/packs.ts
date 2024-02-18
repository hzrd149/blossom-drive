import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { getTagValue } from "./event";

export function getPackName(pack: NDKEvent) {
  return getTagValue(pack, "name");
}
export function getPackSummary(pack: NDKEvent) {
  return getTagValue(pack, "summary");
}
