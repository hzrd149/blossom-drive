import type { NDKEvent, NDKTag } from "@nostr-dev-kit/ndk";
import { getTagValue } from "./event";
import type { Blob } from "../services/blobs";

export function getPackName(pack: NDKEvent) {
  return getTagValue(pack, "name");
}
export function getPackSummary(pack: NDKEvent) {
  return getTagValue(pack, "summary");
}
