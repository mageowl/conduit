import * as path from "@std/path";
import {
  type Appendable,
  Identifier,
  type Macro,
  Member,
  type MemberType,
} from "./member.ts";

import { error } from "./util.ts";
import { Include } from "./member/include.ts";
import Tag, { type HardCodedRegistry, RegistryTag } from "./tag.ts";
import type { PackType } from "./pack.ts";
import type Output from "./output.ts";

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
  private registryTags: Map<
    HardCodedRegistry,
    Map<string, RegistryTag<HardCodedRegistry>>
  > = new Map();

  constructor(
    public name: string,
    public packFormat: number | [number, number],
  ) {}

  reserve<T extends Member<Type>, U extends unknown[]>(
    path: string,
    constructor: new (...args: U) => T,
  ): Identifier<T> {
    let set: Set<string>;
    if (this.reserved.has(constructor.name)) {
      set = this.reserved.get(constructor.name)!;
    } else {
      set = new Set();
      this.reserved.set(constructor.name, set);
    }

    if (set.has(path)) {
      error(`The member '${path}' is already defined.`);
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
    }
    map.set(identifier.path, member);
  }

  add<T extends Member<Type>>(
    path: string,
    member: T,
  ): Identifier<T>;
  add<O>(
    path: string,
    member: Macro<Type, O>,
  ): O;
  add<T extends Member<Type> | Macro<Type, O>, O>(
    path: string,
    member: T,
  ): Identifier<T> | O {
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

      if (this.reserved.has(member.constructor.name)) {
        this.reserved.get(member.constructor.name)!.delete(path);
      }

      if (map.has(path)) {
        error(`The member '${path}' is already defined.`);
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
      }

      return member.callback(this, path);
    }
  }
  appendOrCreate<T extends Member<Type> & Appendable>(
    path: string | Identifier<T>,
    member: T,
  ): Identifier<T> {
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

    if (map.has(path instanceof Identifier ? path.path : path)) {
      const other = map.get(path)! as T;
      other.append(member);
    } else {
      map.set(path, member);
    }

    return path instanceof Identifier ? path : new Identifier(this.name, path);
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
      const tag = new Tag<T>(new Identifier(this.name, name));
      map.set(name, tag);
      return tag;
    }
  }
  registryTag<T extends HardCodedRegistry>(
    name: string,
    reg: T,
  ): RegistryTag<T> {
    let map;
    if (this.registryTags.has(reg)) {
      map = this.registryTags.get(reg)!;
    } else {
      map = new Map();
      this.registryTags.set(reg, map);
    }

    if (map.has(reg)) {
      return map.get(reg)!;
    } else {
      const tag = new RegistryTag<T>(new Identifier(this.name, name));
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
      }
    });
  }

  save(output: Output) {
    this.validate();

    this.members.values().forEach(
      ({ map, dataFolder, fileExtension }) => {
        const foldersCreated = ["."];
        output.mkdir(dataFolder);

        map.forEach((member, name) => {
          const dirname = path.dirname(name);
          if (!foldersCreated.includes(dirname)) {
            output.mkdir(path.join(dataFolder, dirname), {
              recursive: true,
            });
          }
          foldersCreated.push(dirname);

          const filePath = member instanceof Include
            ? name + path.extname(member.fromPath)
            : (path.join(dataFolder, name) +
              `.${fileExtension}`);
          member.save(output.file(filePath));
        });
      },
    );

    if (this.tags.size > 0 || this.registryTags.size > 0) {
      output.mkdir("tags");
      this.tags.forEach((map, constructor) => {
        const dataPath = path.join("tags", constructor.dataFolder);
        const foldersCreated = ["."];
        output.mkdir(dataPath);

        map.forEach((tag, name) => {
          const dirname = path.dirname(name);
          if (!foldersCreated.includes(dirname)) {
            output.mkdir(path.join(dataPath, dirname), {
              recursive: true,
            });
          }
          foldersCreated.push(dirname);

          output.writeFile(
            path.join(dataPath, name) + ".json",
            JSON.stringify(tag.toJSON()),
          );
        });
      });
      this.registryTags.forEach((map, reg) => {
        const dataPath = path.join("tags", reg);
        const foldersCreated = ["."];
        output.mkdir(dataPath);

        map.forEach((tag, name) => {
          const dirname = path.dirname(name);
          if (!foldersCreated.includes(dirname)) {
            output.mkdir(path.join(dataPath, dirname), {
              recursive: true,
            });
          }
          foldersCreated.push(dirname);

          output.writeFile(
            path.join(dataPath, name) + ".json",
            JSON.stringify(tag.toJSON()),
          );
        });
      });
    }
  }

  toString(): string {
    return this.name;
  }
}
