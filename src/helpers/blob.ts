import { servers } from "../services/servers";
import { get } from "svelte/store";
import mime from "mime";

export function getBlobURL(blob: { sha256: string; type?: string }, server = get(servers)[0]) {
  return server
    ? new URL(blob.sha256 + (blob.type ? "." + mime.getExtension(blob.type) : ""), server).toString()
    : undefined;
}
