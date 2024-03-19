import { BlossomClient, type BlobDescriptor, type Signer } from "blossom-client";
import { nanoid } from "nanoid";
import mime from "mime";
import EventEmitter from "events";

import type Drive from "./Drive";
import { readFileSystemDirectory, readFileSystemFile } from "./helpers";
import { joinPath } from "./FileTree/methods";
import { EncryptedDrive } from "./EncryptedDrive";

export type UploadableItem = FileList | File | FileSystemDirectoryEntry;

export default class Upload extends EventEmitter {
  drive: Drive | EncryptedDrive;
  servers: string[];
  signer: Signer;
  basePath: string;

  complete = false;
  running = false;

  files: { id: string; file: File; path: string }[] = [];

  /** file id -> server -> status */
  progress: Record<string, Record<string, { blob?: BlobDescriptor; error?: Error }>> = {};
  get totalProgress() {
    return (
      Object.values(this.progress).reduce((v, u) => v + Object.values(u).filter((s) => !!s.blob).length, 0) /
      (this.files.length * this.servers.length)
    );
  }

  constructor(drive: Drive | EncryptedDrive, basePath: string, servers: string[], signer: Signer) {
    super();
    this.drive = drive;
    this.servers = servers;
    this.basePath = basePath;
    this.signer = signer;
  }

  async addFile(file: File) {
    const path = file.webkitRelativePath ? file.webkitRelativePath : file.name;
    this.files.push({ id: nanoid(), file, path });
  }
  async addFileList(fileList: FileList) {
    for (const file of fileList) {
      await this.addFile(file);
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
    for (const upload of this.files) {
      let _file = upload.file;

      if (this.drive instanceof EncryptedDrive) {
        const blob = await this.drive.encryptBlob(_file);
        _file = new File([blob], "encrypted.bin", { type: "application/octet-stream" });
      }

      const token = await BlossomClient.getUploadAuth(_file, this.signer, `Upload ${_file.name}`);

      if (!this.progress[upload.id]) this.progress[upload.id] = {};
      this.emit("progress", this.progress);

      for (const server of this.servers) {
        try {
          const blob = await BlossomClient.uploadBlob(server, _file, token);
          this.progress[upload.id][server] = { blob };
          this.drive.setFile(joinPath(this.basePath, upload.path), {
            sha256: blob.sha256,
            size: blob.size,
            type: upload.file.type || mime.getType(upload.file.name) || blob.type || "",
          });
        } catch (error) {
          if (error instanceof Error) this.progress[upload.id][server] = { error };
        }
        this.emit("progress", this.progress);
      }
    }

    await this.drive.save();

    this.complete = true;
    this.emit("complete", this);
  }
}
