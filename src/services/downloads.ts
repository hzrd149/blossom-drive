import { writable } from "svelte/store";
import type { MultiDownload } from "../helpers/multi-download";

export const drawerOpen = writable(false);
export const downloads = writable<MultiDownload[]>([]);

export function addDownload(download: MultiDownload) {
  downloads.update((arr) => [...arr, download]);
}
