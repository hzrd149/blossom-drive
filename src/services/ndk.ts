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
  console.log("Waiting for NIP-07 signer");
  await signer.blockUntilReady();
  console.log("Fetching user");
  const user = await signer.user();
  console.log("Fetching profile");
  user.fetchProfile();
  console.log("Fetching relay list");
  user.relayList();
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

export async function publishSignedEvent(signedEvent: SignedEvent) {
  const e = new NDKEvent(ndk);
  e.content = signedEvent.content;
  e.tags = signedEvent.tags;
  e.created_at = signedEvent.created_at;
  e.kind = signedEvent.kind;
  e.id = signedEvent.id;
  e.pubkey = signedEvent.pubkey;
  e.sig = signedEvent.sig;
  await e.publish();
}

ndk.connect();

if (import.meta.env.DEV) {
  //@ts-ignore
  window.ndk = ndk;
}

if (localStorage.getItem("auto-login") === "true") {
  await loginWithExtension().catch(() => {});
}
