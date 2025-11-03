import { DirectoryOutput } from "@mageowl/conduit";
import Namespace from "./namespace.ts";
import type Output from "./output.ts";

export interface PackMetadata {
  description: string;
  minecraft: MinecraftVersion;
}

export type Version = `${number}.${number}${`.${number}` | ""}`;
export const parseVersion = (v: Version) =>
  <[number, number] | [number, number, number]> v.split(".").map((v) =>
    parseInt(v)
  );

export type MinecraftVersion =
  | "1.21.5"
  | "1.21.6"
  | "1.21.7"
  | "1.21.8"
  | "1.21.9"
  | "1.21.10";

export type PackType = "data" | "assets";

export interface PackFilter {
  namespace?: RegExp;
  path: RegExp;
}

export abstract class Pack<Type extends PackType> {
  protected namespaces: Map<string, Namespace<Type>> = new Map();
  protected packFormat: number | [number, number];
  protected description: string;
  protected filters: PackFilter[];

  protected abstract getFormat(
    minecraft: MinecraftVersion,
  ): number | [number, number];
  protected abstract getTypeString(): Type;

  constructor(metadata: PackMetadata) {
    this.packFormat = this.getFormat(metadata.minecraft);
    this.description = metadata.description;
    this.filters = [];
  }

  namespace(name: string): Namespace<Type> {
    if (this.namespaces.has(name)) {
      return this.namespaces.get(name)!;
    } else {
      const namespace = new Namespace(name, this.packFormat);
      this.namespaces.set(name, namespace);
      return namespace;
    }
  }

  addFilter(filter: PackFilter) {
    this.filters.push(filter);
  }

  async save(path: Output | string): Promise<boolean> {
    const output = typeof path === "string" ? new DirectoryOutput(path) : path;
    const typeFolder = `${this.getTypeString()}/`;

    await output.requestPermissions();
    output.mkdir(typeFolder);

    const text = JSON.stringify({
      pack: {
        description: this.description,
        ...(Array.isArray(this.packFormat)
          ? { min_format: this.packFormat, max_format: this.packFormat[0] }
          : { pack_format: this.packFormat }),
      },
      filter: {
        block: this.filters.map(({ namespace, path }) => ({
          namespace: namespace?.toString().replaceAll(/(^\/|\/$)/g, ""),
          path: path.toString().replaceAll(/(^\/|\/$)/g, ""),
        })),
      },
    });
    output.writeFile("pack.mcmeta", text);

    this.namespaces.forEach((namespace, name) => {
      const dataPath = typeFolder + name;
      output.mkdir(dataPath);
      namespace.save(output.withBase(dataPath));
    });
    await output.complete();
    console.log(`%c✅ Saved pack to ${output.savePath}`, "font-weight:bold;");
    return true;
  }
}
