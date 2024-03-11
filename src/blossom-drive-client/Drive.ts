import type { SignedEvent, EventTemplate, Signer } from "blossom-client";
import EventEmitter from "events";
import { nip19 } from "nostr-tools";

import type TreeFolder from "./FileTree/TreeFolder";
import { createTreeFromTags, updateTreeInTags } from "./FileTree/nostr";
import { getFile, getFolder, getPath, setFile, type Path, remove, move } from "./FileTree/methods";
import type { FileMetadata } from "./FileTree/TreeFile";

function now() {
  return Math.floor(Date.now() / 1000);
}

export const DRIVE_KIND = 30563;

export type Publisher = (event: SignedEvent) => Promise<void>;

export default class Drive extends EventEmitter {
  tree: TreeFolder;
  event: EventTemplate;
  identifier: string;
  pubkey?: string;

  modified = false;
  signer: Signer;
  publisher: Publisher;

  get address() {
    return this.pubkey
      ? nip19.naddrEncode({ identifier: this.identifier, pubkey: this.pubkey, kind: this.event.kind })
      : "";
  }

  constructor(event: EventTemplate | SignedEvent, signer: Signer, publisher: Publisher) {
    super();
    this.event = event;
    this.signer = signer;
    this.publisher = publisher;

    // @ts-expect-error
    if (Object.hasOwn(event, "pubkey")) this.pubkey = event.pubkey;

    const d = event.tags.find((t) => t[0] === "d")?.[1];
    if (!d) throw new Error("Missing d tag");
    this.identifier = d;

    this.tree = createTreeFromTags(event.tags);
  }

  async save() {
    if (!this.modified) return;
    try {
      const signed = await this.signer({
        kind: DRIVE_KIND,
        content: this.event.content || "",
        created_at: now(),
        tags: updateTreeInTags(this.event.tags, this.tree),
      });
      await this.publisher(signed);
      this.update(signed);
      return signed;
    } catch (e) {
      this.reset();
      throw e;
    }
  }

  update(event: EventTemplate | SignedEvent) {
    if (event.kind !== DRIVE_KIND) return false;

    if (event.created_at > this.event.created_at) {
      this.event = event;

      // @ts-expect-error
      if (Object.hasOwn(event, "pubkey")) this.pubkey = event.pubkey;

      this.reset();
      this.emit("update", this);
      return true;
    }
    return false;
  }
  reset() {
    if (this.modified) {
      this.tree = createTreeFromTags(this.event.tags);
      this.modified = false;
      this.emit("change", this);
    }
  }

  getPath(path: Path, create = false) {
    return getPath(this.tree, path, create);
  }
  getFolder(path: Path, create = false) {
    return getFolder(this.tree, path, create);
  }
  getFile(path: Path) {
    return getFile(this.tree, path);
  }

  remove(path: Path) {
    remove(this.tree, path);
    this.modified = true;
    this.emit("change", this);
  }
  move(src: Path, dest: Path) {
    move(this.tree, src, dest);
    this.modified = true;
    this.emit("change", this);
  }

  setFile(path: Path, metadata: FileMetadata) {
    const file = setFile(this.tree, path, metadata);
    this.modified = true;
    this.emit("change", this);
    return file;
  }

  hasHash(sha256: string) {
    return this.event.tags.some((t) => t[0] === "x" && t[1] === sha256);
  }

  [Symbol.iterator]() {
    return this.tree[Symbol.iterator]();
  }
}
