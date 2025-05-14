import type Namespace from "../namespace.ts";
import { Member } from "../member.ts";

export default class Function extends Member<"data"> {
  static override readonly fileExtension = "mcfunction";
  static override readonly dataFolder = "function";

  body: string[];

  constructor(body: string[]) {
    super();
    this.body = body.map((line) => line.replaceAll("\n", ""));
  }

  override add(_namespace: Namespace<"data">, _name: string): void {}

  override async save(filePath: string) {
    const encoder = new TextEncoder();
    const file = await Deno.create(filePath);
    file.write(encoder.encode(this.body.join("\n")));
  }
}
