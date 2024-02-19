import { get, writable } from "svelte/store";
import { activeUser, ndk } from "./ndk";
import type { NDKEvent, NDKSubscription } from "@nostr-dev-kit/ndk";

let sub: NDKSubscription;
activeUser.subscribe((user) => {
  if (sub) sub.stop();
  if (!user) return;

  sub = ndk.subscribe({ kinds: [10063 as number], authors: [user.pubkey] }, { closeOnEose: false });
  sub.on("event", (event: NDKEvent) => {
    const e = get(serverEvent);
    if (!e || event.created_at! > e.created_at!) {
      console.log("Got new servers", event);

      serverEvent.set(event);
      servers.set(event.tags.filter((t) => t[0] === "r").map((t) => t[1]));
    }
  });
  sub.start();
});

export const serverEvent = writable<NDKEvent | null>(null);
export const servers = writable<string[]>([]);
