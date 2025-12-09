import { Execute, scoreboard, Selector, tellraw } from "./cmd.ts";
import Function from "./member/function.ts";
import { Text } from "./text.ts";
import type { MinecraftVersion, PackMetadata, Version } from "./types.ts";
import { Pack, parseVersion } from "./pack.ts";
import { scoreObjective } from "./cmd/scoreboard.ts";
import type Namespace from "./namespace.ts";

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
    { package: specifier, ...metadata }: DatapackMetadata,
  ) {
    super(metadata);
    if (specifier != null) {
      this.buildVersioning(specifier);
    }
  }

  protected override getFormat(
    minecraft: MinecraftVersion,
  ): number | [number, number] {
    switch (minecraft) {
      case "1.21.5":
        return 71;
      case "1.21.6":
        return 80;
      case "1.21.7":
      case "1.21.8":
        return 81;
      case "1.21.9":
      case "1.21.10":
        return [88, 0];
    }
  }
  protected override getTypeString(): "data" {
    return "data";
  }

  override namespace(name: string): Namespace<"data"> {
    if (name !== "minecraft") {
      const minecraftNs = super.namespace("minecraft");
      minecraftNs.tag("load", Function).additionalValues.push({
        id: `${name}:load`,
        required: false,
      });
      minecraftNs.tag("tick", Function).additionalValues.push({
        id: `${name}:tick`,
        required: false,
      });
    }
    return super.namespace(name);
  }

  private buildVersioning(specifier: Package) {
    const minecraftNs = this.namespace("minecraft");
    const onLoad = minecraftNs.tag("load", Function);

    const conduitNs = this.namespace("__conduit");
    conduitNs.add("version.major", scoreObjective());
    conduitNs.add("version.minor", scoreObjective());

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
              Selector.players(),
              Text.from(
                "",
                Text.of(`[${specifier.name}]`).color("red"),
                ` Can't find dependency '${dep.name}'.`,
              ),
            );
            return [
              Execute.unless.score(
                dep.name,
                "__conduit.version.major",
                ">=",
                major,
              ).run(error),
              Execute.if.score(
                dep.name,
                "__conduit.version.major",
                ">=",
                major,
              ).unless.score(
                dep.name,
                "__conduit.version.minor",
                ">=",
                minor,
              ).run(error),
            ];
          }),
        ),
      );

      const onDepCheck = conduitNs.tag("dependency_check", Function);
      onDepCheck.add(dependencyCallback);
      onLoad.addTag(onDepCheck);
    }
  }
}
