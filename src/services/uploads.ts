import { writable } from "svelte/store";
import type Upload from "../blossom-drive-client/Upload";

export const drawerOpen = writable(false);
export const uploads = writable<Upload[]>([]);

export function addUpload(upload: Upload) {
  uploads.update((arr) => [...arr, upload]);
  upload.upload();
}
