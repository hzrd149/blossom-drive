import { get, writable } from "svelte/store";
import type { NDKEvent, NDKSubscription } from "@nostr-dev-kit/ndk";

import { activeUser, ndk } from "./ndk";

export const serverEvent = writable<NDKEvent | null>(null);
export const servers = writable<string[]>([]);

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
      const urls: string[] = [];
      for (const tag of event.tags) {
        if ((tag[0] === "r" || tag[0] === "server") && tag[1]) {
          try {
            urls.push(new URL(tag[1]).toString());
          } catch (e) {}
        }
      }
      servers.set(urls);
    }
  });
  sub.start();
});
