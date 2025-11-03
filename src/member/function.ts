import type Namespace from "../namespace.ts";
import { type Appendable, Member } from "../member.ts";
import type { OutputFile } from "../output.ts";

export type FunctionBody<A extends { [name: string]: string }> =
  | string[]
  | ((args: A) => string[]);

export default class Function<
  A extends { [name: string]: string } = Record<
    string | number | symbol,
    never
  >,
> extends Member<"data"> implements Appendable {
  static override readonly fileExtension = "mcfunction";
  static override readonly dataFolder = "function";

  private _constraint: A | undefined = undefined;
  body: string[];

  constructor(body: FunctionBody<A>) {
    super();
    let lines;
    if (typeof body === "function") {
      lines = body(
        new Proxy({}, {
          get(_, key) {
            return `$(${key.toString()})`;
          },
        }) as A,
      );
    } else {
      lines = body;
    }

    this.body = lines;
    // .map((line) => line.replaceAll("\n", ""))
    // why was this here???
  }

  append(other: this): void {
    this.body.push(...other.body);
  }

  override add(_namespace: Namespace<"data">, _name: string): void {}

  override save(file: OutputFile) {
    file.write(this.body.join("\n"));
  }
}
