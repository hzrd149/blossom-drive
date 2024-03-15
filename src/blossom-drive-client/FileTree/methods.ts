import TreeFile, { type FileMetadata } from "./TreeFile";
import TreeFolder from "./TreeFolder";

export type Path = string | string[];

export function parsePath(path: Path): string[] {
  if (Array.isArray(path)) return path.filter(Boolean);
  if (Array.isArray(path)) return path.filter(Boolean);
  else return path.replace(/^\//, "").split("/").filter(Boolean);
}
export function formatPath(path: string[]) {
  return "/" + path.join("/");
}
export function joinPath(path: Path, subPath: Path) {
  return [...parsePath(path), ...parsePath(subPath)].filter(Boolean);
}
export function dirname(path: string[]) {
  return path.slice(0, -1);
}
export function basename(path: string[]) {
  return path.slice(-1)[0];
}
export function extname(path: string | string[]) {
  return (typeof path === "string" ? path : formatPath(path)).match(/\.[a-zA-Z0-9]{2,5}$/)?.[0];
}

export function getPath(root: TreeFolder, path: Path, create = false) {
  const parts = parsePath(path);
  if (parts.length === 0) return root;

  const next = parts.shift();
  if (!next) throw new Error("Bad path");

  let entry = root.get(next);
  if (!entry) {
    if (create) {
      entry = new TreeFolder(next);
      root.set(next, entry);
    } else throw new Error(`Missing folder ${next} in ${root.name}`);
  }

  if (parts.length === 0) return entry;
  else {
    if (entry instanceof TreeFolder) return getPath(entry, parts, create);
    else throw new Error("Expected folder");
  }
}
export function getFolder(root: TreeFolder, path: Path, create = false) {
  const entry = getPath(root, path, create);
  if (entry instanceof TreeFolder) return entry;
  else throw new Error("Expected folder");
}
export function getFile(root: TreeFolder, path: Path) {
  const entry = getPath(root, path, false);
  if (entry instanceof TreeFile) return entry;
  else throw new Error("Expected file");
}

export function setFile(root: TreeFolder, path: Path, metadata: FileMetadata) {
  const parsed = parsePath(path);
  const name = basename(parsed);
  const file = new TreeFile(name, metadata);
  getFolder(root, dirname(parsed), true).set(name, file);
  return file;
}

export function remove(root: TreeFolder, path: Path) {
  const entry = getPath(root, path);
  if (!entry.parent) throw new Error("Missing parent");
  entry.parent.remove(entry.name);
}

export function move(root: TreeFolder, src: Path, dest: Path) {
  const entry = getPath(root, src);
  const destFolder = getPath(root, dirname(parsePath(dest)));
  if (!(destFolder instanceof TreeFolder)) throw new Error("Expected Folder");

  entry.parent?.remove(entry.name);
  destFolder.set(basename(parsePath(dest)), entry);
}

export function walkTree(
  branch: TreeFolder | TreeFile,
  fn: (branch: TreeFolder | TreeFile) => boolean | undefined | void,
) {
  const keepGoing = fn(branch);
  if (keepGoing === false) return;

  if (branch instanceof TreeFolder) {
    for (const child of branch) walkTree(child, fn);
  }
}

export function fileTypesInTree(root: TreeFolder) {
  const types = new Set<string>();
  walkTree(root, (branch) => {
    if (branch instanceof TreeFile) types.add(branch.type);
  });
  return Array.from(types).sort();
}
