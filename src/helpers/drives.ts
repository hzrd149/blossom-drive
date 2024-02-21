import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { getTagValue } from "./event";

export function getDriveName(drive: NDKEvent) {
  return getTagValue(drive, "name");
}
export function getDriveSummary(drive: NDKEvent) {
  return getTagValue(drive, "summary") || drive.content;
}
