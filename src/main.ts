import Namespace from "./namespace.ts";
import * as path from "jsr:@std/path";
import { error } from "./util.ts";

export { JSONMember, macro, Member } from "./namespace.ts";
export type * from "./types.ts";
export * as cmd from "./cmd.ts";
export { default as ItemStack } from "./item.ts";

export { default as Function } from "./member/function.ts";
export { default as Advancement } from "./member/advancement.ts";
export { default as Recipe } from "./member/recipe.ts";

export { error, warning } from "./util.ts";

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
      const namespace = new Namespace(name);
      this.namespaces.set(name, namespace);
      return namespace;
    }
  }

  async save(savePath: string): Promise<boolean> {
    const readRes = await Deno.permissions.request({
      name: "read",
      path: savePath,
    });
    if (readRes.state != "granted") {
      error("Failed to save datapack. You need to allow read access.");
      return false;
    }
    const writeRes = await Deno.permissions.request({
      name: "write",
      path: savePath,
    });
    if (writeRes.state != "granted") {
      error("Failed to save datapack. You need to allow write access.");
      return false;
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

    console.log(`%c✅ Saved datapack to ${savePath}`, "font-weight:bold;");
    return true;
  }
}
