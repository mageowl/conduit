import type Namespace from "../namespace.ts";
import { Member } from "../member.ts";
import type { PackType } from "../pack.ts";

export default class Include extends Member<PackType> {
  // These are specially assigned by Namespace.
  static override readonly fileExtension: string = "";
  static override readonly dataFolder: string = "";

  fromPath: string;
  folder: string;

  constructor(from: string, folder: string) {
    super();
    this.fromPath = from;
    this.folder = folder;

    // Make sure we have access to reading from the current directory.
    Deno.permissions.requestSync({ name: "read", path: "." });
  }

  override add(_namespace: Namespace<PackType>, _name: string): void {}

  override async save(outPath: string): Promise<void> {
    const fromFile = await Deno.open(this.fromPath);
    const bytes = new Uint8Array();
    await fromFile.read(bytes);

    const outFile = await Deno.create(outPath);
    await outFile.write(bytes);
  }
}
