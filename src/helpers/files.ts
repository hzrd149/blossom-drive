import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { getTagValue } from "./event";

export function getFileName(file: NDKEvent) {
  return getTagValue(file, "name");
}
export function getFileSummary(file: NDKEvent) {
  return getTagValue(file, "summary") || file.content;
}
export function getFileHash(file: NDKEvent) {
  return getTagValue(file, "x");
}
