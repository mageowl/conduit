import * as path from "jsr:@std/path";
import { NBTValue } from "./types.ts";

interface MemberMap {
  map: Map<string, Member>;
  dataFolder: string;
  fileExtension: string;
}

export default class Namespace {
  name: string;
  private members: Map<string, MemberMap> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  add(name: string, member: Member | Macro) {
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
        throw new Error(`The member '${name}' is already defined.`);
      }
      map.set(name, member);
    } else {
      member(name, this);
    }
  }

  async save(savePath: string) {
    await Deno.mkdir(savePath);
    await Promise.all(
      this.members.entries().map(
        async ([, { map, dataFolder, fileExtension }]) => {
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

export abstract class Member {
  abstract readonly fileExtension: string;
  abstract readonly dataFolder: string;

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

export type Macro = (
  name: string,
  namespace: Namespace,
) => void;
