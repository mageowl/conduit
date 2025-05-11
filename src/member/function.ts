import { Member } from "../namespace.ts";

export default class Function extends Member {
  override readonly fileExtension = "mcfunction";
  override readonly dataFolder = "function";

  lines: string[];

  constructor(conf: string[]) {
    super();
    this.lines = conf.map((line) => line.replaceAll("\n", ""));
  }

  override async save(filePath: string) {
    const encoder = new TextEncoder();
    const file = await Deno.create(filePath);
    file.write(encoder.encode(this.lines.join("\n")));
  }
}
