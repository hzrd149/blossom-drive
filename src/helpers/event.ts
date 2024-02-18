import type { NDKEvent } from "@nostr-dev-kit/ndk";

export function getTagValue(event: NDKEvent, tag: string) {
  return event.tags.find((t) => t[0] === tag)?.[1];
}
