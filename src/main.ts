import Namespace from "./namespace.ts";
import * as path from "jsr:@std/path";

export { default as cmd } from "./cmd.ts";
export { default as Function } from "./member/function.ts";

interface PackMetadata {
  minecraftVersion: MinecraftVersion;
  description: string;
}
type MinecraftVersion = "1.21.5";

function packFormat(minecraftVersion: MinecraftVersion): number {
  switch (minecraftVersion) {
    case "1.21.5":
      return 71;
  }
}

export class Datapack {
  private namespaces: Map<string, Namespace> = new Map();
  private packFormat: number;
  private description: string;

  constructor({ minecraftVersion, description }: PackMetadata) {
    this.packFormat = packFormat(minecraftVersion);
    this.description = description;
  }

  namespace(name: string): Namespace {
    if (this.namespaces.has(name)) {
      return this.namespaces.get(name)!;
    } else {
      const namespace = new Namespace();
      this.namespaces.set(name, namespace);
      return namespace;
    }
  }

  async save(savePath: string): Promise<bool> {
    const readRes = await Deno.permissions.request({
      name: "read",
      path: savePath,
    });
    if (readRes.state != "granted") {
      console.log("Failed to save datapack. You need to allow read access.");
    }
    const writeRes = await Deno.permissions.request({
      name: "write",
      path: savePath,
    });
    if (writeRes.state != "granted") {
      console.log("Failed to save datapack. You need to allow write access.");
    }

    await (Deno.remove(savePath, { recursive: true }).catch(() => {}));
    const dataPath = path.join(savePath, "data");
    await Deno.mkdir(dataPath, { recursive: true });

    const file = await Deno.create(path.join(savePath, "pack.mcmeta"));
    const encoder = new TextEncoder();
    const text = encoder.encode(JSON.stringify({
      pack: {
        description: this.description,
        pack_format: this.packFormat,
      },
    }));
    file.write(text);

    await Promise.all(
      this.namespaces.entries().map(async ([name, namespace]) => {
        await namespace.save(path.join(dataPath, name));
      }),
    );
  }
}
