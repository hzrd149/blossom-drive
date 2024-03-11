export default class Branch {
  name: string;
  parent?: Branch;
  get path(): string[] {
    return this.parent?.path.concat(this.name) ?? this.name ? [this.name] : [];
  }
  constructor(name: string) {
    this.name = name;
  }
}
