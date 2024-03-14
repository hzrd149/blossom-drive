import type { EventTemplate, SignedEvent } from "blossom-client";
import Drive, { emptyMetadata, type DriveMetadata } from "./Drive";
import { base64 } from "@scure/base";
import { decrypt, encrypt } from "./crypto";
import TreeFolder from "./FileTree/TreeFolder";

export const ENCRYPTED_DRIVE_KIND = 30564;

const drivePassword = new WeakMap<EncryptedDrive, string>();
export class EncryptedDrive extends Drive {
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();

  unlocked = false;

  async unlock(password: string) {
    if (!this.event) throw new Error("No Event");
    if (this.unlocked) return;
    try {
      drivePassword.set(this, password);
      this.unlocked = false;
      await this.resetFromEvent();
    } catch (e) {
      drivePassword.delete(this);
      this.unlocked = true;
      throw e;
    }
  }
  lock() {
    if (this.unlocked) {
      drivePassword.delete(this);
      this.unlocked = true;
      this._metadata = emptyMetadata;
      this.tree = new TreeFolder("");
    }
  }

  /** used to set the password on new drives */
  setPassword(password: string) {
    if (!this.unlocked && !drivePassword.has(this)) {
      drivePassword.set(this, password);
    }
  }

  protected readEvent(event: EventTemplate | SignedEvent): DriveMetadata {
    const password = drivePassword.get(this);
    if (!password) throw new Error("No password provided");

    const data = decrypt(base64.decode(event.content), password);
    const plaintext = this.decoder.decode(data);
    const tags = JSON.parse(plaintext);

    this.unlocked = true;

    return super.readEvent({ ...event, content: "", tags, created_at: 0 });
  }

  protected createEventTemplate(): EventTemplate {
    const password = drivePassword.get(this);
    if (!password) throw new Error("No password set");

    const template = super.createEventTemplate();
    const plaintext = this.encoder.encode(JSON.stringify(template.tags));
    const data = encrypt(plaintext, password);
    const ciphertext = base64.encode(data);
    template.kind = ENCRYPTED_DRIVE_KIND;
    template.content = ciphertext;
    template.tags = [];
    return template;
  }
}
