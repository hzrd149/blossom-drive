import type { NDKEvent, NDKSubscription } from "@nostr-dev-kit/ndk";
import { activeUser, ndk } from "./ndk";
import { writable } from "svelte/store";
import { addDriveEvents } from "./db";

export const drives = writable<Record<string, NDKEvent>>({});

let sub: NDKSubscription;
activeUser.subscribe((user) => {
  if (sub) sub.stop();
  if (!user) return;

  drives.set({});
  sub = ndk.subscribe({ kinds: [30563 as number], authors: [user.pubkey] });
  sub.on("event", handleEvent);
  sub.start();
});

export function handleEvent(event: NDKEvent) {
  const d = event.tags.find((t) => t[0] === "d")?.[1];
  if (d) drives.update((dir) => ({ ...dir, [d]: event }));
}

drives.subscribe(async (dir) => {
  await addDriveEvents(Object.values(dir).map((e) => e.rawEvent()));
  console.log("Saved drives locally");
});
