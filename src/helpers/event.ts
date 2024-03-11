import { NDKEvent, type NostrEvent } from "@nostr-dev-kit/ndk";
import { ndk } from "../services/ndk";

export function getTagValue(event: {tags: string[][]}, tag: string) {
  return event.tags.find((t) => t[0] === tag)?.[1];
}

export function cloneEvent(event: NDKEvent, kind?: number): NDKEvent;
export function cloneEvent(event: NDKEvent | undefined | null, kind: number): NDKEvent;
export function cloneEvent(event: NDKEvent | undefined | null, kind?: number) {
  const draft = new NDKEvent(ndk);
  draft.kind = event?.kind || kind;
  draft.content = event?.content || "";
  draft.tags = event ? Array.from(event?.tags) : [];
  return draft;
}
