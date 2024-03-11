import TreeFile from "./TreeFile";
import TreeFolder from "./TreeFolder";
import { basename, dirname, formatPath, getFolder, parsePath } from "./methods";

export function getPathFromTag(tag: string[]) {
  const [_, _sha256, path] = tag;
  if (!path) throw new Error("Missing path");
  return parsePath(path);
}
export function createTreeFileFromTag(tag: string[]) {
  const [_, sha256, path, sizeStr, type] = tag;
  const size = parseInt(sizeStr);

  if (!sha256) throw new Error("Missing sha256");
  if (!path) throw new Error("Missing path");
  if (!size) throw new Error("Missing size");
  if (!Number.isFinite(size)) throw new Error("Invalid size");

  const parsed = parsePath(path);
  return new TreeFile(basename(parsed), { sha256, size, type });
}

export function createTreeFromTags(tags: string[][], quite = true) {
  const root = new TreeFolder("");

  for (const tag of tags) {
    try {
      if (tag[0] === "x") {
        const path = getPathFromTag(tag);
        const file = createTreeFileFromTag(tag);
        getFolder(root, dirname(path), true).set(basename(path), file);
      }
      if (tag[0] === "folder") {
        const path = getPathFromTag(tag);
        getFolder(root, path, true);
      }
    } catch (e) {
      if (quite) {
        if (e instanceof Error) {
          console.warn(`Failed to parse`, tag);
          console.error(e.message);
        }
      } else throw e;
    }
  }

  return root;
}

export function createTagsForTree(root: TreeFolder, keepEmpty = true) {
  const tags: string[][] = [];

  const walk = (folder: TreeFolder) => {
    for (const child of folder) {
      if (child instanceof TreeFolder) {
        if (child.children.length === 0) {
          if (keepEmpty) tags.push(["folder", formatPath(child.path)]);
        } else walk(child);
      } else tags.push(["x", child.sha256, formatPath(child.path), String(child.size), child.type]);
    }
  };

  walk(root);

  return tags;
}

export function updateTreeInTags(tags: string[][], root: TreeFolder, keepEmpty = true) {
  return tags.filter((t) => t[0] !== "x" && t[0] !== "folder").concat(createTagsForTree(root, keepEmpty));
}
