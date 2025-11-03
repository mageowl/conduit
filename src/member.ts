import type Namespace from "./namespace.ts";
import type { OutputFile } from "./output.ts";
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
  abstract save(file: OutputFile): void;
}
export abstract class JSONMember<Type extends PackType> extends Member<Type> {
  static override readonly fileExtension = "json";

  abstract saveJSON(): JSONValue;
  override save(file: OutputFile) {
    file.write(JSON.stringify(this.saveJSON()));
  }
}
export interface Appendable {
  append(other: this): void;
}

export class Identifier<T> implements Serialize {
  private readonly _constraint: T | undefined = undefined;

  constructor(
    public readonly namespace: string,
    public readonly path: string,
  ) {}

  toString(): string {
    return `${this.namespace}:${this.path}`;
  }
  serialize(): JSONValue {
    return this.toString();
  }
}

let macroId = 0;
export function macro<P extends PackType, U extends unknown[], O>(
  callback: (...args: U) => MacroCallback<P, O>,
): (...args: U) => Macro<P, O> {
  const id = macroId++;
  return (...args) => new Macro(callback(...args), id);
}

type MacroCallback<Type extends PackType, O> = (
  namespace: Namespace<Type>,
  name: string,
) => O;
export class Macro<Type extends PackType, O> {
  readonly callback: MacroCallback<Type, O>;
  readonly id: number;

  constructor(callback: MacroCallback<Type, O>, id: number) {
    this.callback = callback;
    this.id = id;
  }
}
