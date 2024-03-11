import Branch from "./Branch";
import type TreeFile from "./TreeFile";

export default class TreeFolder extends Branch {
  children: (TreeFolder | TreeFile)[];
  declare parent?: TreeFolder;

  constructor(name: string, children: (TreeFolder | TreeFile)[] = []) {
    super(name);
    this.children = children;
  }

  has(name: string) {
    return this.children.some((e) => e.name === name);
  }
  get(name: string) {
    return this.children.find((e) => e.name === name);
  }
  set(name: string, entry: TreeFolder | TreeFile, override = true) {
    const existing = this.get(name);

    if (existing) {
      if (override) this.children.splice(this.children.indexOf(existing), 1, entry);
      else throw new Error(`${name} already exists`);
    } else this.children.push(entry);

    entry.parent = this;
    entry.name = name;
  }
  remove(name: string) {
    const existing = this.get(name);
    if (existing) {
      this.children.splice(this.children.indexOf(existing), 1);
      existing.parent = undefined;
    }
  }

  [Symbol.iterator]() {
    return this.children[Symbol.iterator]();
  }
}
