import JSZip from "jszip";
import saveAs from "file-saver";
import { basename } from "path-browserify";
import EventEmitter from "events";
import { nanoid } from "nanoid";

import { type Drive, TreeFile, TreeFolder } from "blossom-drive-sdk";

// TODO: calculated progress
export class MultiDownload extends EventEmitter {
  id = nanoid();
  drive: Drive;
  servers: string[];
  running = false;
  logHistory: string[] = [];

  constructor(drive: Drive, servers: string[]) {
    super();
    this.drive = drive;
    this.servers = servers;
  }

  private log(...str: any[]) {
    const message = str.map((s) => String(s)).join(" ");
    this.logHistory.push(message);
    this.emit("log", message, this.logHistory, this);
  }

  private async addFileToZip(file: TreeFile, zip: JSZip) {
    this.log(`Downloading ${file.name}`);
    let download = await this.drive.downloadFile(file.path, this.servers);
    if (download) {
      zip.file(file.name, download, { binary: true });
      this.log(`Added ${file.name} to zip`);
    }
  }
  private async addFolderToZip(folder: TreeFolder, zip: JSZip) {
    const zipFolder = zip.folder(folder.name);
    if (!zipFolder) return;
    this.log(`Created ${folder.name} folder`);

    await this.addFolderContentToZip(folder, zipFolder);
  }
  private async addFolderContentToZip(folder: TreeFolder, zip: JSZip) {
    for (const child of folder) {
      try {
        if (child instanceof TreeFile) {
          await this.addFileToZip(child, zip);
        } else if (child instanceof TreeFolder) {
          await this.addFolderToZip(child, zip);
        }
      } catch (e) {
        if (e instanceof Error) {
          this.log(`Error: Failed to add ${child.name} to zip`);
          this.log(e.message);
        }
      }
    }
  }

  async start(branches: (TreeFile | TreeFolder)[]) {
    if (this.running) return;
    if (branches.length === 0) throw new Error("Nothing to download");

    this.running = true;

    if (branches.length === 1) {
      const single = branches[0];

      if (single instanceof TreeFile) {
        let download = await this.drive.downloadFile(single.path, this.servers);
        if (download) await saveAs(download, download.name);
      } else if (single instanceof TreeFolder) {
        const zip = new JSZip();
        await this.addFolderContentToZip(single, zip);
        const zipFile = await zip.generateAsync({ type: "blob" });
        await saveAs(zipFile, basename(single.name) + ".zip");
      }
    } else {
      const zip = new JSZip();

      for (const child of branches) {
        try {
          if (child instanceof TreeFile) {
            await this.addFileToZip(child, zip);
          } else if (child instanceof TreeFolder) {
            await this.addFolderToZip(child, zip);
          }
        } catch (e) {
          if (e instanceof Error) {
            this.log(`Error: Failed to add ${child.name} to zip`);
            this.log(e.message);
          }
        }
      }

      const name = branches.length === 1 ? basename(branches[0].name) : "download";
      const zipFile = await zip.generateAsync({ type: "blob" });
      await saveAs(zipFile, name + ".zip");
    }
  }
}
