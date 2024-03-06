import type { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
import { getTagValue } from "./event";

export function getDriveName(drive: NDKEvent|NostrEvent) {
  return getTagValue(drive, "name");
}
export function getDriveSummary(drive: NDKEvent|NostrEvent) {
  return getTagValue(drive, "summary") || drive.content;
}
