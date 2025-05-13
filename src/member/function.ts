import Namespace, { Member } from "../namespace.ts";

export default class Function extends Member {
  override readonly fileExtension = "mcfunction";
  override readonly dataFolder = "function";

  body: string[];

  constructor(body: string[]) {
    super();
    this.body = body.map((line) => line.replaceAll("\n", ""));
  }

  override add(namespace: Namespace, name: string): void {}

  override async save(filePath: string) {
    const encoder = new TextEncoder();
    const file = await Deno.create(filePath);
    file.write(encoder.encode(this.body.join("\n")));
  }
}
