import { BlossomClient, type BlobDescriptor, type Signer } from "blossom-client";
import { nanoid } from "nanoid";
import mime from "mime";
import EventEmitter from "events";

import type Drive from "./Drive";
import { readFileSystemDirectory, readFileSystemFile } from "./helpers";
import { joinPath } from "./FileTree/methods";
import { EncryptedDrive } from "./EncryptedDrive";

export type UploadableItem = FileList | File | FileSystemDirectoryEntry;

export type UploadFileStatus = {
  complete: boolean;
  pending: boolean;
  serversComplete: number;
  results: Record<string, {success: true, blob: BlobDescriptor}|{success:false,error: Error}>;
};

export default class Upload extends EventEmitter {
  drive: Drive | EncryptedDrive;
  servers: string[];
  signer: Signer;
  basePath: string;

  complete = false;
  running = false;

  files: { id: string; file: File; path: string }[] = [];
  status: Record<string, UploadFileStatus> = {};

  blobs: Record<string, Record<string, BlobDescriptor>> = {};
  errors: Record<string, Record<string, Error>> = {};

  get progress() {
    const serverProgress: Record<string, number> = {};
    for (const server of this.servers) {
      const blobs = this.blobs[server] ? Object.keys(this.blobs[server]).length : 0;
      const errors = this.errors[server] ? Object.keys(this.errors[server]).length : 0;
      serverProgress[server] = (blobs + errors) / this.files.length;
    }

    return Object.values(serverProgress).reduce((t, v) => v + t, 0) / this.servers.length;
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
      this.status[upload.id] = { complete: false, pending: true, serversComplete: 0, results: {} };
    }

    for (const upload of this.files) {
      const status = this.status[upload.id];
      let _file = upload.file;

      status.pending = false;
      this.emit("progress", this.progress);

      if (this.drive instanceof EncryptedDrive) {
        const blob = await this.drive.encryptBlob(_file);
        _file = new File([blob], "encrypted.bin", { type: "application/octet-stream" });
      }

      const token = await BlossomClient.getUploadAuth(_file, this.signer, `Upload ${_file.name}`);

      for (const server of this.servers) {
        if (!this.blobs[server]) this.blobs[server] = {};
        if (!this.errors[server]) this.errors[server] = {};

        try {
          const blob = await BlossomClient.uploadBlob(server, _file, token);
          this.blobs[server][upload.id] = blob;
          status.results[server] = {success: true, blob};
          this.drive.setFile(joinPath(this.basePath, upload.path), {
            sha256: blob.sha256,
            size: blob.size,
            type: upload.file.type || mime.getType(upload.file.name) || blob.type || "",
          });
        } catch (error) {
          if (error instanceof Error) {
            this.errors[server][upload.id] = error;
            status.results[server] = {success: false, error};
          }
        }
        status.serversComplete++;
        this.emit("progress", this.progress);
      }

      status.complete = true;
      this.emit("progress", this.progress);
    }

    await this.drive.save();

    this.complete = true;
    this.emit("complete", this);
  }
}
