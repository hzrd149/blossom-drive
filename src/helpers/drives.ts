import type { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
import { getTagValue } from "./event";
import type { EventTemplate } from "blossom-client";

export function getDriveName(drive: NDKEvent | NostrEvent | EventTemplate) {
  return getTagValue(drive, "name");
}
export function getDriveSummary(drive: NDKEvent | NostrEvent | EventTemplate) {
  return getTagValue(drive, "summary") || drive.content;
}
