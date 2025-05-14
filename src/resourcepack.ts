import { MinecraftVersion, PackMetadata } from "./pack.ts";

interface ResourcepackMetadata extends PackMetadata {
}

function resourcepackFormat(minecraft: MinecraftVersion): number {
  switch (minecraft) {
    case "1.21.5":
      return 71;
  }
}

export default class Resourcepack {
}
