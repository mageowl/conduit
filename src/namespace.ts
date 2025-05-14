import * as path from "@std/path";
import { Identifier, type Macro, Member, type MemberType } from "./member.ts";

import { error } from "./util.ts";
import Include from "./member/include.ts";
import Tag from "./tag.ts";
import type { PackType } from "./pack.ts";

interface MemberMap<Type extends PackType> {
  map: Map<string, Member<Type>>;
  dataFolder: string;
  fileExtension: string;
}

export default class Namespace<Type extends PackType> {
  private reserved: Map<string, Set<string>> = new Map();
  private members: Map<string, MemberMap<Type>> = new Map();
  private macros: Map<number, Set<string>> = new Map();
  private tags: Map<
    MemberType<Type>,
    Map<string, Tag<Member<Type>>>
  > = new Map();

  constructor(public name: string) {}

  reserve<T extends Member<Type>, U extends unknown[]>(
    path: string,
    constructor: new (...args: U) => T,
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

  initialize<T extends Member<Type>>(identifier: Identifier<T>, member: T) {
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

  add<T extends Member<Type>>(
    path: string,
    member: T | Macro<Type>,
  ): Identifier<T> {
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

  tag<T extends Member<Type>>(
    name: string,
    constructor: MemberType<Type, T>,
  ): Tag<T> {
    let map;
    if (this.tags.has(constructor)) {
      map = this.tags.get(constructor)!;
    } else {
      map = new Map();
      this.tags.set(constructor, map);
    }

    if (map.has(name)) {
      return map.get(name)!;
    } else {
      const tag = new Tag<T>(new Identifier<Tag<T>>(this.name, name));
      map.set(name, tag);
      return tag;
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

    if (this.tags.size > 0) {
      await Deno.mkdir(path.join(savePath, "tags"));
      await Promise.all(
        this.tags.entries().map(async ([constructor, map]) => {
          const dataPath = path.join(savePath, "tags", constructor.dataFolder);
          const foldersCreated = [""];
          await Deno.mkdir(dataPath);

          await Promise.all(
            map.entries().map(async ([name, tag]) => {
              const dirname = path.dirname(name);
              if (!foldersCreated.includes(dirname)) {
                await Deno.mkdir(path.join(dataPath, dirname), {
                  recursive: true,
                });
              }

              const file = await Deno.create(
                path.join(dataPath, name) + ".json",
              );
              const encoder = new TextEncoder();
              const bytes = encoder.encode(JSON.stringify(tag.serialize()));
              await file.write(bytes);
            }),
          );
        }),
      );
    }
  }

  toString(): string {
    return this.name;
  }
}
