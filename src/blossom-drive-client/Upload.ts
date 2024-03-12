import type { BlobDescriptor, Signer } from "blossom-client";
import type Drive from "./Drive";

export type UploadableItem = FileList | File | FileSystemDirectoryEntry;

// NOTE: make sure to support webkitRelativePath on File if its defined

export default class Upload {
  drive: Drive;
  servers: string[];
  signer: Signer;

  item: UploadableItem;

  blobs: Record<string, BlobDescriptor> = {};
  errors: Record<string, string> = {};
  complete = false;

  constructor(drive: Drive, servers: string[], item: UploadableItem, signer: Signer) {
    this.drive = drive;
    this.servers = servers;
    this.item = item;
    this.signer = signer;
  }

  start() {}
}
