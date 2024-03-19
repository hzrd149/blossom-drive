import { get, writable } from "svelte/store";
import { activeUser, signEventTemplate } from "./ndk";
import { servers } from "./servers";
import { BlossomClient, type BlobDescriptor, HTTPError, type SignedEvent } from "blossom-client";

type ServerList = {
  server: string;
  blobs: BlobDescriptor[];
};

export const blobs = writable<ServerList[]>([]);

let listAuth: SignedEvent | undefined = undefined;
export async function refreshBlobs(urls: string[] = get(servers), retry = true) {
  console.log("Loading blobs");

  // remove the list auth when it expires
  if (listAuth) {
    const expiration = listAuth.tags.find((t) => t[0] === "expiration")?.[1];
    if (expiration && parseInt(expiration) < Date.now() / 1000) listAuth = undefined;
  }

  const user = get(activeUser);

  let needAuth: string[] = [];
  for (const server of urls) {
    try {
      const res = await BlossomClient.listBlobs(server, user.pubkey, {}, listAuth);
      blobs.update((arr) => arr.filter((v) => v.server !== server).concat({ server, blobs: res }));
    } catch (e) {
      console.log(`Failed to get blobs from ${server}`);
      console.log(e);

      if (e instanceof HTTPError && e.status === 401 && !listAuth) needAuth.push(server);
    }
  }

  if (needAuth.length > 0 && retry) {
    console.log("Asking user for list auth");
    listAuth = await BlossomClient.getListAuth(signEventTemplate, "List Blobs");

    // retry with auth
    await refreshBlobs(needAuth, false);
  }
}

servers.subscribe((servers) => refreshBlobs(servers));