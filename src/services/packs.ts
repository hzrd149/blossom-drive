import type { NDKEvent, NDKSubscription } from "@nostr-dev-kit/ndk";
import { activeUser, ndk } from "./ndk";
import { writable } from "svelte/store";

let sub: NDKSubscription;
activeUser.subscribe((user) => {
  if (sub) sub.stop();
  if (!user) return;

  packs.set({});
  sub = ndk.subscribe({ kinds: [30063 as number], authors: [user.pubkey] });
  sub.on("event", (event: NDKEvent) => {
    const d = event.tags.find((t) => t[0] === "d")?.[1];
    if (d) packs.update((dir) => ({ ...dir, [d]: event }));
  });
  sub.start();
});

export const packs = writable<Record<string, NDKEvent>>({});
