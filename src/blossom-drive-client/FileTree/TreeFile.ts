import Branch from "./Branch";
import type TreeFolder from "./TreeFolder";

export type FileMetadata = {
  sha256: string;
  size: number;
  type: string;
};

export default class TreeFile extends Branch {
  sha256: string;
  size: number;
  type: string;
  declare parent?: TreeFolder;

  constructor(name: string, metadata: FileMetadata) {
    super(name);
    this.sha256 = metadata.sha256;
    this.size = metadata.size;
    this.type = metadata.type;
  }
}
