import { BlossomClient, type EventTemplate, type SignedEvent } from "blossom-client";
import Drive, { emptyMetadata, type DriveMetadata } from "./Drive";
import { base64 } from "@scure/base";
import { decrypt, encrypt } from "./crypto";
import TreeFolder from "./FileTree/TreeFolder";
import type { Path } from "./FileTree/methods";

export const ENCRYPTED_DRIVE_KIND = 30564;
export const DEFAULT_SCRYPT_LOGN = 4;

const drivePassword = new WeakMap<EncryptedDrive, string>();
export class EncryptedDrive extends Drive {
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();

  logn = DEFAULT_SCRYPT_LOGN;
  locked = true;

  async unlock(password: string) {
    if (!this.event) throw new Error("No Event");
    if (!this.locked) throw new Error("Already unlocked");
    try {
      drivePassword.set(this, password);
      this.locked = false;
      await this.resetFromEvent();
    } catch (e) {
      drivePassword.delete(this);
      this.locked = true;
      throw e;
    }
  }
  lock() {
    if (!this.locked) {
      drivePassword.delete(this);
      this.locked = false;
      this._metadata = emptyMetadata;
      this.tree = new TreeFolder("");
    }
  }

  /** used to set the password on new drives */
  setPassword(password: string, logn = DEFAULT_SCRYPT_LOGN) {
    if (this.locked && !drivePassword.has(this)) {
      drivePassword.set(this, password);
      this.logn = logn;
    }
  }

  protected readEvent(event: EventTemplate | SignedEvent): DriveMetadata {
    const password = drivePassword.get(this);
    if (!password) throw new Error("No password provided");

    const data = decrypt(base64.decode(event.content), password);
    const plaintext = this.decoder.decode(data);
    const tags = JSON.parse(plaintext);

    this.locked = false;

    return super.readEvent({ ...event, content: "", tags, created_at: 0 });
  }

  protected createEventTemplate(): EventTemplate {
    const password = drivePassword.get(this);
    if (!password) throw new Error("No password set");

    const template = super.createEventTemplate();
    const plaintext = this.encoder.encode(JSON.stringify(template.tags));
    const data = encrypt(plaintext, password, this.logn);
    const ciphertext = base64.encode(data);
    template.kind = ENCRYPTED_DRIVE_KIND;
    template.content = ciphertext;
    // only keep the "d" and "scrypt-logn" tags public
    template.tags = template.tags.filter((t) => t[0] === "d");
    template.tags.push(["scrypt-logn", String(this.logn)]);
    return template;
  }

  update(event: EventTemplate | SignedEvent): boolean {
    if (!this.locked) return super.update(event);
    else if (!this.event || event.created_at > this.event.created_at) {
      this.event = event;

      this._metadata.identifier = event.tags.find((t) => t[0] === "d")?.[1] ?? "";

      const logn = parseInt(event.tags.find((t) => t[0] === "scrypt-logn")?.[1] ?? "");
      if (Number.isFinite(logn) && logn > 0 && logn <= 22) this.logn = logn;
      else this.logn = DEFAULT_SCRYPT_LOGN;

      let pubkey: string | undefined = undefined;
      // @ts-expect-error
      if (Object.hasOwn(event, "pubkey")) this._metadata.pubkey = event.pubkey;

      return true;
    }
    return false;
  }

  async encryptBlob(blob: Blob) {
    if (this.locked) throw new Error("Drive locked");
    const password = drivePassword.get(this);
    if (!password) throw new Error("No password provided");

    const buffer = await blob.arrayBuffer();
    const ciphertext = encrypt(new Uint8Array(buffer), password, this.logn);
    return new Blob([ciphertext], { type: "application/octet-stream" });
  }

  async decryptBlob(blob: Blob, type?: string) {
    if (this.locked) throw new Error("Drive locked");
    const password = drivePassword.get(this);
    if (!password) throw new Error("No password provided");

    const buffer = await blob.arrayBuffer();
    const plaintext = decrypt(new Uint8Array(buffer), password);
    return new Blob([plaintext], { type });
  }

  async downloadFile(path: Path, additionalServers: string[] = []) {
    if (this.locked) throw new Error("Drive locked");
    const password = drivePassword.get(this);
    if (!password) throw new Error("No password provided");

    const file = this.getFile(path);
    const servers = [...this.servers];
    for (const server of additionalServers) {
      if (!servers.includes(server)) servers.push(server);
    }

    for (const server of servers) {
      try {
        const data = await BlossomClient.getBlob(server, file.sha256);
        const blob = await this.decryptBlob(data);
        return new File([blob], file.name, { type: file.type });
      } catch (e) {}
    }
    return null;
  }
}
