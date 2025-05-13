import * as path from "@std/path";
import type { JSONValue, Serialize } from "./serialize.ts";
import { error } from "./util.ts";
import Include from "./member/file.ts";

interface MemberMap {
  map: Map<string, Member>;
  dataFolder: string;
  fileExtension: string;
}

export default class Namespace {
  name: string;
  private reserved: Map<string, Set<string>> = new Map();
  private members: Map<string, MemberMap> = new Map();
  private macros: Map<number, Set<string>> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  reserve<T extends Member, U extends unknown[]>(
    path: string,
    constructor: new (...a: U) => T,
  ): Identifier<T> {
    let set: Set<string>;
    if (this.reserved.has(path)) {
      set = this.reserved.get(constructor.name)!;
    } else {
      set = new Set();
      this.reserved.set(constructor.name, set);
    }

    if (set.has(path)) {
      error(`The member '${path}' is already defined.`);
      Deno.exit(1);
    }
    set.add(path);

    return new Identifier(this.name, path);
  }

  initialize<T extends Member>(identifier: Identifier<T>, member: T) {
    const set = this.reserved.get(member.constructor.name);
    if (
      set == null ||
      !set.delete(
        identifier.path,
      )
    ) {
      error(`The identifier '${identifier}' was not previously reserved.`);
      Deno.exit(1);
    }

    let map;
    if (this.members.has(member.constructor.name)) {
      map = this.members.get(member.constructor.name)!.map;
    } else {
      map = new Map();
      this.members.set(member.constructor.name, {
        map,
        fileExtension: member.fileExtension,
        dataFolder: member.dataFolder,
      });
    }

    if (map.has(identifier.path)) {
      error(`The member '${identifier}' is already defined.`);
      Deno.exit(1);
    }
    map.set(identifier.path, member);
  }

  add<T extends Member>(path: string, member: T | Macro): Identifier<T> {
    if (member instanceof Member) {
      let map;
      if (this.members.has(member.constructor.name)) {
        map = this.members.get(member.constructor.name)!.map;
      } else {
        map = new Map();
        this.members.set(member.constructor.name, {
          map,
          fileExtension: member.fileExtension,
          dataFolder: member.dataFolder,
        });
      }

      if (map.has(path)) {
        error(`The member '${path}' is already defined.`);
        Deno.exit(1);
      }
      map.set(path, member);

      return new Identifier(this.name, path);
    } else {
      let set: Set<string>;
      if (this.macros.has(member.id)) {
        set = this.macros.get(member.id)!;
      } else {
        set = new Set();
        this.macros.set(member.id, set);
      }

      if (set.has(path)) {
        error(`The member '${path}' is already defined.`);
        Deno.exit(1);
      }
      member.callback(this, path);

      return new Identifier(this.name, path);
    }
  }

  validate() {
    this.reserved.values().forEach((set) => {
      if (set.size !== 0) {
        set.values().forEach((name) => {
          error(
            `The identifier '${this.name}:${name}' was reserved, but never initialized`,
          );
        });
        Deno.exit(1);
      }
    });
  }

  async save(savePath: string) {
    this.validate();

    await Deno.mkdir(savePath);
    await Promise.all(
      this.members.entries().map(
        async ([kind, { map, dataFolder, fileExtension }]) => {
          const dataPath = kind === "Include" ? savePath : path.join(
            savePath,
            dataFolder,
          );
          const foldersCreated = [""];
          await Deno.mkdir(dataPath);

          await Promise.all(
            map.entries().map(async ([name, member]) => {
              const dirname = path.dirname(name);
              if (!foldersCreated.includes(dirname)) {
                await Deno.mkdir(path.join(dataPath, dirname), {
                  recursive: true,
                });
              }

              const filePath = member instanceof Include
                ? path.join(member.folder, name) + path.extname(member.fromPath)
                : (path.join(dataPath, name) +
                  `.${fileExtension}`);
              await member.save(filePath);
            }),
          );
        },
      ),
    );
  }

  toString(): string {
    return this.name;
  }
}

export class Identifier<_T extends Member> implements Serialize {
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
export function macro<T extends unknown[]>(
  callback: (...args: T) => MacroCallback,
): (...args: T) => Macro {
  const id = macroId++;
  return (...args) => new Macro(callback(...args), id);
}

type MacroCallback = (namespace: Namespace, name: string) => void;
class Macro {
  readonly callback: MacroCallback;
  readonly id: number;

  constructor(callback: MacroCallback, id: number) {
    this.callback = callback;
    this.id = id;
  }
}

export abstract class Member {
  abstract readonly fileExtension: string;
  abstract readonly dataFolder: string;

  abstract add(namespace: Namespace, name: string): void;
  abstract save(filePath: string): Promise<void>;
}
export abstract class JSONMember extends Member {
  override readonly fileExtension = "json";

  abstract saveJSON(): JSONValue;
  override async save(filePath: string) {
    const encoder = new TextEncoder();
    const file = await Deno.create(filePath);
    file.write(encoder.encode(JSON.stringify(this.saveJSON())));
  }
}
