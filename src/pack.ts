import Namespace from "./namespace.ts";

export interface PackMetadata {
  description: string;
  minecraft: MinecraftVersion;
}

export type Version = `${number}.${number}${`.${number}` | ""}`;
export const parseVersion = (v: Version) =>
  <[number, number] | [number, number, number]> v.split(".").map((v) =>
    parseInt(v)
  );

export type MinecraftVersion = "1.21.5";

export type PackType = "data" | "resource";

export abstract class Pack<Type extends PackType> {
  protected namespaces: Map<string, Namespace<Type>> = new Map();
  protected packFormat: number;
  protected description: string;

  constructor(metadata: PackMetadata) {
    this.packFormat = this.getFormat(metadata.minecraft);
    this.description = metadata.description;
  }

  namespace(name: string): Namespace<Type> {
    if (this.namespaces.has(name)) {
      return this.namespaces.get(name)!;
    } else {
      const namespace = new Namespace(name);
      this.namespaces.set(name, namespace);
      return namespace;
    }
  }

  protected abstract getFormat(minecraft: MinecraftVersion): number;
}
