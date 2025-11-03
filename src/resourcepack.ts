import { type MinecraftVersion, Pack, type PackMetadata } from "./pack.ts";

interface ResourcepackMetadata extends PackMetadata {}

export default class Resourcepack extends Pack<"assets"> {
  constructor({ ...metadata }: ResourcepackMetadata) {
    super(metadata);
  }

  protected override getFormat(
    minecraft: MinecraftVersion,
  ): number | [number, number] {
    switch (minecraft) {
      case "1.21.5":
        return 55;
      case "1.21.6":
        return 63;
      case "1.21.7":
      case "1.21.8":
        return 64;
      case "1.21.9":
      case "1.21.10":
        return [88, 0];
    }
  }
  protected override getTypeString(): "assets" {
    return "assets";
  }
}
