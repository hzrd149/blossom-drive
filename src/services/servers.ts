import { get, writable } from "svelte/store";
import type { NDKEvent, NDKSubscription } from "@nostr-dev-kit/ndk";
import { getServersFromServerListEvent } from "blossom-client-sdk";

import { activeUser, ndk } from "./ndk";

export const serverEvent = writable<NDKEvent | null>(null);
export const servers = writable<URL[]>([]);

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
      servers.set(getServersFromServerListEvent(event));
    }
  });
  sub.start();
});
