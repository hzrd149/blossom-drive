import { get } from "svelte/store";
import { drives } from "./drives";
import type Drive from "../blossom-drive-client/Drive";

export type FileResult = { drive: Drive; filename: string; path: string };

export function searchForFiles(search: string): FileResult[] {
  const cleanSearch = search.toLowerCase();
  const matches: FileResult[] = [];
  for (const drive of Object.values(get(drives))) {
    for (const tag of drive.event.tags) {
      if (tag[0] === "x" && tag[2].toLowerCase().includes(cleanSearch)) {
        const parts = tag[2].split("/");
        const filename = parts.pop() ?? "";
        matches.push({ drive, filename, path: parts.join("/") });
      }
    }
  }
  return matches;
}
