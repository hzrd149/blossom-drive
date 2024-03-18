import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import { writable } from "svelte/store";
import type { EventTemplate, SignedEvent } from "blossom-client";
import { NDKEvent, NDKNip07Signer, NDKNip46Signer, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { generateSecretKey } from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils";

const cacheAdapter = new NDKCacheAdapterDexie({ dbName: "ndk-cache" });

export const ndk = new NDKSvelte({
  explicitRelayUrls: ["wss://nostrue.com/", "wss://relay.damus.io/", "wss://nos.lol/"],
  cacheAdapter,
});

export const activeUser = writable(ndk.activeUser);

export async function fetchUserData() {
  if (!ndk.signer) return;

  console.log("Fetching user");
  const user = await ndk.signer.user();
  console.log("Fetching profile");
  user.fetchProfile();
  activeUser.set(user);
}

export async function loginWithExtension() {
  const signer: NDKNip07Signer = new NDKNip07Signer();
  console.log("Waiting for NIP-07 signer");
  await signer.blockUntilReady();
  await signer.user();
  ndk.signer = signer;

  await fetchUserData();
}

export async function loginWithNostrAddress(address: string) {
  const user = await ndk.getUserFromNip05(address);
  if (!user?.pubkey) throw new Error("Cant find user");
  console.log("Found user", user);

  const localKey = localStorage.getItem(user.pubkey + "-local-signer") || bytesToHex(generateSecretKey());
  const localSigner = new NDKPrivateKeySigner(localKey);

  const signer: NDKNip46Signer = new NDKNip46Signer(ndk, address, localSigner);

  // manually set remote user and pubkey
  signer.remoteUser = user;
  signer.remotePubkey = user.pubkey;

  signer.rpc.on("authUrl", (url: string) => {
    window.open(url, "_blank");
  });

  await signer.blockUntilReady();
  await signer.user();
  ndk.signer = signer;
  localStorage.setItem(user.pubkey + "-local-signer", localKey);

  await fetchUserData();
}

export function logout() {
  localStorage.clear();
  location.reload();
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

const autoLogin = localStorage.getItem("auto-login");
if (autoLogin === "nip07") {
  await loginWithExtension().catch(() => {});
} else if (autoLogin?.includes("@")) {
  await loginWithNostrAddress(autoLogin).catch(() => {});
}
