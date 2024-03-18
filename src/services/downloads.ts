import { writable } from "svelte/store";
import type { MultiDownload } from "../helpers/multi-download";
import type Drive from "../blossom-drive-client/Drive";
import { EncryptedDrive } from "../blossom-drive-client/EncryptedDrive";
import type { Path } from "../blossom-drive-client/FileTree/methods";

export const drawerOpen = writable(false);
export const downloads = writable<MultiDownload[]>([]);

export function addDownload(download: MultiDownload) {
  downloads.update((arr) => [...arr, download]);
}

const cache = new Map<string, File>();
export async function getOrDownloadFile(drive: Drive, path: Path, additionalServers: string[]) {
  const file = drive.getFile(path);

  let download = cache.get(file.sha256);
  if (!download) {
    const d = await drive.downloadFile(file.path, additionalServers);
    if (!d) throw new Error("Failed to download file");
    cache.set(file.sha256, d);
    download = d;
  }

  return download;
}

const URLCache = new Map<string, string>();
export async function getLocalFileURL(drive: Drive, path: Path, additionalServers: string[]) {
  const file = drive.getFile(path);

  if (drive instanceof EncryptedDrive) {
    let url = URLCache.get(file.sha256);
    if (!url) {
      let download = await getOrDownloadFile(drive, path, additionalServers);
      url = URL.createObjectURL(download);
      URLCache.set(file.sha256, url);
    }
    return url;
  } else {
    return drive.getFileURL(file.path, additionalServers);
  }
}

export function clearCache() {
  for (const [_, url] of URLCache) {
    URL.revokeObjectURL(url);
  }
  URLCache.clear();
  cache.clear();
}
