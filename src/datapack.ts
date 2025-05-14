import * as path from "@std/path";
import { error } from "./util.ts";
import { Execute, scoreboard, Selector, tellraw } from "./cmd.ts";
import Function from "./member/function.ts";
import { Text } from "./cmd/text.ts";
import type { MinecraftVersion, PackMetadata, Version } from "./types.ts";
import { Pack, parseVersion } from "./pack.ts";

export interface Package {
  name: string;
  version: Version;
  dependencies?: Package[];
}

interface DatapackMetadata extends PackMetadata {
  package?: Package;
}

export default class Datapack extends Pack<"data"> {
  constructor(
    metadata: DatapackMetadata,
  ) {
    super(metadata);
    if (metadata.package != null) {
      this.buildVersioning(metadata.package);
    }
  }

  override getFormat(minecraft: MinecraftVersion): number {
    switch (minecraft) {
      case "1.21.5":
        return 71;
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

  private buildVersioning(specifier: Package) {
    const minecraftNs = this.namespace("minecraft");
    const onLoad = minecraftNs.tag("load", Function);

    const conduitNs = this.namespace("__conduit");
    const namespace = this.namespace(specifier.name);

    if (specifier.version) {
      const [major, minor] = parseVersion(specifier.version);

      const versionCallback = namespace.add(
        "__conduit/version",
        new Function([
          scoreboard.players.set(
            specifier.name,
            "__conduit.version.major",
            major,
          ),
          scoreboard.players.set(
            specifier.name,
            "__conduit.version.minor",
            minor,
          ),
        ]),
      );
      const onVersion = conduitNs.tag("version", Function);
      onVersion.add(versionCallback);
      onLoad.addTag(onVersion);
    }

    if (specifier.dependencies && specifier.dependencies.length > 0) {
      const dependencyCallback = namespace.add(
        "__conduit/dependencies",
        new Function(
          specifier.dependencies.flatMap((dep) => {
            const [major, minor] = parseVersion(dep.version);
            const error = tellraw(
              Selector.all(),
              Text.from(
                "",
                Text.from(`[${specifier.name}]`).color("red"),
                ` Can't find dependency ${dep.name}.`,
              ),
            );
            return [
              Execute.if().score(
                dep.name,
                "__conduit.version.major",
                "<",
                major,
              ).run(error),
              Execute.unless().score(
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
