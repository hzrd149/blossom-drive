const now = () => new Date().valueOf() / 1000;
const oneHour = () => now() + 60 * 60;

export type EventTemplate = {
  created_at: number;
  kind: number;
  content: string;
  tags: string[][];
};
export type SignedEvent = EventTemplate & { id: string; sig: string };

export type Signer = (draft: EventTemplate) => Promise<SignedEvent>;

export type Blob = {
  created: number;
  type: string;
  sha256: string;
  size: number;
  url: string;
};

export class BlossomClient {
  server: string;
  signer?: Signer;

  constructor(server: string, signer?: Signer) {
    this.server = new URL("/", server).toString();
    this.signer = signer;
  }

  static async getUploadAuth(file: File, signer: Signer, expiration = oneHour()) {
    return await signer({
      created_at: now(),
      kind: 22242,
      content: "Authorize Upload",
      tags: [
        ["name", file.name],
        ["size", String(file.size)],
        ["expiration", String(expiration)],
      ],
    });
  }
  static async getDeleteAuth(hash: string, signer: Signer, expiration = oneHour()) {
    return await signer({
      created_at: now(),
      kind: 22242,
      content: "Delete Items",
      tags: [
        ["x", hash],
        ["expiration", String(expiration)],
      ],
    });
  }
  static async getListAuth(signer: Signer, expiration = oneHour()) {
    return await signer({
      created_at: now(),
      kind: 22242,
      content: "List Items",
      tags: [["expiration", String(expiration)]],
    });
  }

  async getUploadAuth(file: File, expiration?: number) {
    if (!this.signer) throw new Error("Missing signer");
    return await BlossomClient.getUploadAuth(file, this.signer, expiration);
  }
  async getDeleteAuth(hash: string, expiration?: number) {
    if (!this.signer) throw new Error("Missing signer");
    return await BlossomClient.getDeleteAuth(hash, this.signer, expiration);
  }
  async getListAuth(expiration?: number) {
    if (!this.signer) throw new Error("Missing signer");
    return await BlossomClient.getListAuth(this.signer, expiration);
  }

  static async listBlobs(server: string, pubkey?: string, auth: SignedEvent | boolean = false) {
    const res = await fetch(new URL(pubkey ? `/list?pubkey=` + pubkey : "/list", server), {
      headers: auth ? { authorization: JSON.stringify(auth) } : {},
    });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as Promise<Blob[]>;
  }
  async listBlobs(pubkey?: string, auth: SignedEvent | boolean = false) {
    if (typeof auth === "boolean" && auth) auth = await this.getListAuth();
    return BlossomClient.listBlobs(this.server, pubkey, auth ? auth : undefined);
  }

  static async deleteBlob(server: string, hash: string, auth?: SignedEvent) {
    const res = await fetch(new URL("/" + hash, server), {
      method: "DELETE",
      headers: auth ? { authorization: JSON.stringify(auth) } : {},
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.text();
  }
  async deleteBlob(hash: string, auth: SignedEvent | boolean = true) {
    if (typeof auth === "boolean" && auth) auth = await this.getDeleteAuth(hash);
    return BlossomClient.deleteBlob(this.server, hash, auth ? auth : undefined);
  }

  static async uploadBlob(server: string, file: File, auth?: SignedEvent) {
    const res = await fetch(new URL("/upload", server), {
      method: "PUT",
      body: file,
      headers: auth ? { authorization: JSON.stringify(auth) } : {},
    });

    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as Promise<Blob>;
  }
  async uploadBlob(file: File, auth: SignedEvent | boolean = true) {
    if (typeof auth === "boolean" && auth) auth = await this.getUploadAuth(file);
    return BlossomClient.uploadBlob(this.server, file, auth ? auth : undefined);
  }
}
