import type Namespace from "../namespace.ts";
import { JSONMember, Member } from "../member.ts";
import type { PackType } from "../pack.ts";
import type { OutputFile } from "../output.ts";
import { type JSONValue, type Serializable, serialize } from "../serialize.ts";

export class Include extends Member<PackType> {
  static override readonly dataFolder: string = "";
  // This is specially reassigned by Namespace.
  static override readonly fileExtension: string = "";

  fromPath: string;

  constructor(from: string) {
    super();
    this.fromPath = from;

    // Make sure we have access to reading from the current directory.
    Deno.permissions.requestSync({ name: "read", path: "." });
  }

  override add(_namespace: Namespace<PackType>, _name: string): void {}

  override save(file: OutputFile): void {
    const bytes = Deno.readFileSync(this.fromPath);
    file.write(bytes);
  }
}

export class JSONInclude extends JSONMember<PackType> {
  static override readonly dataFolder: string = "";

  data: Serializable;

  constructor(data: Serializable) {
    super();
    this.data = data;
  }

  override add(_namespace: Namespace<PackType>, _name: string): void {}

  override saveJSON(): JSONValue {
    return serialize(this.data);
  }
}
