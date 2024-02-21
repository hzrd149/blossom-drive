import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import { writable } from "svelte/store";
import type { EventTemplate, SignedEvent } from "blossom-client";
import { NDKEvent, NDKNip07Signer } from "@nostr-dev-kit/ndk";

const cacheAdapter = new NDKCacheAdapterDexie({ dbName: "ndk-cache" });

export const ndk = new NDKSvelte({
  explicitRelayUrls: ["wss://nostrue.com/", "wss://relay.damus.io/", "wss://nos.lol/"],
  cacheAdapter,
});

export const activeUser = writable(ndk.activeUser);

export async function loginWithExtension() {
  const signer: NDKNip07Signer = (ndk.signer = new NDKNip07Signer());
  await signer.blockUntilReady();
  const user = await signer.user();
  await user.fetchProfile();
  await user.relayList();
  activeUser.set(user);
}

export async function signEventTemplate(template: EventTemplate): Promise<SignedEvent> {
  const e = new NDKEvent(ndk);
  e.kind = template.kind;
  e.content = template.content;
  e.tags = template.tags;
  e.created_at = template.created_at;
  await e.sign();
  return e.rawEvent() as SignedEvent;
}

ndk.connect();

if (import.meta.env.DEV) {
  //@ts-ignore
  window.ndk = ndk;
}

if (localStorage.getItem("auto-login") === "true") {
  await loginWithExtension();
}
