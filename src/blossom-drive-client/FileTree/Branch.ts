export default class Branch {
  name: string;
  parent?: Branch;
  get path(): string[] {
    if (this.parent) return [...this.parent.path, this.name];
    else return this.name ? [this.name] : [];
  }
  constructor(name: string) {
    this.name = name;
  }
}
