import * as path from "@std/path";
import Namespace from "./namespace.ts";
import { error } from "./util.ts";
import { cmd, Function } from "@mageowl/conduit";
import { Selector } from "./cmd.ts";
import { Text } from "./cmd/text.ts";

export interface PackageSpecifier {
  name: string;
  version: Version;
  dependencies?: PackageSpecifier[];
}
export interface PackMetadata {
  package?: PackageSpecifier;
  description: string;
  minecraft: MinecraftVersion;
}

export type Version = `${number}.${number}${`.${number}` | ""}`;
const parseVersion = (v: Version) =>
  <[number, number] | [number, number, number]> v.split(".").map((v) =>
    parseInt(v)
  );

export type MinecraftVersion = "1.21.5";
function packFormat(minecraft: MinecraftVersion): number {
  switch (minecraft) {
    case "1.21.5":
      return 71;
  }
}

export default class Datapack {
  private namespaces: Map<string, Namespace> = new Map();
  private packFormat: number;
  private description: string;

  constructor(
    { package: specifier, minecraft, description }: PackMetadata,
  ) {
    this.packFormat = packFormat(minecraft);
    this.description = description;

    if (specifier != null) {
      this.buildVersioning(specifier);
    }
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

  private buildVersioning(specifier: PackageSpecifier) {
    const [major, minor] = parseVersion(specifier.version);

    const minecraftNs = this.namespace("minecraft");
    const onLoad = minecraftNs.tag("load", Function);

    const conduitNs = this.namespace("__conduit");
    const namespace = this.namespace(specifier.name);

    const versionCallback = namespace.add(
      "__conduit/version",
      new Function([
        cmd.scoreboard.players.set(
          specifier.name,
          "__conduit.version.major",
          major,
        ),
        cmd.scoreboard.players.set(
          specifier.name,
          "__conduit.version.minor",
          minor,
        ),
      ]),
    );
    const onVersion = conduitNs.tag("version", Function);
    onVersion.add(versionCallback);
    onLoad.addTag(onVersion);

    if (specifier.dependencies && specifier.dependencies.length > 0) {
      const dependencyCallback = namespace.add(
        "__conduit/dependencies",
        new Function(
          specifier.dependencies.flatMap((dep) => {
            const [major, minor] = parseVersion(dep.version);
            const error = cmd.tellraw(
              Selector.all(),
              Text.from(
                "",
                Text.from(`[${specifier.name}]`).color("red"),
                ` Can't find dependency ${dep.name}.`,
              ),
            );
            return [
              cmd.Execute.if().score(
                dep.name,
                "__conduit.version.major",
                "<",
                major,
              ).run(error),
              cmd.Execute.unless().score(
                dep.name,
                "__conduit.version.major",
                "<",
                major,
              ).if().score(
                dep.name,
                "__conduit.version.minor",
                "<",
                minor,
              ).run(error),
            ];
          }),
        ),
      );

      conduitNs.tag("dependency_check", Function).add(dependencyCallback);
    }
  }
}
