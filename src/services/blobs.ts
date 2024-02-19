import { get, writable } from "svelte/store";
import { activeUser } from "./ndk";
import { servers } from "./servers";

export type Blob = {
  sha256: string;
  type?: string;
  created: number;
  size: number;
};
type ServerList = {
  server: string;
  blobs: Blob[];
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
      const res = await fetch(new URL("/list?pubkey=" + user.pubkey, server)).then((res) => res.json());
      serverLists.push({ server, blobs: res });
    } catch (e) {}
  }
  blobs.set(serverLists);
}
