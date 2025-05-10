import { Member } from "../namespace.ts";

export default class Function extends Member {
  override readonly fileExtension = "mcfunction";
  override readonly dataFolder = "function";

  private lines: string[];

  constructor(conf: string[]) {
    super();
    this.lines = conf;
  }

  override async save(filePath: string) {
    const encoder = new TextEncoder();
    const file = await Deno.create(filePath);
    file.write(encoder.encode(this.lines.join("\n")));
  }
}
