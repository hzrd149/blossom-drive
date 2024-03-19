import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import { writable } from "svelte/store";
import type { EventTemplate, SignedEvent } from "blossom-client";
import { NDKEvent, NDKNip07Signer, NDKNip46Signer, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { generateSecretKey, nip19 } from "nostr-tools";
import { decrypt } from "nostr-tools/nip49";
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

export async function loginWithNostrAddress(connectionString: string) {
  const localKey = localStorage.getItem("local-signer") || bytesToHex(generateSecretKey());
  const localSigner = new NDKPrivateKeySigner(localKey);

  let signer: NDKNip46Signer;

  // manually set remote user and pubkey if using NIP05
  if (connectionString.includes("@")) {
    const user = await ndk.getUserFromNip05(connectionString);
    if (!user?.pubkey) throw new Error("Cant find user");
    console.log("Found user", user);

    signer = new NDKNip46Signer(ndk, connectionString, localSigner);

    signer.remoteUser = user;
    signer.remotePubkey = user.pubkey;
  } else if (connectionString.startsWith("bunker://")) {
    const uri = new URL(connectionString);

    const pubkey = uri.host || uri.pathname.replace("//", "");
    const relays = uri.searchParams.getAll("relay");
    for (let relay of relays) ndk.addExplicitRelay(relay);
    if (relays.length === 0) throw new Error("Missing relays");
    signer = new NDKNip46Signer(ndk, pubkey, localSigner);
    signer.relayUrls = relays;
  } else {
    signer = new NDKNip46Signer(ndk, connectionString, localSigner);
  }

  signer.rpc.on("authUrl", (url: string) => {
    window.open(url, "_blank");
  });

  await signer.blockUntilReady();
  await signer.user();
  ndk.signer = signer;
  localStorage.setItem("local-signer", localSigner.privateKey ?? "");

  await fetchUserData();
}

export async function loginWithPrivateKey(key: string) {
  if (key.startsWith("ncryptsec")) {
    const password = prompt("Enter your private key password");
    if (password === null) throw new Error("No password provided");
    const plaintext = bytesToHex(decrypt(key, password));
    console.log(plaintext);

    ndk.signer = new NDKPrivateKeySigner(plaintext);
    await ndk.signer.blockUntilReady();
    localStorage.setItem("private-key", key);
  } else if (key.startsWith("nsec")) {
    const decoded = nip19.decode(key);
    if (decoded.type !== "nsec") throw new Error("Not nsec");
    ndk.signer = new NDKPrivateKeySigner(bytesToHex(decoded.data));
    await ndk.signer.blockUntilReady();
  } else throw new Error("Unknown private format");

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
if (autoLogin) {
  try {
    if (autoLogin === "nip07") {
      await loginWithExtension().catch(() => {});
    } else if (autoLogin === "nsec") {
      const key = localStorage.getItem("private-key");
      if (key) await loginWithPrivateKey(key);
    } else if (autoLogin.includes("@") || autoLogin.startsWith("bunker://") || autoLogin.includes("#")) {
      await loginWithNostrAddress(autoLogin).catch(() => {});
    }
  } catch (e) {}
}
