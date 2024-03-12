import { BlossomClient, type BlobDescriptor, type Signer, type SignedEvent } from "blossom-client";
import { nanoid } from "nanoid";
import type Drive from "./Drive";
import EventEmitter from "events";
import { readFileSystemDirectory, readFileSystemFile } from "./helpers";
import { joinPath } from "./FileTree/methods";

export type UploadableItem = FileList | File | FileSystemDirectoryEntry;

export default class Upload extends EventEmitter {
  drive: Drive;
  servers: string[];
  signer: Signer;
  basePath: string;

  complete = false;
  running = false;

  files: { id: string; file: File; path: string }[] = [];

  /** file id -> server -> status */
  progress: Record<string, Record<string, { blob?: BlobDescriptor; error?: Error }>> = {};

  constructor(drive: Drive, basePath: string, servers: string[], signer: Signer) {
    super();
    this.drive = drive;
    this.servers = servers;
    this.basePath = basePath;
    this.signer = signer;
  }

  async addFileList(fileList: FileList) {
    for (const file of fileList) {
      const path = file.webkitRelativePath ? file.webkitRelativePath : file.name;
      this.files.push({ id: nanoid(), file, path });
    }
  }
  async addFileSystemEntry(entry: FileSystemEntry) {
    if (entry instanceof FileSystemFileEntry && entry.isFile) {
      try {
        const file = await readFileSystemFile(entry);
        this.files.push({ id: nanoid(), file, path: entry.fullPath });
      } catch (e) {
        console.log("Failed to add" + entry.fullPath);
        console.log(e);
      }
    } else if (entry instanceof FileSystemDirectoryEntry && entry.isDirectory) {
      const entries = await readFileSystemDirectory(entry);
      for (const e of entries) await this.addFileSystemEntry(e);
    }
  }

  async upload() {
    if (this.running || this.complete) return;
    this.running = true;
    this.emit("start", this);

    const auth: Record<string, SignedEvent> = {};
    for (const file of this.files) {
      const token = await BlossomClient.getUploadAuth(file.file, this.signer, `Upload ${file.file.name}`);
      auth[file.id] = token;
    }

    for (const file of this.files) {
      if (!this.progress[file.id]) this.progress[file.id] = {};

      for (const server of this.servers) {
        try {
          const blob = await BlossomClient.uploadBlob(server, file.file, auth[file.id]);
          this.progress[file.id][server] = { blob };
          this.drive.setFile(joinPath(this.basePath, file.path), {
            sha256: blob.sha256,
            size: blob.size,
            type: blob.type ?? "",
          });
          this.emit("progress", this.progress);
        } catch (error) {
          if (error instanceof Error) this.progress[file.id][server] = { error };
        }
      }
    }

    await this.drive.save();

    this.complete = true;
    this.emit("complete", this);
  }
}
