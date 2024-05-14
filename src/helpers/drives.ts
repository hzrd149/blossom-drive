import type { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
import type { EventTemplate } from "nostr-tools";

import { getTagValue } from "./event";

export function getDriveName(drive: NDKEvent | NostrEvent | EventTemplate) {
  return getTagValue(drive, "name");
}
export function getDriveSummary(drive: NDKEvent | NostrEvent | EventTemplate) {
  return getTagValue(drive, "summary") || drive.content;
}
