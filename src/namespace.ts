import * as path from "jsr:@std/path";
import { NBTValue } from "./types.ts";
import { error } from "./util.ts";

interface MemberMap {
  map: Map<string, Member>;
  dataFolder: string;
  fileExtension: string;
}

export default class Namespace {
  name: string;
  private members: Map<string, MemberMap> = new Map();
  private macros: Map<number, Set<string>> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  add<T extends Member>(name: string, member: T | Macro): Identifier<T> {
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

      if (map.has(name)) {
        error(`The member '${name}' is already defined.`);
        Deno.exit(1);
      }
      map.set(name, member);

      return new Identifier(`${this.name}:${name}`);
    } else {
      let set: Set<string>;
      if (this.macros.has(member.id)) {
        set = this.macros.get(member.id)!;
      } else {
        set = new Set();
        this.macros.set(member.id, set);
      }

      if (set.has(name)) {
        error(`The member '${name}' is already defined.`);
        Deno.exit(1);
      }
      member.callback(this, name);

      return new Identifier(`${this.name}:${name}`);
    }
  }

  async save(savePath: string) {
    await Deno.mkdir(savePath);
    await Promise.all(
      this.members.values().map(
        async ({ map, dataFolder, fileExtension }) => {
          const dataPath = path.join(
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

              const filePath = path.join(dataPath, name) +
                `.${fileExtension}`;
              await member.save(filePath);
            }),
          );
        },
      ),
    );
  }

  toString() {
    return this.name;
  }
}

export class Identifier<_T extends Member> {
  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  toString() {
    return this.value;
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

  abstract saveJSON(): NBTValue;
  override async save(filePath: string) {
    const encoder = new TextEncoder();
    const file = await Deno.create(filePath);
    file.write(encoder.encode(JSON.stringify(this.saveJSON())));
  }
}
