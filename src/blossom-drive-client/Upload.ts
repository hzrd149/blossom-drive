import type { Signer } from "blossom-client";

export default class Upload {
  servers: string[];
  signer: Signer;

  constructor(servers: string[], signer: Signer) {
    this.servers = servers;
    this.signer = signer;
  }

  start() {}
}
