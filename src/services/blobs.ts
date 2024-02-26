import { get, writable } from "svelte/store";
import { activeUser } from "./ndk";
import { servers } from "./servers";
import { BlossomClient, type BlobDescriptor } from "blossom-client";

type ServerList = {
  server: string;
  blobs: BlobDescriptor[];
};

export const blobs = writable<ServerList[]>([]);

servers.subscribe(async (servers) => {
  refreshBlobs(servers);
});

export async function refreshBlobs(urls: string[] = get(servers)) {
  console.log("Loading blobs");

  const user = get(activeUser);
  const serverLists: ServerList[] = [];

  for (const server of urls) {
    try {
      const res = await BlossomClient.listBlobs(server, user.pubkey);
      serverLists.push({ server, blobs: res });
    } catch (e) {}
  }
  blobs.set(serverLists);
}
