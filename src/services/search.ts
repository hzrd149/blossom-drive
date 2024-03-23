import { get } from "svelte/store";
import { drives } from "./drives";
import { walkTree, type Drive, formatPath } from "blossom-drive-sdk";

export type FileResult = { drive: Drive; filename: string; path: string };

export function searchForFiles(search: string): FileResult[] {
  const cleanSearch = search.toLowerCase();
  const matches: FileResult[] = [];
  for (const drive of Object.values(get(drives))) {
    walkTree(drive.tree, (branch) => {
      if (branch.parent && branch.name.toLowerCase().includes(cleanSearch)) {
        matches.push({ drive, filename: branch.name, path: formatPath(branch.parent.path) });
      }
    });
  }
  return matches;
}
