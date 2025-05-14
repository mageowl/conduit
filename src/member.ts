import type Namespace from "./namespace.ts";
import type { PackType } from "./pack.ts";
import type { JSONValue, Serialize } from "./serialize.ts";

export interface MemberType<Type extends PackType, T = Member<Type>> {
  fileExtension: string;
  dataFolder: string;
  new (...args: never[]): T;
}

export abstract class Member<Type extends PackType> {
  static readonly fileExtension: string;
  static readonly dataFolder: string;

  get fileExtension(): string {
    return (this.constructor as typeof Member).fileExtension;
  }
  get dataFolder(): string {
    return (this.constructor as typeof Member).dataFolder;
  }

  abstract add(namespace: Namespace<Type>, name: string): void;
  abstract save(filePath: string): Promise<void>;
}
export abstract class JSONMember<Type extends PackType> extends Member<Type> {
  static override readonly fileExtension = "json";

  abstract saveJSON(): JSONValue;
  override async save(filePath: string) {
    const encoder = new TextEncoder();
    const file = await Deno.create(filePath);
    file.write(encoder.encode(JSON.stringify(this.saveJSON())));
  }
}

export class Identifier<T> implements Serialize {
  private readonly _constraint: T | undefined = undefined;
  readonly namespace: string;
  readonly path: string;

  constructor(namespace: string, path: string) {
    this.namespace = namespace;
    this.path = path;
  }

  toString(): string {
    return `${this.namespace}:${this.path}`;
  }
  serialize(): JSONValue {
    return this.toString();
  }
}

let macroId = 0;
export function macro<T extends unknown[], P extends PackType>(
  callback: (...args: T) => MacroCallback<P>,
): (...args: T) => Macro<P> {
  const id = macroId++;
  return (...args) => new Macro(callback(...args), id);
}

type MacroCallback<Type extends PackType> = (
  namespace: Namespace<Type>,
  name: string,
) => void;
export class Macro<Type extends PackType> {
  readonly callback: MacroCallback<Type>;
  readonly id: number;

  constructor(callback: MacroCallback<Type>, id: number) {
    this.callback = callback;
    this.id = id;
  }
}
