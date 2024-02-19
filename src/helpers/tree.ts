import type { NDKEvent, NDKTag } from "@nostr-dev-kit/ndk";

export type TreeFile = {
  type: "file";
  name: string;
  hash: string;
  size: number;
  mimeType?: string;
};
export interface TreeFolder {
  [x: string]: TreeFile | TreeFolder;
}

export function cloneTree(tree: TreeFolder) {
  const newTree: TreeFolder = {};
  for (const [key, value] of Object.entries(tree)) {
    newTree[key] = value.type === "file" ? { ...value } : cloneTree(value as TreeFolder);
  }
  return newTree;
}
export function parsePath(path?: string[] | string | null) {
  if (!path) return [];
  return (Array.isArray(path) ? path : path.replace(/^\//, "").split("/")).filter(Boolean);
}
export function getFolder(dir: TreeFolder, path: string[], create = false): TreeFolder {
  const name = path.shift();
  if (!name) return dir;
  if (!dir[name]) dir[name] = {};
  return path.length === 0 ? (dir[name] as TreeFolder) : getFolder(dir[name] as TreeFolder, path, create);
}
export function setFolder(dir: TreeFolder, path: string[] | string, folder: TreeFolder) {
  const parts = parsePath(path);
  const name = parts.pop()!;
  getFolder(dir, parts, true)[name] = folder;
}
export function setFile(dir: TreeFolder, pathname: string | string[], file: Omit<TreeFile, "type" | "name">) {
  const parts = parsePath(pathname);
  const name = parts.pop()!;
  const folder = getFolder(dir, parts);
  return (folder[name] = { ...file, name, type: "file" });
}
export function removeEntry(dir: TreeFolder, pathname: string | string[]) {
  const parts = Array.isArray(pathname) ? pathname : parsePath(pathname);
  const name = parts.pop()!;
  const folder = getFolder(dir, parts);
  delete folder[name];
}
export function moveEntry(dir: TreeFolder, from: string[], to: string[]) {
  const src = Array.from(from);
  const srcName = src.pop()!;
  const entry = getFolder(dir, src)[srcName];

  if (entry.type === "file") {
    setFile(dir, to, entry as TreeFile);
  } else setFolder(dir, to, entry as TreeFolder);
  removeEntry(dir, from);
}
export function getFile(dir: TreeFolder, pathname: string) {
  const parts = parsePath(pathname);
  const name = parts.pop()!;
  const folder = getFolder(dir, parts, true);
  return folder[name] as TreeFile | undefined;
}
export function getFileTree(pack: NDKEvent) {
  const tree: TreeFolder = {};

  for (const tag of pack.tags) {
    if (tag[0] === "x") {
      const [_, hash, pathname, sizeStr, mimeType] = tag;
      const size = parseInt(sizeStr);

      if (hash && pathname && size) {
        const path = parsePath(pathname);
        setFile(tree, path, { size, hash, mimeType });
      }
    }
    if (tag[0] === "folder") getFolder(tree, parsePath(tag[1]), true);
  }

  return tree;
}
export function getTreeTags(entry: TreeFolder | TreeFile, path: string[] = []): NDKTag[] {
  if (entry.type === "file") {
    const file = entry as TreeFile;
    const base: NDKTag = ["x", file.hash, "/" + path.join("/"), String(entry.size)];
    if (file.mimeType) base.push(file.mimeType);
    return [base];
  } else if (Object.keys(entry).length === 0) {
    if (path.length > 0) return [["folder", "/" + path.join("/")]];
    else return [];
  }

  return Object.entries(entry)
    .map(([name]) => {
      const folder = entry as TreeFolder;
      return getTreeTags(folder[name] as TreeFolder, [...path, name]);
    })
    .flat();
}

export function setPackFileTree(draft: NDKEvent, tree: TreeFolder) {
  draft.tags = draft.tags.filter((t) => t[0] !== "x" && t[0] !== "folder");
  draft.tags = draft.tags.concat(getTreeTags(tree));
}
