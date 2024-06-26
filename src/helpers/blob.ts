import { servers } from "../services/servers";
import { get } from "svelte/store";
import { getExtension } from "blossom-drive-sdk";

export function getBlobURL(blob: { sha256: string; type?: string }, server?: string | URL) {
  if (!server) server = get(servers)[0];
  return server ? new URL(blob.sha256 + (blob.type ? getExtension(blob.type) : ""), server).toString() : undefined;
}
